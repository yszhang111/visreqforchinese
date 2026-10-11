(async function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const {policies,sources,snapshot,schengen,eu}=VisaAtlasData;
  const {evaluateProfile,effectivePolicy}=VisaAtlasEngine;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const regionNames={Asia:'亚洲',Europe:'欧洲',Africa:'非洲',Americas:'美洲',Oceania:'大洋洲',Antarctic:'南极'};
  const statusNames={free:'免签',held:'已有证件',conditional:'有条件免签',arrival:'落地签',electronic:'电子签',required:'需办签证',unknown:'待核实',home:'护照签发地',permit:'专用旅行证件'};
  const typeNames={visa:'签证',permanent:'永久居留',residence:'普通居留许可'};
  const credentialNames={US:'美国',CA:'加拿大',AU:'澳洲',SCHENGEN:'申根',JP:'日本',GB:'英国'};
  const issuerGroups={SCHENGEN:schengen};
  const today=new Date(),policyDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const policyTrip={date:policyDate,days:1};
  const credentialName=doc=>`${credentialNames[doc.issuer]||byCode.get(doc.issuer)?.zh||doc.issuer}${doc.type==='visa'?'旅游签证':'永居'}`;
  const colors={free:'#52b6a0',held:'#4e879d',conditional:'#9481cd',arrival:'#67a9d3',electronic:'#e9c267',required:'#d79379',unknown:'#d9e1e4',home:'#19494b',permit:'#d9e1e4'};
  const [world,catalog,supplement,overviewWorld,regionalWorld]=await Promise.all(['assets/world.json','assets/countries.json','assets/small-country-boundaries.json','assets/world-overview.json','assets/world-regional.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error('资源加载失败');return response.json()}));
  const names=new Intl.DisplayNames(['zh-CN'],{type:'region'});
  const overrides={CN:'中国',HK:'中国香港',MO:'中国澳门',GB:'英国',US:'美国',KR:'韩国',KP:'朝鲜',MM:'缅甸',CZ:'捷克',CD:'刚果（金）',CG:'刚果（布）',CI:'科特迪瓦',TL:'东帝汶',CV:'佛得角'};
  const countries=catalog.map(c=>({...c,zh:overrides[c.code]||names.of(c.code)||c.zh}));
  const byCode=new Map(countries.map(c=>[c.code,c])),byId=new Map(countries.map(c=>[c.id,c]));
  policies.CN={status:'home',rules:[],notes:['本页以中国普通护照作为出行证件。']};
  for(const code of ['HK','MO','TW'])policies[code]={status:'permit',rules:[],notes:['持中国普通护照从内地赴该地区旅游时，通常需核对适用的通行证、签注或入境许可。本页不按外国签证免签政策判断。']};
  const state={selected:'MX',hasSelection:false,documents:[],filter:'all',region:'all',query:'',view:'map',panels:{profile:false,detail:false},filtersOpen:false,legendOpen:true};
  const baseline=new Map(countries.map(c=>[c.code,evaluateProfile(policies[c.code],[],policyDate,issuerGroups)]));
  let evaluation=new Map(),unlockedCodes=new Set(),projection,path,zoom,svg=d3.select('#world-map'),geoGroup,shapes,toastTimer;
  let projectedPaths={},shapeBounds=[],shapeNodes=[],shownShapes=[],shapeLevels=[],activeLevel='',cameraFrame=0,pendingCamera=d3.zoomIdentity,moving=false,tooltipFrame=0,tooltipEvent=null,tooltipCountry='';
  let mapWidth=0,mapHeight=0;
  let highlightLayer,hoveredCountry='';
  const originalBoundaries=new Map(supplement.features.map(f=>[f.id,f]));
  const features=topojson.feature(world,world.objects.countries).features.filter(f=>f.id!=='010').map(f=>originalBoundaries.get(f.id)||f);
  const decodeLevel=topology=>topojson.feature(topology,topology.objects.countries).features.filter(f=>f.id!=='010').map(f=>originalBoundaries.get(f.id)||f);
  const geometryLevels={overview:decodeLevel(overviewWorld),regional:decodeLevel(regionalWorld),detailed:features};
  const featureIndex=new Map(features.map((f,i)=>[f,i]));
  const featureById=new Map(features.map(f=>[f.id,f]));
  // Frame the main land masses; outlying islands can otherwise span the date line.
  const focusFeatureById=new Map(features.map(feature=>{
    if(feature.geometry.type!=='MultiPolygon')return [feature.id,feature];
    const parts=feature.geometry.coordinates.map(coordinates=>({coordinates,area:d3.geoArea({type:'Polygon',coordinates})}));
    const minimum=Math.max(...parts.map(part=>part.area))*.25;
    return [feature.id,{...feature,geometry:{type:'MultiPolygon',coordinates:parts.filter(part=>part.area>=minimum).map(part=>part.coordinates)}}];
  }));
  const maxZoom=65536;
  const current=c=>evaluation.get(c.code)||evaluateProfile(policies[c.code],state.documents,policyDate,issuerGroups);
  function matches(c){const r=current(c);return c.code!=='CN'&&(state.region==='all'||c.region===state.region)&&(state.filter==='all'||(state.filter==='unlocked'?unlockedCodes.has(c.code):state.filter==='conditional'?(policies[c.code]?.rules||[]).length>0:r.status===state.filter))&&(!state.query||[c.zh,c.name,c.code].some(v=>v.toLowerCase().includes(state.query.toLowerCase())));}
  const visible=()=>countries.filter(matches).sort((a,b)=>a.zh.localeCompare(b.zh,'zh-CN'));
  function notify(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
  function renderChrome(){
    for(const [name,label] of [['profile','已有签证与永居，解锁更多免签'],['detail','国家详情']]){
      const open=state.panels[name];$(name+'-panel').hidden=!open;$(name+'-toggle').setAttribute('aria-expanded',String(open));$(name+'-toggle').setAttribute('aria-label',(open?'收起':'展开')+label);$('workspace').classList.toggle(name+'-open',open);
    }
    $('profile-summary-label').textContent=unlockedCodes.size?`新增 ${unlockedCodes.size} 个目的地`:state.documents.length?`已选 ${state.documents.length} 项证件`:'看看还能去哪';
    $('profile-toggle').classList.toggle('has-discoveries',unlockedCodes.size>0);
    $('selected-country-label').textContent=state.hasSelection?byCode.get(state.selected).zh:'国家详情';
    $('filter-panel').hidden=!state.filtersOpen;$('filters-toggle').setAttribute('aria-expanded',String(state.filtersOpen));$('filters-toggle').setAttribute('aria-label',state.filtersOpen?'收起筛选':'展开筛选');
    const filtered=state.filter!=='all'||state.region!=='all';$('filters-toggle').classList.toggle('active',filtered);$('filter-label').textContent=filtered?'已筛选':'筛选';
    $('map-legend').hidden=!state.legendOpen;$('legend-toggle').setAttribute('aria-expanded',String(state.legendOpen));
    $('list-panel').hidden=state.view!=='list';$('country-grid').hidden=state.view!=='list';$('map-view').setAttribute('aria-pressed',String(state.view==='map'));$('list-view').setAttribute('aria-pressed',String(state.view==='list'));
    $('list-title').textContent=state.filter==='unlocked'?'新增免签目的地':'目的地列表';
    $('unlocked-filter').hidden=!unlockedCodes.size;
  }
  function setPanel(name,open,restoreFocus=false){
    state.panels[name]=open;if(open&&innerWidth<900)state.panels[name==='profile'?'detail':'profile']=false;
    if(open)state.view='map';renderChrome();if(restoreFocus)$(name+'-toggle').focus();
  }
  function setFilters(open){state.filtersOpen=open;if(open)$('search-results').hidden=true;renderChrome();}
  function selectCountry(code){if(!byCode.has(code))return;state.selected=code;state.hasSelection=true;state.view='map';state.query='';state.filtersOpen=false;$('country-search').value='';$('search-results').hidden=true;setPanel('detail',true);render();focusCountry(code);}
  function mapFrame(){
    const box=$('map-surface').getBoundingClientRect(),toolbar=$('map-toolbar').getBoundingClientRect();
    let left=24,right=box.width-24,top=Math.max(toolbar.bottom+22,innerWidth<700?142:104),bottom=box.height-88;
    if(state.legendOpen&&!$('map-legend').hidden)bottom=Math.min(bottom,$('map-legend').getBoundingClientRect().top-18);
    for(const name of ['profile','detail'])if(state.panels[name]){const panel=$(name+'-panel').getBoundingClientRect();if(innerWidth<700)bottom=Math.min(bottom,panel.top-18);else if(name==='profile')left=Math.max(left,panel.right+24);else right=Math.min(right,panel.left-24);}
    return {left,right:Math.max(left+80,right),top,bottom:Math.max(top+80,bottom)};
  }
  function focusCountry(code){
    if(!zoom||state.view!=='map')return;
    const feature=focusFeatureById.get(byCode.get(code)?.id);if(!feature)return;
    const [[x0,y0],[x1,y1]]=path.bounds(feature),frame=mapFrame(),w=frame.right-frame.left,h=frame.bottom-frame.top;
    const k=Math.max(1,Math.min(zoom.scaleExtent()[1],.78/Math.max((x1-x0)/w,(y1-y0)/h)));
    if(!Number.isFinite(k))return;
    const transform=d3.zoomIdentity.translate((frame.left+frame.right)/2,(frame.top+frame.bottom)/2).scale(k).translate(-(x0+x1)/2,-(y0+y1)/2);
    moveCamera(zoom.transform,transform,320);
  }
  function moveCamera(action,value,duration){svg.interrupt();if(matchMedia('(prefers-reduced-motion: reduce)').matches){svg.call(action,value);flushCamera();}else svg.transition().duration(duration).ease(d3.easeCubicOut).call(action,value);}
  function countryCard(c){const r=current(c),p=effectivePolicy(policies[c.code],policyTrip),ruleCount=policies[c.code]?.rules?.length||0,months=r.selected?.rule.maxMonths||(!r.selected&&!r.heldDoc&&p?.maxMonths);return `<button class="destination-card" data-country="${esc(c.code)}" aria-label="查看${esc(c.zh)}政策"><div class="card-top"><span class="country-abbr">${esc(c.code)}</span><span class="card-name">${esc(c.zh)}</span></div><p class="card-en">${esc(c.name)}</p><div class="card-status"><i class="swatch ${esc(r.status)}"></i>${esc(r.heldDoc||r.selected?.rule.label?r.label:statusNames[r.status])}${months?` · ${months} 个月`:r.maxDays?` · ${r.maxDays} 天`:''}</div>${r.heldDoc?'<p class="held-note">停留期限按证件规定</p>':r.selected?'<p class="match-note">所选证件有便利途径</p>':ruleCount?'<p class="match-note">有第三国证件便利途径</p>':r.status==='free'&&r.outcome==='pending'?'<p class="match-note">适用条件 / 停留期限待核实</p>':''}</button>`;}
  function sourceLink(key){const s=sources[key];return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`:'';}
  function issuerText(issuers){const set=new Set(issuers),parts=[];if(schengen.every(c=>set.has(c))){parts.push('申根国家');schengen.forEach(c=>set.delete(c));}if(eu.every(c=>set.has(c))){parts.push('欧盟国家');eu.forEach(c=>set.delete(c));}for(const code of set)parts.push(byCode.get(code)?.zh||code);return parts.join('、');}
  function ruleDescription(rule){const conditions=[`签发地：${issuerText(rule.issuers)}`,`证件：${rule.types.map(t=>typeNames[t]).join(' / ')}`];if(rule.multiple)conditions.push('允许多次入境');if(rule.entryOptions)conditions.push('允许两次或多次入境');if(rule.used)conditions.push('曾使用该签证入境签发国');if(rule.minMonths)conditions.push(`入境时剩余有效期至少 ${rule.minMonths} 个月`);else if(rule.minDays)conditions.push(`入境时剩余有效期${rule.minDays===181?'超过 180 天':`至少 ${rule.minDays} 天`}`);else conditions.push(rule.validity==='stay'?'有效期覆盖计划停留':'入境当日证件有效');if(rule.afterStayDays)conditions.push(`证件有效期至少超过计划离境日 ${rule.afterStayDays} 天`);if(rule.visaCodes){const touristCodes=rule.visaCodes.filter(code=>['B1/B2','B2','C'].includes(code));conditions.push(`旅游签证类别：${(touristCodes.length?touristCodes:rule.visaCodes).join(' / ')}`);}if(rule.categories)conditions.push('签证须属于政策允许的访问类别');if(rule.excludeTransit)conditions.push('不接受过境签证');if(rule.excludeRefugee)conditions.push('不接受难民 / 庇护类居留');if(rule.validFrom||rule.validUntil)conditions.push(`适用日期：${rule.validFrom||'不限'} 至 ${rule.validUntil||'未公布结束日期'}`);conditions.push(...(rule.manualChecks||[]));return conditions;}
  function renderDetails(){
    const c=byCode.get(state.selected),original=policies[c.code],p=effectivePolicy(original,policyTrip),r=current(c);
    const selectedRule=r.selected?.rule,months=selectedRule?.maxMonths||(!selectedRule&&!r.heldDoc&&p?.maxMonths);
    const days=r.heldDoc?'<small>按证件及入境许可规定</small>':selectedRule?.stayLabel?`<small>${esc(selectedRule.stayLabel)}</small>`:months?`${months} <small>个月</small>`:r.maxDays?`${r.maxDays} <small>天</small>`:'<small>待核实</small>';
    const heldNotes=r.heldScope==='schengen'?(r.heldDoc.type==='visa'?[
      '普通统一申根旅游签证（C 类）适用于全部 29 个申根国，无需逐国办理签证。',
      '在整个申根区内的短期停留，每 180 天累计最多 90 天；还须遵守签证上获批的停留天数和有效期。换一个申根国不会重新计算额度。',
      '单次入境指进入申根区一次；在申根国家之间旅行不消耗新的入境次数。离开申根区后再次进入，须有剩余入境次数。',
      '若签证注明有限的适用地域，只能前往所列国家。英国、爱尔兰及塞浦路斯不属于申根区，需另查其政策。'
    ]:[
      '持申根国签发的有效永久居留，可前往其他申根国短期旅行，无需另办申根旅游签证。',
      '在其他申根国的短期停留，每 180 天累计最多 90 天；在永居签发国的居留按当地规定。',
      '英国、爱尔兰及塞浦路斯不属于申根区，需另查其政策。'
    ]):r.heldDoc?[
      r.heldDoc.type==='visa'?'使用前核对已有签证的有效期、剩余入境次数和适用旅行用途；停留期限以本次入境许可为准。':'出行前确认永久居留证件和返回该国所需的旅行资格仍有效；居留期限按当地规定。',
      ...(c.code==='US'?p?.notes||[]:[])
    ]:[];
    const notes=heldNotes.length?heldNotes:selectedRule?.notes||p?.notes||[];
    const intro=`<div class="detail-intro"><span class="destination-code">${esc(c.code)}</span><h2>${esc(c.zh)}</h2><p>${esc(c.name)} · ${esc(regionNames[c.region]||c.region)}</p></div>`;
    const rules=(p?.rules||[]).map(rule=>{
      const matches=r.routes.filter(route=>route.rule.id===rule.id&&route.outcome==='available'),inactive=rule.validFrom&&policyDate<rule.validFrom||rule.validUntil&&policyDate>rule.validUntil;
      const requirements=ruleDescription(rule).filter(text=>!matches.length||!text.startsWith('签发地：')&&!text.startsWith('证件：'));
      const subset=matches.find(route=>route.issuerSubset)?.issuerSubset;
      if(subset)requirements.push(subset.length===schengen.filter(code=>eu.includes(code)).length&&subset.every(code=>eu.includes(code))?'此途径仅接受欧盟成员国签发的申根证件':`申根证件须由以下适用国家签发：${issuerText(subset)}`);
      return `<details class="detail-block policy-route" ${matches.length?'open':''}><summary><span>${esc(rule.title)}</span></summary><div class="policy-route-content">${matches.length?`<p class="route-selection">已选：${esc([...new Set(matches.map(route=>credentialName(route.doc)))].join('、'))}</p>`:''}<p>${rule.stayLabel?esc(rule.stayLabel):rule.maxMonths?`最多 ${rule.maxMonths} 个月`:rule.maxDays?`最多 ${rule.maxDays} 天`:'停留上限待核实'}${rule.window?`；${esc(rule.window)}`:''}</p>${inactive?'<p class="route-inactive">该途径不在当前有效期内</p>':''}<ul class="route-requirements">${requirements.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>${rule.source?`<p class="policy-note">${sourceLink(rule.source)}</p>`:''}</div></details>`;
    }).join('');
    const description=r.heldDoc?`已选：${credentialName(r.heldDoc)}。${r.heldScope==='schengen'?'可用于申根区内短期旅行，具体使用要求见下方。':'旅行及入境资格须符合该证件规定，具体使用要求见下方。'}`:!p?'该目的地资料尚待核实。':r.selected?'以下途径需满足所列条件。':r.status==='free'&&r.outcome==='pending'?'适用口岸、路线或停留上限见下方说明。':p?.rules?.length?'点击“解锁更多免签”，勾选已有旅游签证或永居，查看相关途径。':'';
    $('country-detail').innerHTML=intro+`<div class="status-banner ${esc(r.status)}">${esc(r.label)}</div>`+(description?`<p class="policy-note">${esc(description)}</p>`:'')+
      (p&&['home','permit'].includes(p.status)?'':`<dl class="detail-facts"><div><dt>${r.heldDoc||selectedRule?.stayLabel?'停留期限':'单次停留上限'}</dt><dd>${days}</dd></div></dl>`)+
      (p?.window&&!selectedRule&&!r.heldDoc?`<p class="policy-note">${esc(p.window)}</p>`:'')+
      (!r.heldDoc&&(p?.validFrom||p?.validUntil)?`<p class="policy-note">政策有效期：${esc(p.validFrom||'不限')} 至 ${esc(p.validUntil||'未公布结束日期')}</p>`:'')+
      (!r.heldDoc&&original&&p!==original?`<p class="policy-note">限期免签已不适用，当前显示其他入境途径。${sourceLink(original.source)}</p>`:'')+
      (!r.heldDoc&&p?.manualChecks?.length?`<div class="detail-block"><h3>适用条件</h3>${p.manualChecks.map(label=>`<p>${esc(label)}</p>`).join('')}</div>`:'')+(!r.heldDoc?rules:'')+
      (notes.length?`<div class="detail-block"><h3>${heldNotes.length?'证件使用范围':'入境要求'}</h3>${notes.map(note=>`<p>${esc(note)}</p>`).join('')}</div>`:'')+
      (!r.heldDoc&&p?.fee?`<div class="detail-block"><h3>签证费用</h3><p>${esc(p.fee)}</p></div>`:'')+
      `<div class="detail-block"><h3>官方依据</h3>${p?.source?sourceLink(p.source):'<p>资料尚待核实</p>'}${(p?.additionalSources||[]).map(key=>`<p>${sourceLink(key)}</p>`).join('')}${p?.verified?`<p class="secondary">资料核对：${esc(p.verified)}</p>`:''}</div>`;
  }
  function renderProfile(){
    document.querySelectorAll('[data-credential]').forEach(button=>button.setAttribute('aria-pressed',String(state.documents.some(doc=>doc.id===button.dataset.credential))));
    $('credential-count').textContent=state.documents.length?`已选 ${state.documents.length} 项`:'未选择证件';
    $('clear-credentials').disabled=!state.documents.length;
    const unlocked=countries.filter(c=>unlockedCodes.has(c.code)).sort((a,b)=>a.zh.localeCompare(b.zh,'zh-CN'));
    $('discovery-title').textContent=unlocked.length?`发现 ${unlocked.length} 个有条件免签目的地`:state.documents.length?'暂未发现新增免签目的地':'一张签证，不止一个目的地';
    $('discovery-description').textContent=unlocked.length?`${unlocked.slice(0,3).map(c=>c.zh).join('、')}${unlocked.length>3?'等':''}有凭所选证件免签的途径，具体条件见国家详情。`:state.documents.length?'当前资料未匹配到额外免签途径，可以试试其他签证或永居。':'已有美国、申根等签证或永居？勾选下方选项，看看还能免签去哪。';
    $('show-unlocked').hidden=!unlocked.length;
    $('show-unlocked').innerHTML=`查看这些国家（${unlocked.length}）<span aria-hidden="true">→</span>`;
    $('credential-discovery').classList.toggle('has-discoveries',unlocked.length>0);
  }
  function renderList(){if(state.view==='list'){const candidates=visible();$('country-grid').innerHTML=candidates.length?candidates.map(countryCard).join(''):'<p class="empty-message">没有找到符合筛选条件的目的地</p>';}}
  function paintHighlights(){
    if(!highlightLayer)return;
    const outlined=[];
    if(state.hasSelection)outlined.push({key:'selected',feature:featureById.get(byCode.get(state.selected)?.id)});
    if(hoveredCountry&&(!state.hasSelection||hoveredCountry!==state.selected))outlined.push({key:'hovered',feature:featureById.get(byCode.get(hoveredCountry)?.id)});
    highlightLayer.selectAll('path').data(outlined.filter(item=>item.feature),item=>item.key).join('path').attr('class',item=>'country-outline '+item.key+'-outline').attr('d',item=>projectedPaths[activeLevel][featureIndex.get(item.feature)]).style('display',item=>shownShapes[featureIndex.get(item.feature)]?'':'none');
    highlightLayer.raise();
  }
  function showTooltip(event,c){if(!c||moving)return;tooltipEvent={x:event.clientX,y:event.clientY,c};if(!tooltipFrame)tooltipFrame=requestAnimationFrame(()=>{tooltipFrame=0;if(moving||!tooltipEvent)return;const {x,y,c}=tooltipEvent,tooltip=$('map-tooltip');if(hoveredCountry!==c.code){hoveredCountry=c.code;paintHighlights();}if(tooltipCountry!==c.code){const r=current(c);tooltip.innerHTML=`${esc(c.zh)}<br><small>${esc(r.label)}</small>`;tooltipCountry=c.code;}tooltip.hidden=false;tooltip.style.left=Math.min(Math.max(x+14,6),innerWidth-tooltip.offsetWidth-8)+'px';tooltip.style.top=Math.min(Math.max(y-48,6),innerHeight-tooltip.offsetHeight-6)+'px';});}
  function hideTooltip(){tooltipEvent=null;$('map-tooltip').hidden=true;if(tooltipFrame){cancelAnimationFrame(tooltipFrame);tooltipFrame=0;}if(hoveredCountry){hoveredCountry='';paintHighlights();}}
  function drawCamera(transform){
    if(!geoGroup)return;
    const level=transform.k<=2.5?'overview':transform.k<=6?'regional':'detailed';
    const levelChanged=level!==activeLevel;
    activeLevel=level;
    const w=innerWidth,h=innerHeight,k=transform.k,x=transform.x,y=transform.y;
    for(let i=0;i<shapeNodes.length;i++){const [[x0,y0],[x1,y1]]=shapeBounds[i],visible=x1*k+x>=-40&&x0*k+x<=w+40&&y1*k+y>=-40&&y0*k+y<=h+40;if(visible&&shapeLevels[i]!==level){shapeNodes[i].setAttribute('d',projectedPaths[level][i]);shapeLevels[i]=level;}if(visible!==shownShapes[i]){shapeNodes[i].style.display=visible?'':'none';shownShapes[i]=visible;}}
    const overlays=geoGroup.selectAll('.pending-overlay').style('display',f=>shownShapes[featureIndex.get(f)]?'':'none');if(levelChanged)overlays.attr('d',f=>projectedPaths[level][featureIndex.get(f)]);
    const outlines=highlightLayer.selectAll('path').style('display',item=>shownShapes[featureIndex.get(item.feature)]?'':'none');if(levelChanged)outlines.attr('d',item=>projectedPaths[level][featureIndex.get(item.feature)]);
    geoGroup.attr('transform',transform);svg.select('#pending-pattern').attr('patternTransform',`scale(${1/k})`);geoGroup.selectAll('.map-label').attr('visibility',k>4?'hidden':'visible');
  }
  function scheduleCamera(transform){pendingCamera=transform;if(!cameraFrame)cameraFrame=requestAnimationFrame(()=>{cameraFrame=0;drawCamera(pendingCamera);});}
  function flushCamera(){if(cameraFrame){cancelAnimationFrame(cameraFrame);cameraFrame=0;}drawCamera(pendingCamera);}
  function drawMap(){
    const box=$('map-surface').getBoundingClientRect();if(!box.width||!box.height)return;
    const w=box.width,h=box.height;if(w===mapWidth&&h===mapHeight)return;mapWidth=w;mapHeight=h;svg.attr('viewBox',`0 0 ${w} ${h}`).selectAll('*').remove();
    svg.append('defs').append('pattern').attr('id','pending-pattern').attr('width',6).attr('height',6).attr('patternUnits','userSpaceOnUse').append('path').attr('d','M-1 1L1 -1 M0 6L6 0 M5 7L7 5').attr('stroke','#57428b').attr('stroke-width',1).attr('opacity',.35);
    geoGroup=svg.append('g');projection=d3.geoNaturalEarth1().fitExtent([[24,112],[w-24,h-86]],{type:'FeatureCollection',features});path=d3.geoPath(projection).digits(6);
    projectedPaths=Object.fromEntries(Object.entries(geometryLevels).map(([level,geometry])=>[level,geometry.map(path)]));shapeBounds=features.map(f=>path.bounds(f));activeLevel='overview';
    geoGroup.append('path').datum(d3.geoGraticule10()).attr('d',path).attr('class','map-graticule');
    shapes=geoGroup.selectAll('.country').data(features).join('path').attr('class','country').attr('d',(_,i)=>projectedPaths.overview[i]).attr('tabindex',-1).attr('aria-label',f=>byId.get(f.id)?.zh||f.properties.name).on('pointermove',(event,f)=>showTooltip(event,byId.get(f.id))).on('pointerleave',hideTooltip).on('click',(event,f)=>{const c=byId.get(f.id);if(c)selectCountry(c.code)});
    shapeNodes=shapes.nodes();shownShapes=features.map(()=>true);shapeLevels=features.map(()=>'overview');
    const labelPositions=[['太 平 洋',[-130,-15]],['大 西 洋',[-30,12]],['印 度 洋',[70,-25]]];geoGroup.selectAll('.map-label').data(labelPositions).join('text').attr('class','map-label').attr('x',d=>projection(d[1])[0]).attr('y',d=>projection(d[1])[1]).attr('text-anchor','middle').text(d=>d[0]);
    highlightLayer=geoGroup.append('g').attr('class','outline-layer');
    // Keep transformed SVG coordinates below the browser's 32M-pixel limit.
    const viewportMaxZoom=Math.min(maxZoom,16000000/Math.max(w,h));
    zoom=d3.zoom().scaleExtent([1,viewportMaxZoom]).translateExtent([[0,0],[w,h]]).extent([[0,0],[w,h]]).filter(e=>!e.ctrlKey&&(!e.button||e.type==='wheel')).on('start',()=>{moving=true;hideTooltip();$('map-surface').classList.add('is-moving');}).on('zoom',e=>scheduleCamera(e.transform)).on('end',()=>{moving=false;$('map-surface').classList.remove('is-moving');});svg.call(zoom).on('dblclick.zoom',null);svg.call(zoom.transform,d3.zoomIdentity);paintMap();flushCamera();
  }
  function paintMap(){if(!shapes)return;tooltipCountry='';shapes.attr('fill',f=>{const c=byId.get(f.id);return c?colors[current(c).status]:colors.unknown}).attr('class',f=>{const c=byId.get(f.id);return 'country'+(c?.code===state.selected?' selected':'')+(c&&c.code!=='CN'&&!matches(c)?' dim':'')});geoGroup.selectAll('.pending-overlay').data(features.filter(f=>{const c=byId.get(f.id);return c&&current(c).outcome==='pending'&&(current(c).selected||current(c).status==='free')}),f=>f.id).join('path').attr('class','pending-overlay').attr('d',f=>projectedPaths[activeLevel][featureIndex.get(f)]).attr('fill','url(#pending-pattern)').style('pointer-events','none').style('display',f=>shownShapes[featureIndex.get(f)]?'':'none').attr('opacity',f=>matches(byId.get(f.id))?1:.2);paintHighlights();}
  function render(){
    evaluation=new Map(countries.map(c=>[c.code,evaluateProfile(policies[c.code],state.documents,policyDate,issuerGroups)]));
    unlockedCodes=new Set(countries.filter(c=>{const r=current(c);return r.status==='conditional'&&r.selected&&baseline.get(c.code)?.status!=='free';}).map(c=>c.code));
    if(state.filter==='unlocked'&&!unlockedCodes.size)state.filter='all';
    const filtered=visible();const coverage=Object.values(policies).filter(p=>p.source).length;$('result-caption').textContent=state.filter==='all'&&state.region==='all'&&!state.query?`${filtered.length} 个国家 / 地区 · 已收录 ${coverage} 个目的地政策`:state.filter==='unlocked'?`${filtered.length} 个新增目的地 · 有条件免签`:`${filtered.length} 个国家 / 地区${state.filter==='conditional'?'有第三国证件便利途径':'符合当前筛选'}`;
    document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter)));
    renderChrome();
    renderProfile();renderDetails();renderList();paintMap();
  }
  function showSearch(){const query=state.query.trim();if(!query){$('search-results').hidden=true;return;}const results=visible().slice(0,10);$('search-results').innerHTML=results.length?results.map(c=>`<button class="search-result" data-country="${esc(c.code)}"><span>${esc(c.zh)} <small>${esc(c.name)}</small></span><span class="status-badge">${esc(statusNames[current(c).status])}</span></button>`).join(''):'<p class="empty-message">没有找到目的地，可清除其他筛选再试</p>';$('search-results').hidden=false;}
  const commonIssuers=['US','CA','AU','SCHENGEN','JP','GB'];
  const credentialButtons=(issuers,type)=>issuers.map(issuer=>`<button type="button" data-credential="${esc(type+'-'+issuer)}" data-issuer="${esc(issuer)}" data-type="${esc(type)}" aria-pressed="false"><span>${esc(credentialNames[issuer])}</span><span class="credential-check" aria-hidden="true">✓</span></button>`).join('');
  for(const type of ['visa','permanent'])$(type+'-options').innerHTML=credentialButtons(commonIssuers,type);
  $('profile-panel').addEventListener('click',event=>{
    const button=event.target.closest('[data-credential]');if(!button)return;
    const id=button.dataset.credential,found=state.documents.some(doc=>doc.id===id);
    if(found)state.documents=state.documents.filter(doc=>doc.id!==id);else state.documents.push({id,issuer:button.dataset.issuer,type:button.dataset.type});
    render();
  });
  $('clear-credentials').addEventListener('click',()=>{state.documents=[];render();});
  $('show-unlocked').addEventListener('click',()=>{
    state.filter='unlocked';state.region='all';state.query='';state.view='list';state.panels.profile=false;state.panels.detail=false;state.filtersOpen=false;
    $('country-search').value='';$('region-filter').value='all';$('search-results').hidden=true;render();$('list-title').setAttribute('tabindex','-1');$('list-title').focus();
  });
  document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
  $('status-filters').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(button){state.filter=button.dataset.filter;render();showSearch();}});
  $('region-filter').addEventListener('change',()=>{state.region=$('region-filter').value;render();showSearch();});
  $('country-search').addEventListener('input',()=>{state.query=$('country-search').value.trim();state.filtersOpen=false;render();showSearch();});
  $('country-search').addEventListener('keydown',event=>{if(event.key==='Escape'){$('search-results').hidden=true;}if(event.key==='Enter'){const first=$('search-results').querySelector('[data-country]');if(first)selectCountry(first.dataset.country);}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-country]');if(button)selectCountry(button.dataset.country);else if(!event.target.closest('.search-results,.search-box'))$('search-results').hidden=true;});
  document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]'))return;if(event.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();$('country-search').focus();}if(event.key==='Escape'){if(!$('search-results').hidden){$('search-results').hidden=true;return;}if(state.filtersOpen){setFilters(false);$('filters-toggle').focus();}else if(state.view==='list'){state.view='map';renderChrome();$('list-view').focus();}else if(state.panels.detail)setPanel('detail',false,true);else if(state.panels.profile)setPanel('profile',false,true);}});
  $('profile-toggle').addEventListener('click',()=>setPanel('profile',!state.panels.profile));$('profile-close').addEventListener('click',()=>setPanel('profile',false,true));
  $('detail-toggle').addEventListener('click',()=>setPanel('detail',!state.panels.detail));$('detail-close').addEventListener('click',()=>setPanel('detail',false,true));
  $('filters-toggle').addEventListener('click',()=>setFilters(!state.filtersOpen));$('legend-toggle').addEventListener('click',()=>{state.legendOpen=!state.legendOpen;renderChrome();});
  $('map-view').addEventListener('click',()=>{state.view='map';render();});$('list-view').addEventListener('click',()=>{state.view='list';state.panels.profile=false;state.panels.detail=false;state.filtersOpen=false;render();});$('list-close').addEventListener('click',()=>{state.view='map';renderChrome();$('list-view').focus();});
  $('zoom-in').addEventListener('click',()=>{if(zoom)moveCamera(zoom.scaleBy,1.4,180);});$('zoom-out').addEventListener('click',()=>{if(zoom)moveCamera(zoom.scaleBy,1/1.4,180);});$('zoom-reset').addEventListener('click',()=>{if(zoom)moveCamera(zoom.transform,d3.zoomIdentity,300);});
  const covered=Object.values(policies).filter(p=>p.source).length;
  $('sources-content').innerHTML=`<p>当前以中国普通护照、个人短期旅游为查询范围。已录入 ${covered} 个目的地的政策资料；已覆盖索引中的外国独立国家及巴勒斯坦、库克群岛、纽埃；部分海外属地及特殊地区仍显示“待核实”。具体停留期限和适用条件以详情为准。</p><p>资料快照：${esc(snapshot)}。每个目的地保留官方链接。页面按当前日期判断已公布的临时政策是否适用，不自动同步后续政策变化。</p><h3>如何理解结果</h3><ul><li>绿色：普通护照免签；具体天数以右侧详情为准。</li><li>蓝色“已有证件”：所选签证或永居适用于目的地。申根旅游签证覆盖全部 29 个申根国；停留期限和入境次数仍按证件规定。</li><li>紫色：所选旅游签证或永居有免签途径；有效期、入境次数、使用记录等要求见国家详情。</li><li>斜线：免签的口岸、路线或停留上限仍须核对。</li><li>“第三国证件”筛选显示免签及其他便利途径；新西兰等仍需提前申请电子授权。</li><li>旅游签证与永久居留分别选择，签证默认按旅游用途查询。申根为区域选项，部分途径只接受其中指定国家签发的证件。</li></ul><p>勾选签发地与证件类型即可查看便利途径，不收集证件到期日、入境次数或使用记录；这些要求保留在国家详情中。选择仅保存在当前页面，刷新后清空。</p><h3>资料来源</h3><ul>${Object.keys(sources).map(key=>`<li>${sourceLink(key)}</li>`).join('')}</ul><p>地图边界：Natural Earth / world-atlas；国家与地区索引：mledoze/countries。地图颜色表达签证资料状态。</p>`;
  $('about-button').addEventListener('click',()=>$('sources-dialog').showModal());
  new ResizeObserver(()=>{if(innerWidth<900&&state.panels.profile&&state.panels.detail){state.panels.profile=false;renderChrome();}drawMap()}).observe($('map-surface'));
  render();drawMap();
  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
    const inputSchema={type:'object',properties:{countryCode:{type:'string',pattern:'^[A-Z]{2}$'}},required:['countryCode'],additionalProperties:false};
    const validate=input=>{if(!input||Object.keys(input).some(key=>key!=='countryCode')||typeof input.countryCode!=='string'||!byCode.has(input.countryCode))throw new Error('无效的目的地代码');return input.countryCode;};
    register({name:'read_visa_requirements',title:'读取目的地签证要求',description:'按已选择的旅游签证 / 永居读取一个目的地的已录入政策及匹配结果。',inputSchema,annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){const c=byCode.get(validate(input)),r=current(c),p=effectivePolicy(policies[c.code],policyTrip),sourceKey=r.heldScope==='schengen'?'schengenTravel':r.selected?.rule.source||p?.source;return {country:c.zh,code:c.code,status:r.status,label:r.label,selectedDocuments:state.documents,policyDate,maxDays:r.maxDays,outcome:r.outcome,source:sourceKey?sources[sourceKey]:null,snapshot,limitations:'按签发地 / 证件类型列出可用途径；具体签证条件和入境要求见官方依据'};}});
    register({name:'select_visa_destination',title:'查看目的地政策',description:'在地图中选中目的地并打开政策详情，不修改证件选择。',inputSchema,annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){selectCountry(validate(input));return {selected:state.selected,label:current(byCode.get(state.selected)).label};}});
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})().catch(error=>{console.error(error);document.getElementById('result-caption').textContent='地图加载失败';document.getElementById('map-surface').insertAdjacentHTML('beforeend','<div class="load-error">地图资源未能加载，请刷新页面重试。若问题持续，可稍后重新打开。</div>');});
