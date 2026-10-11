(function(root){
  'use strict';
  const snapshot='2026-09-30';
  const schengen=['AT','BE','BG','HR','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH'];
  const eu=['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
  const sources={
    mutual:{title:'中国领事服务网 · 普通护照互免签证协定',url:'https://cs.mfa.gov.cn/gyls/lsgz/fwxx/202504/t20250414_11594222.shtml'},
    mexico:{title:'墨西哥驻华使馆 · 签证与豁免',url:'https://embamex.sre.gob.mx/china/index.php/zh/visas2'},
    panama:{title:'巴拿马驻美国使馆 · 2024 年修订与入境政策',url:'https://www.embassyofpanama.org/visas-1'},
    peru:{title:'中国驻秘鲁使馆 · 中国公民入境提醒',url:'https://pe.china-embassy.gov.cn/lsfws/zytz/202501/t20250101_11525199.htm'},
    montenegro:{title:'黑山政府 · 签证与旅行证件要求',url:'https://www.gov.me/en/article/visas'},
    costaRica:{title:'中国领事服务网 · 哥斯达黎加入境居留',url:'https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/gsdlj_656011/rjjl_656021/'},
    colombia:{title:'中国领事服务网 · 哥伦比亚入境政策',url:'https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/glby_658201/'},
    chile:{title:'中国领事服务网 · 智利入境居留',url:'https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/zl_658573/'},
    georgia:{title:'格鲁吉亚外交部 · 第三国证件免签',url:'https://france.mfa.gov.ge/fr/pays-pouvant-entrer-en-georgie-sans-visa-dans-des-conditions-appropriees'},
    georgiaBase:{title:'中国驻格鲁吉亚使馆 · 普通护照互免签证',url:'https://ge.china-embassy.gov.cn/eng/xwdt/202405/t20240527_11312569.htm'},
    thailand:{title:'中国驻泰国使馆 · 2026 年 9 月政策调整',url:'https://th.china-embassy.gov.cn/sgxw/202609/t20260902_12014753.html'},
    malaysia:{title:'马来西亚驻华使馆 · 互免签证协定',url:'https://www.kln.gov.my/web/chn_beijing/requirement_foreigner'},
    singapore:{title:'新加坡 ICA · 中国普通护照免签问答',url:'https://ask.gov.sg/ica/questions/clubwhv4p00l3314rcz6o76t7'},
    turkey:{title:'土耳其外交部 · 中国普通护照政策',url:'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa'},
    indonesia:{title:'印尼移民局 · 落地签适用国家',url:'https://bengkalis.imigrasi.go.id/2024/01/16/subjek-visa-kunjungan-saat-kedatangan-terbaru-2024/'},
    vietnam:{title:'越南国家旅游局 · 官方电子签指南',url:'https://vietnam.travel/plan-your-trip/official-vietnam-evisa-application'},
    schengen:{title:'欧盟委员会 · 申根签证政策',url:'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en'},
    schengenTravel:{title:'欧盟委员会 · 申根签证及居留旅行常见问题',url:'https://home-affairs.ec.europa.eu/document/download/dae5e071-1564-4a5d-9714-2147f7641781_en?filename=FAQs.pdf'},
    schengenTypes:{title:'意大利外交部 · 申根签证类型与适用地域',url:'https://www.esteri.it/en/servizi-opportunita/ingressosoggiornoinitalia/visto_ingresso/tipologie_visto_durata/'},
    uk:{title:'英国政府 · 签证要求名单（2025 年 12 月）',url:'https://assets.publishing.service.gov.uk/media/693045bd502f392086ee8b3f/UK_Visa_requirements_December_2025__1_.pdf'},
    us:{title:'中国领事服务网 · 美国入境居留',url:'https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/mg_656793/rjjl_656803/'},
    serbia:{title:'塞尔维亚外交部 · 中国普通护照',url:'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina'},
    japan:{title:'日本外务省 · 中国公民赴日签证',url:'https://www.mofa.go.jp/mofaj/toko/visa/topics/china.html'},
    morocco:{title:'中国领事服务网 · 摩洛哥入境居留',url:'https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlg_650861/'},
  };
  const policies={};
  const add=(code,status,maxDays,source,extra={})=>policies[code]={code,status,maxDays,source,verified:snapshot,rules:[],notes:[],...extra};
  const mutualCodes=['AL','AE','AZ','AG','BB','BS','BY','BA','DM','FJ','GD','KZ','QA','MV','MY','MU','WS','RS','SC','SM','SR','SB','TH','TO','UZ','SG','AM','GE'];
  for(const code of mutualCodes)add(code,'free',null,'mutual',{limitUnverified:true,notes:['已核实普通护照免签协定生效。该目的地的具体停留期限、累计停留和其他入境材料尚待逐项核实。']});
  add('TH','free',30,'thailand',{validFrom:'2026-09-15',window:'每 180 天累计不超过 90 天',fee:'免签无需签证费',notes:['需按规定填写泰国电子入境卡。此处采用 2026 年 9 月 15 日起的 30 天政策。','工作、学习、定居等活动应另行办理签证。']});
  add('SG','free',30,'singapore',{fee:'免签无需签证费',notes:['出行前核对 ICA 的入境卡、护照和离境行程要求。']});
  add('RS','free',30,'serbia',{fee:'免签无需签证费',notes:['中国普通护照可免签短期访问不超过 30 天。']});
  add('MY','free',30,'malaysia',{validFrom:'2025-07-17',window:'每 180 天累计不超过 90 天',fee:'免签无需签证费',notes:['免签适用于协定允许的短期活动。电子入境卡等申报要求需另行核对。']});
  add('TR','free',90,'turkey',{validFrom:'2026-01-02',window:'每 180 天累计不超过 90 天',fee:'免签无需签证费',notes:['中国普通护照自 2026 年 1 月 2 日起适用该免签政策。']});
  add('MA','free',90,'morocco',{fee:'免签无需签证费',notes:['中国公民可持护照免签入境，最长停留不超过 90 天。入境材料仍需核对。']});
  add('GE','free',30,'georgiaBase',{window:'每 180 天累计不超过 90 天',notes:['普通护照免签途径为单次不超过 30 天。第三国证件途径可能允许更长停留。']});
  add('ID','arrival',30,'indonesia',{fee:'以移民局申请页面为准',notes:['可在指定口岸办理落地签，也可提前申请 e-VOA。申请前核对护照、返程机票及适用口岸。']});
  add('VN','electronic',90,'vietnam',{fee:'以官方申请页面为准',notes:['所有国家和地区公民可申请电子签；签证需要提前获批。仅可使用官方公布的指定口岸。']});
  for(const code of schengen)add(code,'required',null,'schengen',{verified:'2026-10-03',additionalSources:['schengenTravel','schengenTypes'],notes:['没有适用证件时，短期旅游需提前办理申根签证。在“我的证件”中选择已有申根旅游签证或永居，可查看证件适用情况。','普通统一申根旅游签证适用于全部 29 个申根国；有效期、入境次数、获批停留天数及申根区累计停留额度均须遵守。','地域受限签证仅适用于签证上注明的国家；机场过境签证不属于本页默认的旅游签证。']});
  add('GB','required',null,'uk',{notes:['中国普通护照短期旅游通常需提前办理访问签证。过境规则另行核对。']});
  add('US','required',null,'us',{notes:['短期旅游需适用的美国签证或相应入境资格。签证、EVUS 和入境停留许可应分别核对。']});
  add('JP','required',null,'japan',{notes:['中国普通护照短期旅游应提前核对适用的日本签证类别和申请要求。']});
  add('EC','required',null,'mutual',{notes:['互免协定表明确注明：中国普通护照持有者赴厄瓜多尔目前需事先办理签证。']});
  for(const [code,source] of [['MX','mexico'],['PA','panama'],['PE','peru'],['ME','montenegro'],['CR','costaRica'],['CO','colombia'],['CL','chile']])add(code,'required',null,source,{notes:[]});
  const visaCountries=['US','CA','JP','GB',...schengen];
  const residenceCountries=[...visaCountries,'CL','CO','PE'];
  const rule=(id,title,issuers,types,maxDays,extra={})=>({id,title,issuers,types,maxDays,validity:'arrival',...extra});
  policies.MX.rules=[
    rule('mx-visa','凭指定国家多次签证免办墨西哥签证',visaCountries,['visa'],180,{multiple:true}),
    rule('mx-pr','凭指定国家永久居留免办墨西哥签证',residenceCountries,['permanent'],180),
  ];
  policies.MX.notes=['普通居留许可不能按永久居留处理。旅行目的限符合规定的非有偿短期活动。','停留天数由入境机关决定，上限不代表一定获准停留 180 天。'];
  policies.PA.rules=[rule('pa-visa','凭指定国家有效签证免办巴拿马签证',['US','CA','AU','KR','JP','GB','SG',...eu],['visa'],30),rule('pa-us-pr','凭美国永久居留卡免办巴拿马签证',['US'],['permanent'],30)];
  policies.PA.notes=['2024 年 10 月修订后的使馆说明要求入境时持有效签证；旧版的使用记录及六个月有效期条件不再作为本途径判断条件。','护照至少还有三个月有效期，需返程票和至少 500 美元资金证明。其他居留许可仅凭当前录入资料不能确认。'];
  policies.PE.rules=[rule('pe-visa','凭指定国家签证免办秘鲁签证',['US','CA','GB','AU',...schengen],['visa'],180,{minMonths:6}),rule('pe-pr','凭指定国家永久居留免办秘鲁签证',['US','CA','GB','AU',...schengen],['permanent'],180,{minMonths:6})];
  policies.PE.notes=['护照也须满足至少六个月有效期。此处仅匹配使馆明确列出的签证和永久居留，普通居留许可不自动适用。'];
  policies.ME.rules=[rule('me-visa','凭指定国家签证免办黑山签证',['US','CA','JP','AU','NZ','IE',...schengen],['visa'],30,{validity:'stay'}),rule('me-residence','凭指定国家居留许可免办黑山签证',['US','CA','GB','JP','AU','NZ','IE',...schengen],['permanent','residence'],30,{validity:'stay'})];
  policies.ME.notes=['获准停留不得超出签证或居留许可有效期。英国签证途径在该英文页面表述不清，首版仅自动匹配英国居留许可。','中国公民组织团体旅游还有单独便利途径，本页按个人旅游判断。护照需符合签发年限及离境后三个月有效期要求。'];
  policies.CR.rules=[rule('cr-us-ca','凭美国 / 加拿大证件免办旅游领事签证',['US','CA'],['visa','permanent','residence'],null,{minDays:1,multiple:true,excludeTransit:true,limitUnverified:true}),rule('cr-europe-residence','凭欧洲指定国家合法居留许可免办旅游领事签证',['GB','IS','NO','CH',...eu],['permanent','residence'],null,{minDays:90,multiple:true,excludeRefugee:true,limitUnverified:true})];
  policies.CR.notes=['护照自入境起至少还有六个月有效期。停留期限需向移民部门确认，本页不据此确认计划停留天数。','美国 C1 / C2 / C3 过境签证不适用该豁免。欧洲证件途径不接受难民或庇护类居留。'];
  policies.CO.rules=[rule('co-us','凭美国签证 / 居留许可免办哥伦比亚签证',['US'],['visa','permanent','residence'],90,{minDays:181,excludeTransit:true}),rule('co-schengen','凭申根签证 / 居留许可免办哥伦比亚签证',schengen,['visa','permanent','residence'],90,{minDays:181,excludeTransit:true})];
  policies.CO.notes=['入境时第三国证件剩余有效期须超过 180 天。申根签证需属于 C / D 类，过境签证不按此途径确认。'];
  policies.CL.rules=[rule('cl-visa','凭美国 / 加拿大签证免办智利签证',['US','CA'],['visa'],90,{minMonths:6,excludeTransit:true})];
  policies.CL.notes=['本途径要求非过境签证。首版未录入凭第三国永久居留的智利豁免，不据此判断。'];
  policies.GE.rules=[rule('ge-third','凭指定国家签证 / 居留适用更长免签停留',['US','CA','GB','AU','NZ','JP','KR','AE','SA','QA','BH','KW','OM','IL',...schengen,...eu],['visa','permanent','residence'],90,{validity:'arrival',source:'georgia',window:'每 180 天累计不超过 90 天'})];
  const data={snapshot,policies,sources,schengen,eu};
  root.VisaAtlasData=data;
  if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(globalThis);
