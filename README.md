# 行境 · 中国护照签证地图

查询中国普通护照的签证要求，选择已有旅游签证或永居，查看额外免签目的地。

## 运行

需要 Node.js 和 Python 3，无需安装 npm 依赖。

```bash
npm run start
```

打开 http://127.0.0.1:4173/。规则校验：`npm test`。

## Vercel

从仓库根目录部署：

- Framework Preset：`Other`
- Build Command：开启 Override，留空
- Output Directory：`dist`

`dist/` 需要随代码提交。
