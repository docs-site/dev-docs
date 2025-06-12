---
title: vitepress文档
date: 2025-06-11 09:52:46
icon: famicons:logo-markdown
index: true
tags:
categories:
---

<!-- more -->

## <font size=3>一、创建site</font>

> 这个直接看官网的文档就是了：[快速开始 | VitePress - (vitepress.dev)](https://vitepress.dev/zh/guide/getting-started) 或者 [VitePress | 由 Vite 和 Vue 驱动的静态站点生成器](https://vitejs.cn/vitepress/)。

### <font size=3>1. 安装向导</font>

这里简单记录一下，找一个空的目录，执行以下命令：

```shell
npx vitepress init
```

> Tips：pnpm作为更高效的包管理器，为什么不在这里用？因为我是新手，有多个npm项目，用pnpm都是全局安装一些包，要是有版本问题我不知道怎么解决，为这些问题折腾也不是很值得，以后了解深入了再用。

然后就是一系列的命令行交互，我是这样填写的：

```shell
D:\sumu_blog\site-vitepress> npx vitepress init

┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./src
│
◇  Site title:
│  苏木
│
◇  Site description:
│  苏木的文档
│
◇  Theme:
│  Default Theme + Customization
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
└  Done! Now run npm run docs:dev and start writing.

Tips:
- Since you've chosen to customize the theme, you should also explicitly install vue as a dev dependency.
```

我觉得默认主题挺简约的，可以选择默认主题，然后自己再自定义，后面就是还选择npm作为包管理器。然后为了本地构建静态网页，我们还需要安装依赖：

```shell
npm install
npm add -D vitepress
```

### <font size=3>2. 项目结构</font>

最终创建的目录结构如下：

```shell
D:\sumu_blog\site-vitepress> sdoc tree
site-vitepress
├── node_modules
├── package-lock.json
├── package.json
└── src
    ├── .vitepress
    │   ├── config.mts
    │   └── theme
    │       ├── index.ts
    │       └── style.css
    ├── api-examples.md
    ├── index.md
    └── markdown-examples.md
```

- `src` 目录作为 VitePress 站点的项目**根目录**。
- `.vitepress` 目录是 VitePress 配置文件、开发服务器缓存、构建输出和可选主题自定义代码的位置。

> Tips：默认情况下，VitePress 将其开发服务器缓存存储在 `.vitepress/cache` 中，并将生产构建输出存储在 `.vitepress/dist` 中。如果使用 Git，应该将它们添加到 `.gitignore` 文件中。也可以手动[配置](https://vitejs.cn/vitepress/reference/site-config#outdir)这些位置。

### <font size=3>3. 启动并运行</font>

创建站点的时候，生成的package.json已经为我们配置好了命令：

```json
{
      "scripts": {
        "docs:dev": "vitepress dev src",
        "docs:build": "vitepress build src",
        "docs:preview": "vitepress preview src"
      },
}
```

`docs:dev` 脚本将启动具有即时热更新的本地开发服务器。我们直接执行：

```shell
D:\sumu_blog\site-vitepress> npm run docs:dev

> docs:dev
> vitepress dev src


  vitepress v1.6.3

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

然后浏览器打开对应的地址，就可以看到生成的静态页面啦。

## <font size=3>二、基本配置</font>



