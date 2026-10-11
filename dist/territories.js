(function(root){
  'use strict';
  const data=root.VisaAtlasData;
  if(!data)throw new Error('Load policies.js before territories.js');
  const {policies,sources,schengen,eu}=data;
  const reviewed='2026-10-11';
  const source=(key,title,url)=>{sources[key]={title,url};return key;};
  const add=(code,status,maxDays,sourceKey,notes,extra={})=>policies[code]={code,status,maxDays,source:sourceKey,verified:reviewed,rules:[],notes,limitUnverified:maxDays==null&&!['required','permit'].includes(status),...extra};
  const rule=(id,title,issuers,types,maxDays,extra={})=>({id,title,issuers:[...new Set(issuers)],types,maxDays,validity:'arrival',...extra});
  const shortStay='每 180 天累计不超过 90 天；仍以本次入境批准为准';

  // Caribbean Netherlands: nationality-specific visa exemptions, not Schengen territory.
  const dutch=source('dutch-caribbean','荷兰政府 · 荷属加勒比签证与第三国证件豁免','https://www.netherlandsworldwide.nl/caribbean-visa/visa-needed-caribbean');
  const dutchStay=source('dutch-caribbean-stay','荷兰政府 · 荷属加勒比免签停留与材料要求','https://www.netherlandsworldwide.nl/caribbean-visa/travel-without-visa');
  for(const code of ['AW','BQ','CW','SX']){
    add(code,'required',90,dutch,['中国普通护照通常须办理加勒比签证；符合下列第三国证件豁免时可免办。','这些地区不属于申根区。加勒比签证不能用于前往欧洲申根区。'],{window:shortStay,additionalSources:[dutchStay]});
    policies[code].rules=[
      rule(code.toLowerCase()+'-visa','凭美／加／英／爱尔兰或申根多次签证免办加勒比签证',['US','CA','GB','IE',...schengen],['visa'],90,{multiple:true,window:shortStay,source:dutch,manualChecks:['美国 ESTA、加拿大 eTA 等旅行授权不等同于该多次入境签证']}),
      rule(code.toLowerCase()+'-residence','凭指定国家有效居留免办加勒比签证',['US','CA','GB','IE',...schengen,'GF','GP','MQ','YT','RE','BL','MF'],['permanent','residence'],90,{window:shortStay,source:dutch})
    ];
  }

  const bermuda=source('bermuda-entry','百慕大政府 · 入境证件及多次签证要求','https://www.gov.bm/articles/bermuda-entry-visas');
  const bermudaStay=source('bermuda-stay','百慕大政府 · 游客停留上限','https://www.gov.bm/news/new-visitor-guidelines-announced');
  add('BM','required',180,bermuda,['中国普通护照游客须具备符合官方要求的美、英或加多次入境签证。','第三国签证和护照均须至少有效至计划离境后 45 天；停留仍以入境许可及累计额度为准。'],{label:'需符合百慕大入境证件要求',additionalSources:[bermudaStay]});
  policies.BM.rules=[rule('bm-mrv','凭美／英／加多次入境签证进入百慕大',['US','GB','CA'],['visa'],180,{multiple:true,validity:'stay',afterStayDays:45,manualChecks:['护照须至少有效至计划离境后 45 天','核对累计停留额度及返程入境资格'],source:bermuda})];

  const cayman=source('cayman-visas','开曼群岛政府 · 2025 年签证、入境及登陆条例','https://legislation.gov.ky/cms/images/LEGISLATION/SUBORDINATE/2019/2019-0003/2019-0003_2025%20Revision.pdf');
  const caymanPr=source('cayman-residents','开曼群岛边境部门 · 美／加／英永久居民路线要求','https://gov.ky/web/cbc/travel/passport-exemptions');
  add('KY','required',null,cayman,['中国普通护照通常须提前办理开曼签证；第三国证件豁免带有直达航线和返程要求。'],{additionalSources:[caymanPr]});
  policies.KY.rules=[rule('ky-visa','凭美／加／英签证从签发国直达开曼',['US','CA','GB'],['visa'],30,{manualChecks:['须从该签证的签发国直接抵达开曼群岛'],source:cayman})];
  for(const [issuer,route] of [['US','须从美国直达，并持返回美国的机票'],['CA','须从美国或加拿大直达，并持返回美国或加拿大的机票'],['GB','须从英国直达，并持返回英国的机票']])policies.KY.rules.push(rule('ky-pr-'+issuer.toLowerCase(),'凭'+({US:'美国',CA:'加拿大',GB:'英国'})[issuer]+'永久居留按指定路线免办签证',[issuer],['permanent'],30,{manualChecks:[route,'入境时出示有效永久居留／落地移民证明'],source:caymanPr}));

  const anguilla=source('anguilla-evisa','安圭拉政府 · 电子签与美／英／加证件豁免','https://evisa.gov.ai/');
  add('AI','electronic',90,anguilla,['中国普通护照可提前申请安圭拉电子签。有效美、英或加签证／居留可用于下列豁免途径。']);
  policies.AI.rules=[rule('ai-third','凭美／英／加签证或居留免办安圭拉签证',['US','GB','CA'],['visa','permanent','residence'],90,{source:anguilla})];

  const tci=source('turks-caicos-entry','特克斯和凯科斯边境部门 · 免签国籍名单','https://borderforce.gov.tc/entry-requirements');
  add('TC','free',null,tci,['中国在官方免签国籍名单内，无需以美国签证等第三国证件作为免签前提。','获准停留以边检批注为准；须备妥护照和离境行程。']);

  const bvi=source('bvi-third','英属维尔京政府 · 签证国籍与美／英／加签证豁免','https://bvi.gov.vg/sites/default/files/visa_requirements_for_the_virgin_islands_nationals_of_the_following_countries.pdf');
  add('VG','required',null,bvi,['中国普通护照一般须提前办签；有效美、英或加签证有独立的短期访问豁免。']);
  policies.VG.rules=[rule('vg-third','凭美／英／加签证免办英属维尔京访问签证',['US','GB','CA'],['visa'],null,{maxMonths:6,stayLabel:'少于 6 个月，以入境批注为准',manualChecks:['此次访问须为旅游等允许用途，停留须少于六个月'],source:bvi})];

  const montserrat=source('montserrat-evisa','蒙特塞拉特政府 · 电子旅游签指南','https://www.immigration.ms/tourists/guide');
  const montserratExempt=source('montserrat-exempt','蒙特塞拉特政府 · 2025 年移民法附属签证豁免令','https://www.gov.ms/wp-content/uploads/2026/02/13.01-Immigration-Act.pdf');
  add('MS','electronic',null,montserrat,['中国普通护照可申请电子签；其属于签证，并非 ETA。有效美、英、加或欧盟成员国入境签证另有豁免。'],{additionalSources:[montserratExempt]});
  policies.MS.rules=[rule('ms-third','凭美／英／加或欧盟成员国签证免办蒙特塞拉特签证',['US','GB','CA',...eu],['visa'],null,{limitUnverified:true,manualChecks:['所持证件须属于有效的入境签证，停留以边检批准为准'],source:montserratExempt})];

  // The French circulation-visa exemption has an issuer and original-validity restriction.
  const french=source('french-overseas','法国官方签证网站 · 海外领地签证及证件豁免','https://www.france-visas.gouv.fr/en/web/france-visas/visa-de-court-sejour');
  for(const code of ['BL','GP','GF','MF','MQ','YT','NC','PF','RE','PM','WF']){
    add(code,'required',90,french,['普通申根旅游签证不自动适用于法国海外领地，通常须办理对该领地有效的签证。','法国签发的特定多次循环签证及申根居留证件有独立豁免，条件如下。'],{window:shortStay});
    policies[code].rules=[
      rule(code.toLowerCase()+'-fr-circulation','凭法国签发的多次循环签证适用海外领地豁免',['FR'],['visa'],90,{multiple:true,window:shortStay,manualChecks:['签证须由法国领事机关签发，原签发有效期为六个月至五年','须按 France-Visas 确认本次目的地适用的具体豁免'],source:french}),
      rule(code.toLowerCase()+'-schengen-residence','凭有效申根居留证件免办海外领地短期签证',schengen,['permanent','residence'],90,{window:shortStay,source:french})
    ];
  }

  const gibraltar=source('gibraltar-2026','直布罗陀政府 · 2026 年 7 月 15 日起的签证安排','https://www.gibraltar.gov.gi/press-releases/technical-notice-reminder-concerning-visa-arrangements-5582026-12201');
  add('GI','required',90,gibraltar,['2026 年 7 月 15 日起，直布罗陀认可申根短期签证及适用的申根居民资格。','原先凭英国签证／居留的单独豁免已取消，不能凭英国证件直接推断可入境。'],{validFrom:'2026-07-15',window:shortStay});
  policies.GI.rules=[rule('gi-schengen','使用有效申根短期签证或申根居留进入直布罗陀',schengen,['visa','permanent','residence'],90,{status:'held',label:'已有申根证件 · 适用于直布罗陀',validFrom:'2026-07-15',window:shortStay,source:gibraltar})];

  const nordicTerritories=source('greenland-faroe','丹麦移民局 · 格陵兰与法罗群岛的独立入境规则','https://www.nyidanmark.dk/en-GB/You-want-to-apply/Short-stay-visa/Visa-to-the-Faroe-Island-or-Greenland/');
  for(const code of ['GL','FO']){
    add(code,'required',90,nordicTerritories,['普通申根签证不适用。签证须明确对格陵兰／法罗群岛有效，经申根地区中转可能还需申根签证。','符合丹麦入境资格的有效申根居留证件有独立的免签途径。']);
    policies[code].rules=[rule(code.toLowerCase()+'-residence','凭符合丹麦入境资格的申根居留免办签证',schengen,['permanent','residence'],90,{manualChecks:['居留证件须有效，并允许持有人进入及居留丹麦','须携带有效护照'],source:nordicTerritories})];
  }

  const cta=source('crown-dependencies','英国政府 · 英国与王室属地的访问签证适用范围','https://www.gov.uk/government/publications/common-travel-area/common-travel-area-accessible');
  const jersey=source('jersey-permission','泽西政府 · 英国及群岛移民许可的适用范围','https://www.gov.je/lifeevents/movingtojersey/preparingtomove/pages/applyforvisa.aspx');
  const isleMan=source('isle-man-permission','马恩岛政府 · 已有英国／群岛签证的访问资格','https://www.gov.im/categories/travel-traffic-and-motoring/immigration/visit/visiting-the-isle-of-man-if-you-hold-a-valid-visa-for-the-british-isles/');
  for(const code of ['GG','JE','IM']){
    const entrySource=code==='IM'?isleMan:code==='GG'?cta:jersey;
    add(code,'required',null,entrySource,['中国普通护照需要适用的英国／群岛移民许可；短期旅游不能按英国 ETA 免签国籍处理。','已有适用的英国入境／居留许可可用于访问，须核对许可的用途和剩余停留额度。'],{additionalSources:[cta]});
    policies[code].rules=[rule(code.toLowerCase()+'-uk-permission','使用已有英国短期签证或永久居留访问',['GB'],['visa','permanent'],null,{status:'held',label:'已有英国证件 · 须符合访问许可',stayLabel:'按适用许可及剩余访问额度规定',excludeTransit:true,manualChecks:['英国移民许可须有效并适用于此次访问；签证持有人须核对剩余停留额度','访问不自动获得当地工作或学习资格'],source:entrySource})];
  }

  const aland=source('aland-entry','奥兰官方旅游机构 · 入境证件与芬兰签证要求','https://visitaland.com/en/travel/plan-trip/');
  const finland=source('finland-entry','芬兰外交部 · 申根签证与居留旅行要求','https://um.fi/faq-visas-and-residence-permits');
  add('AX','required',90,aland,['奥兰适用芬兰的申根入境规则；须持覆盖芬兰的有效申根签证或适用居留证件。','共享申根区每 180 天最多 90 天的短期停留额度。'],{window:shortStay,additionalSources:[finland]});
  policies.AX.rules=[rule('ax-schengen','使用已有申根签证或居留前往奥兰',schengen,['visa','permanent','residence'],90,{status:'held',label:'已有申根证件 · 适用于奥兰',window:shortStay,manualChecks:['核对签证允许的地域、剩余入境次数及共享停留额度'],source:finland})];

  const usTerritories=source('us-territory-entry','美国国务院 · 美国入境范围与签证要求','https://travel.state.gov/content/travel/en/us-visas/other-visa-categories/crewmember-visa.html');
  const usEvus=source('us-evus','美国 CBP · 中国十年访问签证的 EVUS 要求','https://www.help.cbp.gov/s/article/Article-1471?language=en_US');
  const usRule=code=>rule(code.toLowerCase()+'-us-document','使用适用的美国旅游签证或永久居民证件',['US'],['visa','permanent'],null,{status:'held',label:'已有美国证件 · 无需另办领地签证',stayLabel:'按美国证件及本次入境许可规定',excludeTransit:true,manualChecks:['中国普通护照上的十年 B1、B2 或 B1/B2 签证须按规定完成有效 EVUS 登记','永久居民须确认返美旅行资格及所需证明'],source:usTerritories});
  for(const code of ['PR','VI','GU']){
    add(code,'required',null,usTerritories,['中国普通护照旅游适用美国签证／移民证件要求。','需使用适用的美国访问签证或永久居民旅行证件；中国普通护照不能按普通美国 ESTA 国籍豁免处理。'],{additionalSources:[usEvus]});
    policies[code].rules=[usRule(code)];
  }
  policies.GU.notes.push('面向中国护照的 CNMI 14 天电子授权途径只适用于北马里亚纳群岛，不适用于关岛。');
  const cnmi=source('cnmi-evs-tap','美国 CBP · CNMI EVS-TAP 与电子旅行授权','https://g-cnmi-eta.cbp.dhs.gov/');
  add('MP','free',14,cnmi,['符合 CNMI EVS-TAP 条件的中国普通护照可免办签证访问北马里亚纳群岛最多 14 天，但须提前取得电子旅行授权。','该途径不能用于关岛或美国其他地区。已有适用美国签证者可按其签证及实际入境许可旅行。'],{authorization:'G-CNMI ETA（CNMI EVS-TAP）',preferCredentialRoute:true,manualChecks:['须满足 CNMI EVS-TAP 的护照、承运人、往返行程和准入条件','电子授权须在出发前获批，且此次行程只按该计划访问北马里亚纳群岛'],additionalSources:[usTerritories,usEvus]});
  policies.MP.rules=[usRule('MP')];

  const australianTerritories=source('australian-territory-entry','澳大利亚政府 · 外部领地的移民安排','https://www.infrastructure.gov.au/territories-regions-cities/territories/norfolk-island/governance-administration/extension-commonwealth-arrangements');
  const christmas=source('christmas-entry','澳大利亚政府 · 圣诞岛的国际入境要求','https://www.infrastructure.gov.au/territories-regions/territories/indian-ocean-territories-christmas-island-and-cocos-keeling-islands/christmas-island/christmas-island-travel-information');
  const cocos=source('cocos-entry','澳大利亚政府 · 科科斯群岛的国际入境要求','https://www.infrastructure.gov.au/territories-regions-cities/territories/indian-ocean-territories/cocos-keeling-islands/travel-information');
  for(const code of ['CX','CC','NF']){
    const entrySource=code==='CX'?christmas:code==='CC'?cocos:australianTerritories;
    add(code,'required',null,entrySource,['从境外进入时适用澳大利亚移民要求，中国普通护照须有适用的澳洲签证或永久居民旅行资格。','从澳大利亚本土旅行和从境外入境的检查方式不同；须保持合法停留及旅行资格。'],{additionalSources:code==='NF'?[]:[australianTerritories]});
    policies[code].rules=[rule(code.toLowerCase()+'-au-document','使用有效澳大利亚旅游签证或永久居民旅行证件',['AU'],['visa','permanent'],null,{status:'held',label:'已有澳洲证件 · 无需另办领地签证',stayLabel:'按澳洲证件及实际入境许可规定',manualChecks:['确认签证适用的旅行用途、有效入境次数及旅行条件','永久居民从境外入境时须仍有有效旅行资格，必要时持 Resident Return Visa'],source:entrySource})];
  }

  const americanSamoa=source('american-samoa-permits','美属萨摩亚政府 · 访问许可与担保要求','https://legalaffairs.as.gov/visitor-visa-home');
  const americanSamoaUs=source('american-samoa-us-permit','美属萨摩亚政府 · 美签／绿卡持有人的 30 天许可申请','https://legalaffairs.as.gov/usvisa30day');
  add('AS','permit',null,americanSamoa,['须在出行前取得美属萨摩亚自己的访问许可。美国签证或绿卡不能代替该许可。','美签／绿卡持有人可走在线 30 天访问许可申请；仍须提交材料、付费并获批。其他中国护照游客须由符合资格的当地担保人按官方程序申请。'],{label:'须提前取得美属萨摩亚访问许可',additionalSources:[americanSamoaUs]});

  const stHelena=source('st-helena-evisa','圣赫勒拿政府 · 电子签国籍与申请要求','https://evisa.sainthelena.gov.sh/faq');
  const stHelenaStay=source('st-helena-entry','圣赫勒拿政府 · 短期许可及分岛入境规则','https://www.sainthelena.gov.sh/st-helena/entry-requirements/');
  add('SH','electronic',183,stHelena,['此记录的电子签途径仅适用于圣赫勒拿岛，中国普通护照须提前申请。','阿森松岛、特里斯坦-达库尼亚分别有自己的入境许可，圣赫勒拿电子签不能替代；须向相应岛屿管理机关核对。'],{label:'圣赫勒拿岛须电子签 · 其他岛另查',additionalSources:[stHelenaStay]});

  const falklands=source('falklands-entry','福克兰群岛政府 · 2026 年航空入境与签证要求','https://www.falklands.gov.fk/civilaviation/component/jdownloads/?Itemid=138&catid=2&id=201%3Afalkland-islands-aeronautical-information-publication-part-1-general-gen-2&task=download.send');
  add('FK','required',null,falklands,['中国普通护照须核对并提前取得福克兰群岛所需签证，入境时仍须获得当地游客许可。','不把英国或其他第三国普通旅游签证自动当作福克兰签证。停留期限按获批许可规定。']);
  const pitcairn=source('pitcairn-entry','皮特凯恩政府 · 短期落地与长期访问签证','https://www.government.pn/immigration');
  add('PN','arrival',14,pitcairn,['停留 14 天或以内且乘同一艘船抵达和离开时，可在抵达时申请短期访问签证。','须满足品行、健康、保险及资金要求。超过 14 天或不符合短期船舶条件时，须提前申请相应签证。'],{manualChecks:['须乘同一艘船抵达和离开，并满足短期访问条件']});

  const svalbard=source('svalbard-entry','斯瓦尔巴总督 · 无签证入境及申根转程要求','https://www.sysselmesteren.no/en/visas-and-immigration/');
  add('SJ','free',null,svalbard,['斯瓦尔巴本身不要求签证；经挪威本土／申根区旅行时，中国普通护照仍须持适用申根证件。','通常须至少两次申根入境资格才能在游览后返回挪威本土。此免签记录不代表扬马延的独立访问许可已获批。'],{label:'斯瓦尔巴免签 · 扬马延须另查',stayLabel:'按斯瓦尔巴当地停留条件',limitUnverified:false,manualChecks:['核对经挪威／申根区的入境和返回资格','扬马延等受管制地点须单独核对访问许可']});

  // Protected and remote islands have access rules, not a general visa exemption.
  const bouvet=source('bouvet-access','挪威极地研究所 · 布韦岛保护区的登陆与活动规则','https://npolar.no/en/regulations-bouvetoya-nature-reserve/');
  add('BV','permit',null,bouvet,['通常不需一般登陆／停留许可，但活动受自然保护区法规限制。直升机登陆须单独获批，部分区域有季节性禁入。','不能把未设普通移民检查理解为所有活动均可进行。'],{label:'登陆与活动须符合保护区规定'});
  const heard=source('heard-access','澳大利亚南极局 · 赫德岛及麦克唐纳群岛许可','https://www.antarctica.gov.au/antarctic-operations/stations-and-field-locations/heard-island/protection-and-management/permits/');
  add('HM','permit',null,heard,['进入该领地及其领海须有依保护条例签发的许可。适用的澳大利亚签证不能替代环境及进入许可。'],{label:'须提前取得进入／环境许可'});
  const taaf=source('taaf-entry','法国南方和南极领地管理局 · 签证与管理机关批准','https://taaf.fr/acceder-aux-territoires/demande-de-visa/');
  const taafAccess=source('taaf-access','法国南方和南极领地管理局 · 活动及登陆批准','https://taaf.fr/acceder-aux-territoires/demandes-dactivites-et-dacces/');
  add('TF','permit',null,taaf,['该地区不属于申根区，须按具体岛屿、行程和活动核对签证及登陆许可。','需要签证时，须先得到领地高级行政长官批准；普通申根签证不会自动替代当地批准。'],{label:'须核对领地批准、签证与登陆许可',additionalSources:[taafAccess]});
  const southGeorgia=source('south-georgia-access','南乔治亚政府 · 游客准入及活动许可','https://gov.gs/how-to-visit/');
  const southGeorgiaScheme=source('south-georgia-entry-permit','南乔治亚政府 · 2025 年起的入境许可计划','https://gov.gs/one-month-until-the-launch-of-the-governments-new-entry-permit-scheme/');
  add('GS','permit',null,southGeorgia,['须按当地游客准入制度及入境许可计划获得批准，并由船舶经营者安排访问申报。','露营、无人机等活动可能另需活动许可；其他国家签证不能替代当地批准。'],{label:'须取得当地入境／访问许可',additionalSources:[southGeorgiaScheme]});
  const biot=source('biot-access','英属印度洋领地管理局 · 限制访问及许可暂停公告','https://www.biot.gov.io/visiting/');
  add('IO','permit',null,biot,['该领地不属于普通旅游目的地，入境受到限制。','管理局公告自 2026 年 3 月 31 日起暂停处理一般新的入境许可申请，例外情形按公告核对。英国签证不能代替当地许可。'],{label:'限制访问 · 一般新许可申请暂停'});
  const outlying=source('us-outlying-access','美国鱼类及野生动物局 · 威克环礁及特别用途许可','https://www.fws.gov/refuge/wake-atoll');
  add('UM','permit',null,outlying,['此区域包含多个分属保护区或军事管理的岛屿，须按具体目的地取得所需访问批准。','例如威克环礁不向一般公众开放，符合条件的访问须取得特别用途许可；美国签证本身不会取得登陆权。'],{label:'须按具体岛屿核对特别访问许可'});
  const tokelau=source('tokelau-entry','托克劳政府 · 外国游客入境许可要求','https://www.tokelau.org.nz/Tokelau+Government/Government+Departments/BDM+Certificates.html');
  add('TK','permit',null,tokelau,['外国游客须提前申请托克劳入境许可，并安排当地接待与船舶行程。经萨摩亚旅行时，还须分别符合萨摩亚的入境和返回要求。'],{label:'须提前申请托克劳入境许可'});
  const westernSahara=source('western-sahara-entry','英国外交部门 · 西撒哈拉管辖区域及入境口岸要求','https://www.gov.uk/foreign-travel-advice/western-sahara/entry-requirements');
  add('EH','unknown',null,westernSahara,['该地区的管辖、口岸和旅行路线不同，不能给整个区域统一套用某个国家的免签结论。','摩洛哥实际管辖地区须结合摩洛哥的护照政策与实际口岸核对；其他地区的许可及口岸条件另查。','所列英国来源仅用于说明区域与口岸，其英国护照免签说明不用于推断中国护照资格。'],{label:'须按具体管辖区域核对入境要求',limitUnverified:true});

  // Existing sovereign-country gap: a real waiver, distinct from the airport visa route.
  const saoTome=source('sao-tome-third','圣多美和普林西比政府旅游局 · 第三国签证与 15 天豁免','https://turismo.gov.st/fr/guide-pratique/informations-utiles');
  policies.ST.additionalSources=[...(policies.ST.additionalSources||[]),saoTome];
  policies.ST.verified=reviewed;
  policies.ST.rules=[rule('st-us-schengen','凭美国或申根签证免办 15 天访问签证',['US',...schengen],['visa'],15,{manualChecks:['护照有效期须超过三个月','须持有效美国或申根签证并备妥往返行程'],source:saoTome})];

  // Confirmed tourist stay limits; a visa's entry-validity period is not its stay allowance.
  const setLimit=(code,maxDays,key,title,url,note,extra={})=>{
    const p=policies[code],sourceKey=source(key,title,url);
    Object.assign(p,{maxDays,limitUnverified:false,verified:reviewed,...extra});
    p.additionalSources=[...new Set([...(p.additionalSources||[]),sourceKey])];
    if(note)p.notes.push(note);
  };
  setLimit('BT',90,'bhutan-stay','不丹官方旅游局 · 旅游签证最长停留','https://bhutan.travel/faqs','旅游签证允许自入境起最多停留 90 天；更长停留须提前申请延期。');
  setLimit('MN',30,'mongolia-k2-stay','蒙古移民局 · K2 旅游签证停留要求','https://www.immigration.gov.mn/en/k2-visa-permission/','此处采用 K2 短期旅游途径的最多 30 天；更长停留须按相应许可另办。');
  setLimit('MD',90,'moldova-short-stay','摩尔多瓦政府 · C 类短期签证期限','https://www.evisa.gov.md/Info/TipuriVizaDocumenteNecesare?c=en-US','C 类短期访问适用每 180 天最多 90 天，实际停留不得超过获批签证和入境许可。',{window:shortStay});
  setLimit('TJ',60,'tajikistan-evisa-stay','塔吉克斯坦外交部 · 电子签有效期与停留天数','https://mfa.tj/en/korea/consular-issues/consular-services/standard-visa','电子签的入境有效期为 90 天，允许停留最多 60 天；两者不得混同。');
  setLimit('UG',null,'uganda-tourist-stay','乌干达移民局 · 单次旅游签证期限','https://immigration.go.ug/index.php/services/tourist-visa','单次旅游签证可获批最多三个月，实际初次停留以边检批准为准。批准信的 90 天入境有效期不等同于已获得三个月停留。',{maxMonths:3});
  setLimit('LB',null,'lebanon-tourist-stay','黎巴嫩安全总局 · 中国公民旅游落地签期限','https://www.general-security.gov.lb/en/posts/38','旅游落地签初次为一个月；申请并获批后可延期至三个月，不能默认已获延期。',{maxMonths:1});
  setLimit('TZ',90,'tanzania-tourist-stay','坦桑尼亚移民局 · 普通旅游签证及停留范围','https://visa.immigration.go.tz/guidelines','普通旅游签证的期限上限为 90 天；实际允许停留仍以签证与入境批注为准，不按签证申请批准日自动计算。');
  setLimit('SA',90,'saudi-tourist-stay','沙特官方旅游签证平台 · 旅游签证期限','https://visa.visitsaudi.com/','旅游签证允许停留最多 90 天；一年多次签证有效期不代表可以连续停留一年，累计额度须按签证批注核对。');
  setLimit('TL',30,'timor-tourist-stay','东帝汶旅游部门 · 短期落地签与入境口岸','https://timorleste.tl/plan-your-trip','抵达帝力国际机场的普通旅游落地签初次为 30 天；延期须另获批准，陆路入境条件另行核对。');
  policies.TL.notes[0]='旅游落地签限适用机场、海港；陆路入境须提前获得相应签证或授权。';

  if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(globalThis);
