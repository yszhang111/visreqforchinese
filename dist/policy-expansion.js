(function(root){
  'use strict';
  const data=root.VisaAtlasData;
  if(!data)throw new Error('Load policies.js before policy-expansion.js');
  const {policies,sources,schengen,eu}=data;
  const snapshot='2026-10-01';
  // Exact country URLs from the MFA destination directory; classifications below are reviewed explicitly.
  const guides={
  "AF": [
    "阿富汗",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/afh_645710/"
  ],
  "AE": [
    "阿联酋",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/alq_645772/"
  ],
  "OM": [
    "阿曼",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/am_645834/"
  ],
  "AZ": [
    "阿塞拜疆",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/asbj_645896/"
  ],
  "PK": [
    "巴基斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/bjst_645958/"
  ],
  "PS": [
    "巴勒斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/blst_646020/"
  ],
  "BH": [
    "巴林",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/bl_646082/"
  ],
  "BT": [
    "不丹",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/bd_646144/"
  ],
  "KP": [
    "朝鲜",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/cx_646206/"
  ],
  "TL": [
    "东帝汶",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ddw_646268/"
  ],
  "PH": [
    "菲律宾",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/flb_646330/"
  ],
  "GE": [
    "格鲁吉亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/gljy_646392/"
  ],
  "KZ": [
    "哈萨克斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/hskst_646454/"
  ],
  "KR": [
    "韩国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/hg_646516/"
  ],
  "KG": [
    "吉尔吉斯斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/jejsst_646578/"
  ],
  "KH": [
    "柬埔寨",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/jpz_646640/"
  ],
  "QA": [
    "卡塔尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/kte_646702/"
  ],
  "KW": [
    "科威特",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/kwt_646764/"
  ],
  "LA": [
    "老挝",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/lw_646826/"
  ],
  "LB": [
    "黎巴嫩",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/lbn_646888/"
  ],
  "MV": [
    "马尔代夫",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/medf_646950/"
  ],
  "MY": [
    "马来西亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/mlxy_647012/"
  ],
  "MN": [
    "蒙古",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/mg_647074/"
  ],
  "BD": [
    "孟加拉国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/mjlg_647136/"
  ],
  "MM": [
    "缅甸",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/md_647198/"
  ],
  "NP": [
    "尼泊尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/nbe_647260/"
  ],
  "JP": [
    "日本",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/rb_647322/"
  ],
  "SA": [
    "沙特阿拉伯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/stalb_647384/"
  ],
  "LK": [
    "斯里兰卡",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/sllk_647446/"
  ],
  "TJ": [
    "塔吉克斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/tjkst_647508/"
  ],
  "TH": [
    "泰国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/tg_647570/"
  ],
  "TR": [
    "土耳其",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/teq_647632/"
  ],
  "TM": [
    "土库曼斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/tkmst_647694/"
  ],
  "BN": [
    "文莱",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/wl_647756/"
  ],
  "UZ": [
    "乌兹别克斯坦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/wzbkst_647880/"
  ],
  "SG": [
    "新加坡",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/xjp_647942/"
  ],
  "SY": [
    "叙利亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/xly_648004/"
  ],
  "AM": [
    "亚美尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ymny_647818/"
  ],
  "YE": [
    "也门",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ym_648066/"
  ],
  "IQ": [
    "伊拉克",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ylk_648128/"
  ],
  "IR": [
    "伊朗",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/yl_648190/"
  ],
  "IL": [
    "以色列",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ysl_648252/"
  ],
  "IN": [
    "印度",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/yd_648314/"
  ],
  "ID": [
    "印度尼西亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/ydnxy_648376/"
  ],
  "JO": [
    "约旦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/yd_648438/"
  ],
  "VN": [
    "越南",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/yz_645708/yn_648500/"
  ],
  "AL": [
    "阿尔巴尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/aebny_652289/"
  ],
  "IE": [
    "爱尔兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/ael_652351/"
  ],
  "EE": [
    "爱沙尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/asny_652413/"
  ],
  "AD": [
    "安道尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/ade_652475/"
  ],
  "AT": [
    "奥地利",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/adl_652537/"
  ],
  "BY": [
    "白俄罗斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bels_652599/"
  ],
  "BG": [
    "保加利亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bjly_652661/"
  ],
  "BE": [
    "比利时",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bls_652723/"
  ],
  "IS": [
    "冰岛",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bd_652785/"
  ],
  "BA": [
    "波黑",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bh_652847/"
  ],
  "PL": [
    "波兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/bl_652909/"
  ],
  "DK": [
    "丹麦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/dm_653033/"
  ],
  "DE": [
    "德国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/dg_653095/"
  ],
  "RU": [
    "俄罗斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/els_653157/"
  ],
  "FR": [
    "法国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/fg_653219/"
  ],
  "FI": [
    "芬兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/fl_653405/"
  ],
  "NL": [
    "荷兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/hl_653467/"
  ],
  "ME": [
    "黑山",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/hs_653529/"
  ],
  "CZ": [
    "捷克",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/jk_653591/"
  ],
  "HR": [
    "克罗地亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/kldy_653653/"
  ],
  "LV": [
    "拉脱维亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/ltwy_653715/"
  ],
  "LT": [
    "立陶宛",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/ltw_653777/"
  ],
  "LI": [
    "列支敦士登",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/lzdsd_653839/"
  ],
  "LU": [
    "卢森堡",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/lsb_653901/"
  ],
  "RO": [
    "罗马尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/lmny_653963/"
  ],
  "MT": [
    "马耳他",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/met_654025/"
  ],
  "MK": [
    "北马其顿",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/mqd_654087/"
  ],
  "MD": [
    "摩尔多瓦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/medw_654149/"
  ],
  "MC": [
    "摩纳哥",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/mng_654211/"
  ],
  "NO": [
    "挪威",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/nw_654273/"
  ],
  "PT": [
    "葡萄牙",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/pty_654335/"
  ],
  "SE": [
    "瑞典",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/rd_654397/"
  ],
  "CH": [
    "瑞士",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/rs_654459/"
  ],
  "RS": [
    "塞尔维亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/sewy_654521/"
  ],
  "CY": [
    "塞浦路斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/spls_654583/"
  ],
  "SM": [
    "圣马力诺",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/smln_654645/"
  ],
  "SK": [
    "斯洛伐克",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/slfk_654707/"
  ],
  "SI": [
    "斯洛文尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/slwny_654769/"
  ],
  "UA": [
    "乌克兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/wkl_654893/"
  ],
  "ES": [
    "西班牙",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/xby_654955/"
  ],
  "GR": [
    "希腊",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/xl_655017/"
  ],
  "HU": [
    "匈牙利",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/xyl_655079/"
  ],
  "IT": [
    "意大利",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/ydl_655141/"
  ],
  "GB": [
    "英国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/oz_652287/yg_655203/"
  ],
  "DZ": [
    "阿尔及利亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/aejly_648566/"
  ],
  "EG": [
    "埃及",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/aj_648628/"
  ],
  "ET": [
    "埃塞俄比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/aseby_648690/"
  ],
  "AO": [
    "安哥拉",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/agl_648752/"
  ],
  "BJ": [
    "贝宁",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/bn_648814/"
  ],
  "BW": [
    "博茨瓦纳",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/bcwn_648876/"
  ],
  "BF": [
    "布基纳法索",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/bjnfs_648938/"
  ],
  "BI": [
    "布隆迪",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/bld_649000/"
  ],
  "GQ": [
    "赤道几内亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/cdjny_649062/"
  ],
  "TG": [
    "多哥",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/dg_649124/"
  ],
  "ER": [
    "厄立特里亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/eltly_649186/"
  ],
  "CV": [
    "佛得角",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/fdj_649310/"
  ],
  "GM": [
    "冈比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/gby_649372/"
  ],
  "CG": [
    "刚果(布)",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/ggb_649434/"
  ],
  "CD": [
    "刚果(金)",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/ggj_649497/"
  ],
  "DJ": [
    "吉布提",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jbt_649559/"
  ],
  "GN": [
    "几内亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jny_649621/"
  ],
  "GW": [
    "几内亚比绍",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jnybs_649683/"
  ],
  "GH": [
    "加纳",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jn_649745/"
  ],
  "GA": [
    "加蓬",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jp_649807/"
  ],
  "ZW": [
    "津巴布韦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/jbbw_649869/"
  ],
  "CM": [
    "喀麦隆",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/kml_649931/"
  ],
  "KM": [
    "科摩罗",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/kml_650055/"
  ],
  "CI": [
    "科特迪瓦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/ktdw_650117/"
  ],
  "KE": [
    "肯尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/kny_650179/"
  ],
  "LS": [
    "莱索托",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/lst_650241/"
  ],
  "LR": [
    "利比里亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/lbly_650303/"
  ],
  "LY": [
    "利比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/lby_650365/"
  ],
  "RW": [
    "卢旺达",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/lwd_650489/"
  ],
  "MG": [
    "马达加斯加",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mdjsj_650551/"
  ],
  "MW": [
    "马拉维",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlw_650613/"
  ],
  "ML": [
    "马里",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/ml_650675/"
  ],
  "MU": [
    "毛里求斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlqs_650737/"
  ],
  "MR": [
    "毛里塔尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mltny_650799/"
  ],
  "MA": [
    "摩洛哥",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/mlg_650861/"
  ],
  "MZ": [
    "莫桑比克",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/msbk_650923/"
  ],
  "NA": [
    "纳米比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/nmby_650985/"
  ],
  "ZA": [
    "南非",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/nf_651047/"
  ],
  "SS": [
    "南苏丹",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/nsd_651109/"
  ],
  "NE": [
    "尼日尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/nre_651171/"
  ],
  "NG": [
    "尼日利亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/nrly_651233/"
  ],
  "SL": [
    "塞拉利昂",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/slla_651295/"
  ],
  "SN": [
    "塞内加尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/snje_651357/"
  ],
  "SC": [
    "塞舌尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/sse_651419/"
  ],
  "ST": [
    "圣多美和普林西比",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/sdmhplxb_651481/"
  ],
  "SZ": [
    "斯威士兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/swsl_651605/"
  ],
  "SD": [
    "苏丹",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/sd_651667/"
  ],
  "SO": [
    "索马里",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/sml_651729/"
  ],
  "TZ": [
    "坦桑尼亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/tsny_651791/"
  ],
  "TN": [
    "突尼斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/tns_651853/"
  ],
  "UG": [
    "乌干达",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/wgd_651915/"
  ],
  "ZM": [
    "赞比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/zby_652101/"
  ],
  "TD": [
    "乍得",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/zd_652163/"
  ],
  "CF": [
    "中非",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/fz_648564/zf_652225/"
  ],
  "AG": [
    "安提瓜和巴布达",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/atghbbd_655453/"
  ],
  "BB": [
    "巴巴多斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/bbds_655515/"
  ],
  "BS": [
    "巴哈马",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/bhm_655577/"
  ],
  "PA": [
    "巴拿马",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/bnm_655639/"
  ],
  "BZ": [
    "伯利兹",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/blz_655825/"
  ],
  "DO": [
    "多米尼加",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/dmnj_655887/"
  ],
  "DM": [
    "多米尼克",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/dmnk_655949/"
  ],
  "CR": [
    "哥斯达黎加",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/gsdlj_656011/"
  ],
  "GD": [
    "格林纳达",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/glnd_656073/"
  ],
  "CU": [
    "古巴",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/gb_656197/"
  ],
  "HT": [
    "海地",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/hd_656383/"
  ],
  "HN": [
    "洪都拉斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/hdls_656445/"
  ],
  "CA": [
    "加拿大",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/jnd_656507/"
  ],
  "US": [
    "美国",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/mg_656793/"
  ],
  "MX": [
    "墨西哥",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/mxg_657021/"
  ],
  "NI": [
    "尼加拉瓜",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/njlg_657145/"
  ],
  "SV": [
    "萨尔瓦多",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/sewd_657207/"
  ],
  "KN": [
    "圣基茨和尼维斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/sjchnws_657269/"
  ],
  "LC": [
    "圣卢西亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/slxy_657331/"
  ],
  "VC": [
    "圣文森特和格林纳丁斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/swsthglnds_657455/"
  ],
  "TT": [
    "特立尼达和多巴哥",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/tlndhdbg_657579/"
  ],
  "GT": [
    "危地马拉",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/wdml_657641/"
  ],
  "JM": [
    "牙买加",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/bmz_655327/ymj_657703/"
  ],
  "AR": [
    "阿根廷",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/agt_657829/"
  ],
  "PY": [
    "巴拉圭",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/blg_657891/"
  ],
  "BR": [
    "巴西",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/bx_657953/"
  ],
  "PE": [
    "秘鲁",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/ml_658015/"
  ],
  "BO": [
    "玻利维亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/blwy_658077/"
  ],
  "CO": [
    "哥伦比亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/glby_658201/"
  ],
  "EC": [
    "厄瓜多尔",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/egde_658263/"
  ],
  "GY": [
    "圭亚那",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/gyn_658325/"
  ],
  "SR": [
    "苏里南",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/sln_658387/"
  ],
  "VE": [
    "委内瑞拉",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/wnrl_658449/"
  ],
  "UY": [
    "乌拉圭",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/wlg_658511/"
  ],
  "CL": [
    "智利",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/nmz_657827/zl_658573/"
  ],
  "AU": [
    "澳大利亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/adly_658638/"
  ],
  "PG": [
    "巴布亚新几内亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/bbyxjny_658700/"
  ],
  "FJ": [
    "斐济",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/fj_658886/"
  ],
  "KI": [
    "基里巴斯",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/jlbs_659072/"
  ],
  "CK": [
    "库克群岛",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/kkqd_659196/"
  ],
  "MH": [
    "马绍尔群岛",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/mseqd_659258/"
  ],
  "FM": [
    "密克罗尼西亚联邦",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/mklnxy_659444/"
  ],
  "NR": [
    "瑙鲁",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/nl_659506/"
  ],
  "NU": [
    "纽埃",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/na_659568/"
  ],
  "PW": [
    "帕劳",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/pl_659692/"
  ],
  "WS": [
    "萨摩亚",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/smy_659816/"
  ],
  "SB": [
    "所罗门群岛",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/slmqd_659940/"
  ],
  "TO": [
    "汤加",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/tj_660002/"
  ],
  "TV": [
    "图瓦卢",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/twl_660064/"
  ],
  "VU": [
    "瓦努阿图",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/wnat_660250/"
  ],
  "NZ": [
    "新西兰",
    "https://cs.mfa.gov.cn/zggmcg/ljmdd/dyz_658636/xxl_660374/"
  ]
};
  for(const [code,[name,url]] of Object.entries(guides))sources['guide-'+code]={title:`中国领事服务网 · ${name}入境指南`,url};
  const source=(key,title,url)=>{sources[key]={title,url};return key;};
  const add=(code,status,maxDays,notes,extra={})=>policies[code]={code,status,maxDays,source:'guide-'+code,verified:snapshot,rules:[],notes,limitUnverified:maxDays==null&&status!=='required',...extra};
  // Short personal tourism with an ordinary PRC passport. Group, transit and regional exceptions are notes.
  const entries=[
    ['AF','required',null,['须提前获得相应签证；核对可使用的入境口岸。']],
    ['OM','free',14,['须备妥酒店、返程机票、医疗保险及足够资金，护照须有六个月有效期。14 天免签不可延期；更长停留应提前申请相应签证。']],
    ['PK','electronic',90,['需先在巴基斯坦官方在线签证系统申请并取得批准。免收签证费不等于免申请。']],
    ['PS','required',null,['巴勒斯坦的入境安排取决于实际路线及口岸。经以色列入境应具备相应以色列入境资格；其他路线须提前核对许可。']],
    ['BH','arrival',30,['可在巴林国际机场申请旅游落地签，也可提前申请电子签。实际获批期限可能为 14 天或 30 天。']],
    ['BT','electronic',null,['须提前申请并获得签证批准，可通过不丹官方旅游网站在线申请。']],
    ['KP','required',null,['须提前办理签证或符合规定的团体旅游手续；出行前核对接待及口岸安排。']],
    ['TL','arrival',null,['旅游落地签限机场、海港；陆路入境须提前获得签证或授权。未确认初次签发的具体停留天数。']],
    ['KG','electronic',null,['可提前申请电子签，须按获批签证选择入境口岸。特定第三国长期签证的 7 天便利途径另列。']],
    ['KH','arrival',30,['普通旅游可办理落地签或提前申请电子签。须填写官方电子入境申报。']],
    ['PH','required',null,['免签不适用时应提前申请相应签证。指定第三国签证的 7 天途径另列。']],
    ['KW','required',null,['普通护照应提前办理签证，通常涉及当地担保人。海湾国家特定职业居留的便利政策不等于普遍免签。']],
    ['LA','arrival',30,['可在指定口岸办理落地签，也可提前申请电子签。中老铁路磨丁口岸不办理落地签，赴该口岸须先取得适用签证。']],
    ['LB','arrival',null,['旅游可办理落地签，初次通常为一个月，并按当地规定办理后续停留。须核对返程机票、住宿及实际入境批注。']],
    ['MN','electronic',null,['可通过蒙古官方 evisa 系统提前申请旅游电子签。签证有效期与获准停留天数应分别核对，并遵守住宿登记要求。']],
    ['BD','arrival',30,['可在达卡国际机场办理旅游落地签，须提供返程机票、酒店或邀请材料；实际签发通常为 15–30 天。']],
    ['MM','arrival',null,['旅游落地签适用指定国际机场，包括仰光、曼德勒及内比都；也可核对提前申请电子签的途径。']],
    ['NP','arrival',90,['可申请 15 / 30 / 90 天旅游落地签，中国公民享有旅游签证费便利。免收费用仍需办理签证；遵守年度累计停留规定。']],
    ['LK','arrival',30,['中国普通护照可申请免费的旅游 ETA；须在出行前取得授权。','斯里兰卡 ETA 是旅行授权，持有人在入境口岸取得 30 天短期访问签证。本页按免费落地签显示，免收费用不等于无需签证。']],
    ['TJ','electronic',null,['可核对官方电子签申请途径。55 岁以上中国公民的 14 天免签属于年龄限定政策，本页尚未收集年龄，不自动套用。']],
    ['TM','required',null,['须提前申请签证，通常需要经批准的邀请函。']],
    ['SY','electronic',null,['普通护照签证需按使馆指引提前在线申请。申请窗口、获批有效期和停留期限须分别确认。']],
    ['YE','required',null,['须在入境前办理签证及适用手续。']],
    ['IQ','electronic',null,['伊拉克全国的普通落地签已于 2025 年 3 月停止，应提前申请电子签。库尔德地区的单独许可不可据此用于伊拉克其他地区。']],
    ['IR','free',21,['适用普通护照短期旅游等允许的活动；护照须符合六个月有效期要求。']],
    ['IL','required',null,['普通护照旅游应提前办理签证，无普遍适用的旅游落地签。']],
    ['IN','required',null,['普通护照旅游须提前取得适用签证。填写网上申请表不代表已经取得签证。']],
    ['JO','arrival',30,['可在适用口岸申请旅游落地签，也可核对提前在线申请途径；准备返程行程及住宿材料。']],
    ['SA','arrival',null,['中国普通护照可申请旅游电子签或在适用口岸办理旅游落地签。签证有效期不等于单次停留天数，应按签证批注核对。']],
    ['KR','required',null,['个人赴韩国本土旅游通常须提前取得签证。济州岛区域免签、特定团体及过境便利有路线和活动范围限制，不按全国普通旅游免签处理。']],
    ['BN','free',14,['普通护照须有六个月以上有效期，并备妥返程行程及住宿。超过 14 天应提前办理适用签证。']],
    ['DZ','required',null,['普通个人旅游须提前办签证。经批准的撒哈拉沙漠旅行团等特殊便利不按全国普通旅游落地签处理。']],
    ['EG','arrival',30,['可办理旅游落地签。领事指南要求返程机票、酒店订单及至少 2,000 美元现金，出行前核对适用口岸和材料。']],
    ['ET','arrival',30,['旅游可在亚的斯亚贝巴博莱国际机场办理落地签，也可提前申请电子签；其他入境路线应单独核对。']],
    ['AO','free',30,['短期旅游免签，全年累计停留不超过 90 天；工作等活动应办理相应签证。']],
    ['BJ','free',30,['普通护照短期访问可免签；每 90 天内累计停留不超过 30 天。']],
    ['BW','arrival',14,['落地签须备邀请或接待、行程等材料。全年累计停留不超过 90 天，以边检批准为准。']],
    ['BF','electronic',90,['应提前在布基纳法索官方平台申请电子签。短期签证最长 90 天，按获批类别及批注执行。']],
    ['BI','electronic',null,['所谓落地签也须在出发前完成官方在线申请并获得相应批准，不按无需预先手续的落地签处理。']],
    ['GQ','electronic',null,['可通过领事指南链接的官方电子签平台提前申请，获批后再出行。']],
    ['TG','electronic',null,['须在多哥官方旅行平台提前办理电子签及入境申报，不能依赖到达后现场办理。']],
    ['ER','required',null,['须提前取得签证和适用入境手续。']],
    ['CV','arrival',null,['可核对机场落地签途径；出行前确认 EASE 登记、机场税及实际停留批注。']],
    ['GM','required',null,['须提前办理签证，准备邀请、住宿和离境行程等材料。']],
    ['CG','required',null,['中国普通护照须提前办理适用签证。']],
    ['CD','required',null,['普通护照赴刚果（金）应在出行前取得适用签证或官方批准。']],
    ['DJ','electronic',90,['可提前申请电子签，最长停留以获批旅游签证为准；不要将签证有效期自动当作停留许可。']],
    ['GN','electronic',null,['须使用几内亚官方边境警察电子签平台，提前获批并按规定入境。']],
    ['GW','required',null,['中国普通护照须提前办理签证或预先取得落地签批准，不能直接依赖现场申请。']],
    ['GH','required',null,['应提前办理签证。紧急落地签涉及预先批准及承运航空公司核验，不属于普通游客直接落地签。']],
    ['GA','electronic',null,['电子签须在出发前获批，适用利伯维尔等官方指定入境安排。']],
    ['ZW','arrival',null,['中国普通护照旅游可申请落地签，实际天数以签发批注为准。']],
    ['CM','electronic',null,['须先在线申请预签证，取得批准 / 二维码后才可出发，在适用口岸完成签发手续。']],
    ['KM','arrival',45,['可申请旅游落地签，需核对返程机票、住宿及生物信息采集要求。']],
    ['CI','electronic',null,['须在出发前通过官方系统完成申请，取得批准后在阿比让机场完成相关手续。']],
    ['KE','free',null,['免办传统签证，但中国普通护照仍须在出行前取得肯尼亚 eTA 电子旅行授权。','eTA 是旅行授权，须申请并获批后才能出发；授权有效期不等于获准停留期限，入境及停留以边检批准为准。']],
    ['LS','required',null,['应按莱索托官方要求提前取得签证 / 批准；经南非前往还需符合南非入境要求。']],
    ['LR','required',null,['普通护照应提前办妥签证。']],
    ['LY','required',null,['须提前取得适用签证或批准。利比亚正在实施电子签系统，具体国籍资格和申请方式应向主管机关确认。']],
    ['RW','arrival',30,['普通护照可办理旅游落地签；中国公民的签证费待遇应按实际申请类别核对。']],
    ['MG','arrival',60,['可选择 15 / 30 / 60 天旅游落地签，并核对相应手续及费用。短期免签证费仍需办理入境签证。']],
    ['MW','electronic',null,['2026 年 2 月 24 日起的官方分类把中国列入第一类：必须在出发前取得签证或授权，不适用第二类落地签。请提前使用官方电子签平台。']],
    ['ML','required',null,['普通护照须在入境前取得相应签证。']],
    ['MR','electronic',null,['自 2025 年 1 月起应提前通过官方系统取得电子签，不再直接在机场办理普通落地签。']],
    ['MZ','free',30,['短期旅游免签，仍涉及入境管理费用，并须备妥住宿及返程材料。延期须另办手续，不把延期后的期限当作初次免签期限。']],
    ['NA','electronic',null,['中国普通护照须提前取得签证或电子签。纳米比亚的落地签名单及外交护照豁免不能套用于中国普通护照。']],
    ['ZA','electronic',null,['可核对南非官方电子签 / ETA 申请途径及指定入境机场；须在出行前获批。']],
    ['SS','electronic',null,['应提前取得适用电子签及入境手续，不应在无签证的情况下直接赴南苏丹。']],
    ['NE','required',null,['中国普通护照应在入境前办妥签证。']],
    ['NG','required',null,['2025 年 5 月起原落地签制度停止，应在出发前通过尼日利亚官方签证系统取得适用签证。']],
    ['SL','arrival',null,['中国普通护照可申请旅游落地签，停留天数按实际签发为准。']],
    ['SN','required',null,['领事指南建议普通护照赴塞内加尔前办妥签证，不据不明确的机场便利确认普遍落地签。']],
    ['ST','arrival',null,['中国普通护照可办理旅游落地签，停留天数及材料须按官方签发要求确认。']],
    ['SZ','required',null,['需提前申请签证及准备接待材料，经南非入境还须符合相应南非入境要求。']],
    ['SD','required',null,['须提前办理适用签证或批准。特别批准的紧急入境不属于普通游客直接落地签。']],
    ['SO','electronic',null,['自 2025 年 9 月起外国旅客须在出发前申请索马里 e-Visa / ETAS。核对实际目的地、口岸和当地许可要求。']],
    ['TZ','arrival',null,['可在官方指定口岸申请旅游落地签，也可提前申请电子签；实际停留期限以批注为准。']],
    ['TN','free',null,['个人旅游免签须备妥符合要求的酒店预订 / 付款凭证及返程机票。具体停留上限尚未确认，出行前向官方核对。']],
    ['UG','electronic',null,['必须提前在线申请并取得乌干达电子签批准。']],
    ['ZM','free',90,['旅游免签，12 个月内旅游停留上限 90 天。边检可能初次只批准 30 天，后续停留须按当地规定办理。']],
    ['TD','required',null,['普通护照入境须提前取得适用签证。']],
    ['CF','required',null,['中国普通护照赴中非须提前办理签证。']],
    ['AD','free',null,['安道尔没有一般旅游签证制度，但只能经法国或西班牙前往；须具备合法进入并返回申根区的资格。']],
    ['MC','required',null,['赴摩纳哥旅游须核对法国 / 申根入境资格；已有签证应符合实际路线和剩余停留额度。']],
    ['IE','required',null,['爱尔兰不属于申根区。普通旅游须持爱尔兰签证或符合单独的英国短期签证豁免条件。']],
    ['RU','free',30,['2026 年 7 月公告将现行中国普通护照短期免签延长至 2027 年 12 月 31 日。工作、学习、定居等事由不适用旅游免签。']],
    ['MK','required',null,['中国普通护照旅游通常需签证；特定第三国签证和居留豁免另列。']],
    ['MD','electronic',null,['可提前申请摩尔多瓦电子签；特定第三国签证及居留免签途径另列。']],
    ['CY','required',null,['塞浦路斯不属于申根区。应取得塞浦路斯签证，或满足指定申根签证 / 居留豁免条件。须使用官方认可的入境口岸。']],
    ['UA','required',null,['普通护照须提前取得适用乌克兰签证。当前申请服务和可用入境路线须向使领馆确认。']],
    ['CA','required',null,['普通护照一般须提前办理加拿大访问签证。美国永久居民有独立的签证 / eTA 豁免；仅持美国签证不能自动免办加拿大旅游签证。']],
    ['BZ','required',null,['指定美国、加拿大及申根多次签证，或美国 / 加拿大永久居留可适用签证豁免，详见下列途径。']],
    ['DO','required',null,['旅游通常须提前办理签证；指定第三国有效签证或合法居留的豁免另列。一般旅游停留按 30 天核对。']],
    ['CU','free',90,['中国普通护照可免签短期访问，仍需完成古巴入境申报并核对保险、返程行程等要求。']],
    ['HT','free',90,['短期访问可免签，须准备符合要求的护照、返程行程，并核对旅游入境费用。']],
    ['HN','required',null,['须提前办签证，或持符合剩余有效期要求的指定第三国签证。获准停留天数应另行核对。']],
    ['NI','required',null,['中国普通护照赴尼加拉瓜旅游应提前取得相应签证。']],
    ['SV','required',null,['普通护照一般须提前办理签证。持指定第三国签证可申请的落地签便利不等于无手续免签，出行前向官方核对。']],
    ['KN','free',90,['普通护照短期旅游可免签，须符合住宿、离境行程和资金要求。']],
    ['LC','free',42,['短期旅游可免签，实际停留不得超过入境机关批准的期限。']],
    ['VC','required',null,['中国普通护照须提前办理相应签证。']],
    ['TT','required',null,['中国普通护照赴特立尼达和多巴哥旅游应提前取得签证，其他特别便利须向官方确认。']],
    ['GT','required',null,['中国普通护照须提前办理适用签证，不把对其他国籍的第三国签证豁免自动套用。']],
    ['JM','free',30,['仅适用于符合规定的短期旅游；商务、工作等其他目的应核对相应签证。']],
    ['AR','required',null,['中国普通护照短期旅游可凭特定美国签证类别或美国永久居留适用豁免，详见下列规则。中国公民 AVE 申请途径当前暂停。']],
    ['PY','required',null,['普通护照赴巴拉圭应提前申请相应签证。']],
    ['BR','free',30,['现行中国普通护照免签试行至 2026 年 12 月 31 日。每个移民年度累计停留不得超过 30 天，不能延期；移民年度从首次入境起计。']],
    ['BO','arrival',null,['旅游可办理落地签，须提供护照、纸质住宿、返程行程、资金及按路线要求的疫苗证明。']],
    ['GY','required',null,['中国普通护照须提前取得签证。不要将针对其他国籍的第三国签证便利自动套用。']],
    ['VE','required',null,['赴委内瑞拉旅游须提前取得相应签证。']],
    ['UY','required',null,['指定第三国签证免办乌拉圭领事签证的途径有首次入境口岸限制，详见下列规则。']],
    ['AU','required',null,['中国普通护照通常应申请澳大利亚访客签证（如 600 类）。在线申请和电子签发不等于 ETA 或免签资格。']],
    ['PG','electronic',30,['个人旅游可提前申请巴布亚新几内亚旅游电子签。团体特别安排不按个人直接落地签处理。']],
    ['KI','free',30,['普通旅游初次免签 30 天；如需延期须办理手续，全年累计上限 90 天不是初次自动获准期限。']],
    ['CK','free',31,['游客可免签短期停留，须具备有效护照、住宿、离境机票及足够资金。']],
    ['MH','required',null,['普通护照应在出发前取得马绍尔群岛签证 / 入境批准。']],
    ['FM','free',30,['普通护照短期旅游可免签，须准备离境行程并核对各州入境要求。']],
    ['NR','required',null,['赴瑙鲁应提前取得签证或入境批准，并确认返程 / 后续行程。']],
    ['NU','free',30,['短期游客可免签，仍须提供离境机票及符合要求的旅行材料。']],
    ['PW','arrival',30,['可办理旅游落地签，须核对护照、返程行程及帕劳相关入境申报。']],
    ['TV','arrival',30,['可申请旅游落地签。免费或减免费用仍需办理相应入境许可。']],
    ['VU','arrival',120,['中国普通护照可申请旅游落地签，最长 120 天，以实际入境批注为准。']],
    ['NZ','required',null,['中国普通护照一般须提前申请新西兰访问签证。凭澳大利亚签证从澳赴新的试行途径仍需提前获批 NZeTA，并满足路线等条件。']],
  ];
  for(const [code,status,days,notes] of entries)add(code,status,days,notes);
  const mutualLimits={AE:90,AZ:30,KZ:30,QA:30,MV:30,UZ:30,AM:90,AL:90,BY:30,BA:90,SM:90,MU:60,SC:30,AG:30,BB:30,BS:30,DM:30,GD:30,SR:30,WS:90,SB:30,TO:30};
  for(const [code,days] of Object.entries(mutualLimits)){
    const p=policies[code];p.maxDays=days;p.limitUnverified=false;p.verified=snapshot;p.source='guide-'+code;
    p.notes=['已录入中国普通护照短期免签期限。实际入境仍须满足护照、旅行目的、离境行程等要求。'];
  }
  for(const code of ['AE','AZ','KZ','UZ','AM','AL','BA','AG','SB'])policies[code].window='每 180 天累计不超过 90 天';
  policies.BJ.window='每 90 天累计不超过 30 天';
  policies.AO.window='全年累计不超过 90 天';
  policies.ZM.window='12 个月内旅游累计不超过 90 天';
  policies.SM.manualChecks=['须具备经意大利进入及返回申根区的合法资格'];
  policies.SC.notes.push('免签仍须提前取得塞舌尔旅行授权，并核对住宿、保险及返程行程。');
  policies.SR.notes.push('须按官方要求预先办理旅游入境费用手续。');
  policies.BS.notes.push('边检实际批准可能为 7–30 天，须以入境批注为准。');
  policies.AD.manualChecks=['须具备经法国 / 西班牙进入及返回申根区的合法资格'];
  add('FJ','free',null,['普通旅游可免签停留最多四个月，按日历月份计算；仍须符合护照、返程行程及资金要求。'],{maxMonths:4,limitUnverified:false});
  add('VA','required',null,['赴梵蒂冈通常经意大利进入，须具备相应意大利 / 申根入境资格。此分类用于说明实际访问路线的签证要求。'],{source:source('italy-entry','意大利外交部 · 意大利入境与签证','https://www.esteri.it/en/servizi-opportunita/ingressosoggiornoinitalia/'),label:'需具备意大利 / 申根入境资格'});
  policies.DM.source=source('mutual-current','国家移民管理局 · 中外互免签证协定及期限','https://www.nia.gov.cn/n741440/n741577/c1710341/content.html');
  policies.BT.source=source('bhutan-tourism','不丹官方旅游局 · 在线签证','https://bhutan.travel/visa');
  policies.BF.source=source('burkina-evisa','布基纳法索官方 · 短期电子签','https://www.visaburkina.bf/les-visas-dentree-au-burkina-faso-le-visa-de-court-sejour/');
  policies.LK.source=source('sri-lanka-eta','斯里兰卡移民局 · 免费旅游 ETA 要求','https://eta.gov.lk/slvisa/');
  Object.assign(policies.LK,{authorization:'ETA',label:'免费落地签 · 需 ETA',verified:'2026-10-11',fee:'中国普通护照的 30 天旅游 ETA 免费；延期另行收费',additionalSources:[source('sri-lanka-eta-entry','斯里兰卡移民局 · ETA 与入境时签发的短期签证','https://www.eta.gov.lk/slvisa/visainfo/weta.jsp?ch1=current&locale=en_US')]});
  Object.assign(policies.KE,{authorization:'eTA',verified:'2026-10-11',source:source('kenya-eta','肯尼亚移民局 · eTA 适用范围与申请要求','https://etakenya.go.ke/general-information')});
  policies.MW.source=source('malawi-2026','马拉维移民局 · 第一类国籍须提前办签','https://www.evisa.gov.mw/PDFs/CategoryOneCountries.pdf');
  policies.MW.additionalSources=[source('malawi-evisa','马拉维移民局 · 2026 年入境公告及电子签','https://www.evisa.gov.mw/Index')];
  policies.NA.source=source('namibia-ordinary','纳米比亚移民部门 · 签证国籍与护照类别','https://eservices.mhaiss.gov.na/form/FactSheetVisaRequirementstoNamibia.pdf');
  policies.SO.source=source('somalia-etas','索马里移民局 · e-Visa / ETAS 启用公告','https://immigration.gov.so/news/somalia-launches-e-visa-etas-system');
  policies.RU.source=source('russia-extension','中国驻俄罗斯使馆 · 免签延长至 2027 年底','https://ru.china-embassy.gov.cn/lsfw/zytz_142816/202607/t20260721_11989093.htm');
  policies.RU.additionalSources=[source('russia-waiver','中国驻俄罗斯使馆 · 30 天免签原公告','https://ru.china-embassy.gov.cn/lsfw/zytz_142816/202512/t20251211_11771222.htm')];
  Object.assign(policies.RU,{validFrom:'2025-12-01',validUntil:'2027-12-31'});
  policies.BR.source=source('brazil-2026','巴西驻广州领馆 · 中国普通护照限期免签','https://www.gov.br/mre/pt-br/consulado-cantao/EN/visas/info');
  Object.assign(policies.BR,{validFrom:'2026-05-11',validUntil:'2026-12-31',window:'每个移民年度累计不超过 30 天'});
  const cambodiaFallback={...policies.KH,notes:[...policies.KH.notes]};
  Object.assign(policies.KH,{status:'free',maxDays:14,source:source('cambodia-waiver','中国驻柬埔寨使馆 · 限期 14 天免签','https://kh.china-embassy.gov.cn/lsfws/lsbh/202606/t20260620_11949230.htm'),validFrom:'2026-06-15',validUntil:'2026-10-15',fallback:cambodiaFallback,notes:['2026 年 6 月 15 日至 10 月 15 日，中国普通护照可免签停留不超过 14 天，仍须填写电子入境申报。','该日期之外或计划停留超过 14 天，按已录入的普通落地签 / 电子签途径核对。']});
  const philippinesFallback={...policies.PH,notes:[...policies.PH.notes]};
  Object.assign(policies.PH,{status:'free',maxDays:14,limitUnverified:false,source:source('philippines-waiver','中国驻菲律宾使馆 · 指定机场 14 天免签','https://ph.china-embassy.gov.cn/lsfw/202601/t20260122_11843596.htm'),validFrom:'2026-01-16',validUntil:'2027-01-15',fallback:philippinesFallback,manualChecks:['免签入境仅适用马尼拉尼诺·阿基诺机场或宿务麦克坦机场'],notes:['14 天免签只适用指定的马尼拉及宿务国际机场，不可延期；其他口岸须核对签证或其他便利途径。','须准备返程机票、住宿、符合有效期要求的护照，并填写 eTravel。现行免签公告有效期为一年。']});
  const rule=(id,title,issuers,types,maxDays,extra={})=>({id,title,issuers:[...new Set(issuers)],types,maxDays,validity:'arrival',...extra});
  const touristWindow='每 180 天累计不超过 90 天';
  policies.AR.source=source('argentina-2026','阿根廷驻上海领馆 · 2026 年美国签证 / 永居豁免','https://cshan.cancilleria.gob.ar/en/visa-exemption-chinese-ordinary-passport-holders-eta-ave-enter-argentine-republic');
  policies.AR.rules=[rule('ar-us-visa','凭指定类别美国签证免办阿根廷旅游签证',['US'],['visa'],30,{visaCodes:['B1/B2','B2','B1','J','J1','J2','O','O1','O2','O3','P','P1','P2','P3','E','E1','E2','E3','H1B']}),rule('ar-us-pr','凭美国永久居留免办阿根廷旅游签证',['US'],['permanent'],30)];
  policies.CA.rules=[rule('ca-us-pr','美国永久居民免办加拿大访问签证及 eTA',['US'],['permanent'],null,{limitUnverified:true,source:source('canada-us-pr','加拿大 IRCC · 美国永久居民入境要求','https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1118&top=')})];
  policies.BZ.rules=[rule('bz-visa','凭指定国家多次签证免办伯利兹签证',['US','CA',...schengen],['visa'],30,{multiple:true}),rule('bz-pr','凭美国 / 加拿大永久居留免办伯利兹签证',['US','CA'],['permanent'],30)];
  policies.BZ.source=source('belize-waiver','伯利兹移民局 · 签证豁免资格','https://immigration.gov.bz/visa/visa-who-qualify/');
  policies.DO.rules=[rule('do-visa','凭指定国家有效签证免办多米尼加旅游签证',['US','CA','GB',...schengen],['visa'],30),rule('do-residence','凭指定国家合法居留免办多米尼加旅游签证',['US','CA','GB',...schengen],['permanent','residence'],30)];
  policies.DO.source=source('dominican-entry','多米尼加官方旅游局 · 入境要求','https://www.godominicanrepublic.com/travel/entry-requirements');
  policies.DO.additionalSources=[source('dominican-card','多米尼加税务局 · 旅游入境豁免','https://dgii.gov.do/sobreTarjetaTurista/Paginas/default.aspx')];
  policies.HN.rules=[rule('hn-visa','凭指定国家签证免办洪都拉斯旅游签证',['US','CA',...schengen],['visa'],null,{minMonths:6,limitUnverified:true})];
  policies.UY.rules=[rule('uy-visa','凭指定国家签证按指定口岸免办乌拉圭领事签证',['US','CA','GB',...eu],['visa'],90,{manualChecks:['首次入境须经卡拉斯科机场、蒙得维的亚港、科洛尼亚港或拉古纳德尔绍塞机场']})];
  policies.UY.source=source('uruguay-regime','乌拉圭内政部 · 签证制度与首次入境口岸','https://www.gub.uy/ministerio-interior/comunicacion/publicaciones/regimen-visas-admision');
  policies.IE.rules=[rule('ie-uk-visitor','凭已使用的英国短期访问签证适用爱尔兰豁免',['GB'],['visa'],90,{used:true,categories:['visitor'],manualChecks:['本次有效英国入境许可的剩余停留期限须覆盖爱尔兰停留','签证不属于结婚或民事结合访问类别'],source:source('ireland-waiver','爱尔兰移民局 · 英国短期访问签证豁免','https://www.irishimmigration.ie/coming-to-visit-ireland/short-stay-visa-waiver-programme/')})];
  policies.MD.rules=[rule('md-visa','凭指定国家非过境签证免办摩尔多瓦签证',['US','CA','GB',...eu,...schengen],['visa'],90,{excludeTransit:true,window:touristWindow}),rule('md-residence','凭指定国家居留免办摩尔多瓦签证',['US','CA','GB',...eu,...schengen],['permanent','residence'],90,{window:touristWindow})];
  policies.CY.rules=[rule('cy-schengen-visa','凭申根两次 / 多次签证免办塞浦路斯签证',schengen,['visa'],90,{entryOptions:['double','multiple'],validity:'stay',window:touristWindow,manualChecks:['申根签证未用尽的获准停留额度须覆盖本次塞浦路斯停留']}),rule('cy-schengen-residence','凭申根居留免办塞浦路斯签证',schengen,['permanent','residence'],90,{validity:'stay',window:touristWindow})];
  policies.MK.source=source('north-macedonia','北马其顿外交部 · 2026 年第三国证件入境规则','https://mfa.gov.mk/en-GB/konzularni-uslugi/informacii-za-vlez-vo-rsm');
  policies.MK.rules=[rule('mk-residence','凭欧盟 / 申根居留免办北马其顿签证',[...eu,...schengen],['permanent','residence'],15,{window:touristWindow}),rule('mk-schengen-c','凭多次申根 C 类签证免办北马其顿签证',schengen,['visa'],15,{multiple:true,visaCodes:['C'],validity:'stay',afterStayDays:5,window:touristWindow}),rule('mk-2026-visa','2026 年凭美国 / 加拿大 / 英国多次签证免签',['US','CA','GB'],['visa'],15,{multiple:true,validity:'stay',afterStayDays:5,validFrom:'2026-01-01',validUntil:'2026-12-31',window:touristWindow,manualChecks:['签证须为护照内的实体签证，电子签不自动适用']})];
  policies.KG.rules=[rule('kg-long-visa','凭指定第三国长期签证适用 7 天免签',['US','GB',...schengen],['visa'],7,{manualChecks:['该签证原签发有效期须为三年以上','须经玛纳斯国际机场入境','再次入境须满足官方规定的 21 天间隔']})];
  policies.PH.rules=[rule('ph-third-visa','凭指定国家有效签证适用 7 天旅游免签',['US','CA','JP','AU',...schengen],['visa'],7,{source:'guide-PH',manualChecks:['须核对第三国签证便利实际适用的入境口岸及移民审核要求']})];
  policies.NZ.rules=[rule('nz-from-australia','凭澳大利亚签证从澳赴新免办访客签证，提前取得 NZeTA',['AU'],['visa'],null,{maxMonths:3,status:'conditional',label:'有条件免签 · 需 NZeTA',authorization:'NZeTA',validFrom:'2025-11-03',manualChecks:['澳大利亚签证类别须在新西兰官方允许范围内','已合法进入澳大利亚，并从澳大利亚前往新西兰；机场过境不适用','出发前须取得 NZeTA 授权'],notes:['NZeTA 是电子旅行授权，无需在出发前申请新西兰访客签证。','符合条件并获准入境后，在边境签发访客签证，单次最多停留 3 个月。'],source:source('nz-australia-pilot','新西兰移民局 · 中国游客从澳大利亚赴新途径','https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/chinese-and-pacific-island-visitors-travelling-from-australia/')})];
  policies.NZ.rules.push(rule('nz-australian-pr','凭澳洲永居免办访客签证，提前取得 NZeTA',['AU'],['permanent'],null,{
    status:'conditional',label:'有条件免签 · 需 NZeTA',authorization:'NZeTA',unlimitedStay:true,stayLabel:'获批居留签证后可无限期停留',
    manualChecks:['持有效的澳大利亚永久居留签证或居民返程签证（Resident Return Visa）','澳大利亚签证的旅行条件仍允许返回澳大利亚，且签证与本次使用的护照关联','出发前须取得 NZeTA 授权；已有有效新西兰签证者按该签证要求出行','完成新西兰旅客入境申报（NZTD），并符合品行及入境要求'],
    notes:['符合条件并在入境时获批 Australian Resident Visa 后，可在新西兰无限期居留；澳洲永居途径不采用普通访客签证的 3 个月停留上限。','NZeTA 是电子旅行授权，不能代替入境时获批的居留签证和入境许可。','该新西兰居留签证通常在离境时失效，延续旅行条件须按移民局规定办理。'],
    source:source('nz-australian-pr','新西兰移民局 · 澳洲公民及永久居民入境要求','https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/australian-citizens-and-permanent-residents-travelling-to-new-zealand/')
  }));
  policies.NZ.additionalSources=[...(policies.NZ.additionalSources||[]),'nz-australian-pr',source('nz-australian-resident-visa','新西兰移民局 · Australian Resident Visa','https://www.immigration.govt.nz/visas/australian-resident-visa/')];
  policies.NZ.verified='2026-10-03';
  // Fallback records share the final third-country routes, rather than losing them outside temporary waivers.
  philippinesFallback.rules=policies.PH.rules;
  data.snapshot=snapshot;
  data.coverage={scope:'中国普通护照个人短期旅游',reviewedDestinations:Object.keys(policies).length,territories:'部分海外属地及特殊地区仍待逐项核实'};
  if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(globalThis);
