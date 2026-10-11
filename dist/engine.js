(function(root){
  'use strict';
  const DAY=86400000;
  const dateMs=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return NaN;const ms=Date.parse(s+'T00:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===s?ms:NaN;};
  function addMonths(s,months){const ms=dateMs(s);if(!Number.isFinite(ms))return NaN;const d=new Date(ms),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.getTime();}
  const check=(label,status)=>({label,status});
  const activeAt=(record,trip)=>(!record.validFrom||trip.date>=record.validFrom)&&(!record.validUntil||trip.date<=record.validUntil);
  const limitDays=(record,trip)=>record.maxMonths?Math.round((addMonths(trip.date,record.maxMonths)-dateMs(trip.date))/DAY):record.maxDays;
  const freeLabel=policy=>policy.label||(policy.authorization?`免签 · 需 ${policy.authorization}`:policy.manualChecks?.length?'免签 · 适用条件见详情':policy.limitUnverified?'免签 · 停留上限待核实':'普通护照免签');
  function effectivePolicy(policy,trip){
    if(!policy)return policy;
    const limit=limitDays(policy,trip);
    return policy.fallback&&(!activeAt(policy,trip)||(limit!=null&&trip.days>limit))?effectivePolicy(policy.fallback,trip):policy;
  }
  const visaCode=value=>String(value||'').toUpperCase().replace(/[\s-]/g,'').replace(/^B1B2$/,'B1/B2');
  function evaluateRule(rule,doc,trip){
    if(!rule.issuers.includes(doc.issuer)||!rule.types.includes(doc.type))return null;
    const arrival=dateMs(trip.date),expiry=dateMs(doc.expiry);
    const checks=[check('签发国与证件类型在适用范围内','pass')];
    if(rule.validFrom||rule.validUntil)checks.push(check(`此途径适用日期：${rule.validFrom||'不限'} 至 ${rule.validUntil||'未公布结束日期'}`,activeAt(rule,trip)?'pass':'fail'));
    checks.push(check('入境当日证件已生效且未被撤销',doc.validity==='valid'?'pass':doc.validity==='invalid'?'fail':'pending'));
    let threshold=arrival;
    let validityLabel='入境时证件仍有效';
    if(rule.validity==='stay'){threshold=arrival+(trip.days-1)*DAY;validityLabel='证件有效期覆盖本次停留';}
    if(rule.afterStayDays){threshold=arrival+(trip.days-1+rule.afterStayDays)*DAY;validityLabel=`证件有效期至少超过计划离境日 ${rule.afterStayDays} 天`;}
    if(rule.minDays){threshold=arrival+rule.minDays*DAY;validityLabel=`入境时剩余有效期${rule.minDays===181?'超过 180 天':`至少 ${rule.minDays} 天`}`;}
    if(rule.minMonths){threshold=addMonths(trip.date,rule.minMonths);validityLabel=`入境时剩余有效期至少 ${rule.minMonths} 个月`;}
    checks.push(check(validityLabel,!Number.isFinite(expiry)||!Number.isFinite(threshold)?'pending':expiry>=threshold?'pass':'fail'));
    if(rule.multiple)checks.push(check('允许多次入境',!doc.entries||doc.entries==='unknown'?'pending':doc.entries==='multiple'?'pass':'fail'));
    if(rule.entryOptions)checks.push(check('允许两次或多次入境',!doc.entries||doc.entries==='unknown'?'pending':rule.entryOptions.includes(doc.entries)?'pass':'fail'));
    if(rule.used)checks.push(check('已使用该签证入境签发国',!doc.used||doc.used==='unknown'?'pending':doc.used==='yes'?'pass':'fail'));
    if(rule.excludeTransit&&doc.type==='visa')checks.push(check('属于可适用的非过境签证',!doc.category||doc.category==='unknown'?'pending':doc.category==='transit'?'fail':['visitor','study','work'].includes(doc.category)?'pass':'pending'));
    if(rule.excludeRefugee)checks.push(check('属于非难民 / 庇护类居留',!doc.category||doc.category==='unknown'?'pending':doc.category==='refugee'?'fail':doc.category==='standard'?'pass':'pending'));
    if(rule.categories)checks.push(check('签证用途属于政策允许的类别',!doc.category||doc.category==='unknown'?'pending':rule.categories.includes(doc.category)?'pass':'fail'));
    if(rule.visaCodes)checks.push(check(`签证类别代码属于 ${rule.visaCodes.join(' / ')}`,!visaCode(doc.visaCode)?'pending':rule.visaCodes.includes(visaCode(doc.visaCode))?'pass':'fail'));
    const limit=limitDays(rule,trip);
    if(limit!=null)checks.push(check(`计划停留不超过 ${rule.maxMonths?`${rule.maxMonths} 个月（按入境日期为 ${limit} 天）`:`${limit} 天`}`,trip.days<=limit?'pass':'fail'));
    if(rule.limitUnverified)checks.push(check('核实本次计划停留期限','pending'));
    for(const label of rule.manualChecks||[])checks.push({...check(label,'pending'),manual:true});
    const outcome=checks.some(c=>c.status==='fail')?'fail':checks.some(c=>c.status==='pending')?'pending':'pass';
    return {rule,doc,checks,outcome};
  }
  function evaluate(originalPolicy,documents,trip){
    const policy=effectivePolicy(originalPolicy,trip);
    if(!policy)return {status:'unknown',label:'政策待核实',outcome:'pending',maxDays:null,routes:[],selected:null};
    if(policy.status==='home'||policy.status==='permit')return {status:policy.status,label:policy.label||(policy.status==='home'?'护照签发地':'需核对专用旅行证件'),outcome:'pending',maxDays:null,routes:[],selected:null};
    const routes=(policy.rules||[]).flatMap(rule=>documents.map(doc=>evaluateRule(rule,doc,trip)).filter(Boolean));
    const sort=(a,b)=>Number(!!b.rule.unlimitedStay)-Number(!!a.rule.unlimitedStay)||(limitDays(b.rule,trip)||0)-(limitDays(a.rule,trip)||0);
    const passed=routes.filter(r=>r.outcome==='pass').sort(sort),pending=routes.filter(r=>r.outcome==='pending').sort(sort);
    const baseExpired=!activeAt(policy,trip);
    const baseLimit=limitDays(policy,trip);
    const baseFits=baseLimit==null||trip.days<=baseLimit;
    const baseFree=policy.status==='free'&&!baseExpired&&baseFits;
    const baseNeedsCheck=policy.limitUnverified||(policy.manualChecks||[]).length>0;
    if(baseFree&&!baseNeedsCheck)return {status:'free',label:freeLabel(policy),outcome:'pass',maxDays:baseLimit,routes,selected:null};
    const routeResult=(route,outcome)=>({status:route.rule.status||'conditional',label:route.rule.label|| (route.rule.status==='electronic'?`需提前申请 ${route.rule.authorization||'电子许可'} · ${outcome==='pass'?'已匹配':'条件待核对'}`:`有条件免签 · ${outcome==='pass'?'已匹配':'待补充 / 核对'}`),outcome,maxDays:limitDays(route.rule,trip),routes,selected:route});
    if(passed.length)return routeResult(passed[0],'pass');
    if(pending.length&&(!baseFree||policy.preferCredentialRoute))return routeResult(pending[0],'pending');
    if(baseExpired)return {status:'unknown',label:'该日期政策待核实',outcome:'pending',maxDays:null,routes,selected:null};
    if(!baseFits)return {status:'required',label:'停留超出已录入期限',outcome:'fail',maxDays:baseLimit,routes,selected:null};
    const labels={free:freeLabel(policy),arrival:'可办理落地签',electronic:policy.electronicName?`需提前申请 ${policy.electronicName}`:'需提前申请电子签',required:'需提前办理签证',unknown:'政策待核实'};
    return {status:policy.status,label:policy.label||labels[policy.status]||'政策待核实',outcome:baseNeedsCheck?'pending':'pass',maxDays:baseLimit,routes,selected:null};
  }
  // Simple country/type selection discovers routes; it never fabricates expiry, entries or usage.
  function evaluateProfile(originalPolicy,documents,date,issuerGroups={}){
    const trip={date,days:1},policy=effectivePolicy(originalPolicy,trip);
    if(!policy)return {status:'unknown',label:'政策待核实',outcome:'pending',maxDays:null,routes:[],selected:null};
    if(['home','permit'].includes(policy.status))return {status:policy.status,label:policy.label||(policy.status==='home'?'护照签发地':'需核对专用旅行证件'),outcome:'available',maxDays:null,routes:[],selected:null};
    const routes=(policy.rules||[]).flatMap(rule=>documents.map(doc=>{
      if(!['visa','permanent'].includes(doc.type))return null;
      if(!rule.types.includes(doc.type))return null;
      if(doc.type==='visa'&&rule.categories&&!rule.categories.includes('visitor'))return null;
      const issuers=issuerGroups[doc.issuer]||[doc.issuer],matching=issuers.filter(issuer=>rule.issuers.includes(issuer));
      if(!matching.length)return null;
      return {rule,doc,outcome:activeAt(rule,trip)?'available':'unavailable',issuerSubset:matching.length<issuers.length?matching:null};
    }).filter(Boolean));
    const available=routes.filter(route=>route.outcome==='available').sort((a,b)=>Number(!!b.rule.unlimitedStay)-Number(!!a.rule.unlimitedStay)||(limitDays(b.rule,trip)||0)-(limitDays(a.rule,trip)||0));
    const baseActive=activeAt(policy,trip);
    if(policy.status==='free'&&baseActive&&(!policy.preferCredentialRoute||!available.length))return {status:'free',label:freeLabel(policy),outcome:policy.limitUnverified||policy.manualChecks?.length?'pending':'available',maxDays:policy.maxDays,routes,selected:null};
    const schengen=issuerGroups.SCHENGEN||[];
    const heldDoc=documents.filter(doc=>['visa','permanent'].includes(doc.type)&&doc.validity!=='invalid'&&(doc.issuer===policy.code||schengen.includes(policy.code)&&(doc.issuer==='SCHENGEN'||schengen.includes(doc.issuer)))).sort((a,b)=>Number(b.type==='permanent')-Number(a.type==='permanent'))[0];
    if(heldDoc){
      const heldScope=schengen.includes(policy.code)?'schengen':'destination';
      return {status:'held',label:`已有${heldScope==='schengen'?'申根':'该国'}${heldDoc.type==='visa'?'签证':'永居'}`,outcome:'available',maxDays:null,routes,selected:null,heldDoc,heldScope};
    }
    if(available.length){const selected=available[0],status=selected.rule.status||'conditional';return {status,label:selected.rule.label||(status==='electronic'?`可凭所选证件申请 ${selected.rule.authorization||'电子许可'}`:'所选证件有免签途径'),outcome:'available',maxDays:selected.rule.maxDays,routes,selected};}
    if(!baseActive)return {status:'unknown',label:'现行日期政策待核实',outcome:'pending',maxDays:null,routes,selected:null};
    const labels={arrival:'可办理落地签',electronic:policy.electronicName?`需提前申请 ${policy.electronicName}`:'需提前申请电子签',required:'需提前办理签证',unknown:'政策待核实'};
    return {status:policy.status,label:policy.label||labels[policy.status]||'政策待核实',outcome:policy.limitUnverified?'pending':'available',maxDays:policy.maxDays,routes,selected:null};
  }
  root.VisaAtlasEngine={evaluate,evaluateRule,evaluateProfile,dateMs,addMonths,effectivePolicy,limitDays};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.VisaAtlasEngine;
})(globalThis);
