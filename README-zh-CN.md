# Astro Theme Pure

[English](./README.md) | [简体中文](./README-zh-CN.md)

一个由 Astro 构建的轻便简洁、快速强大的博客主题。

[![GitHub deployments](https://img.shields.io/github/deployments/cworld1/astro-theme-pure/production?style=flat&logo=vercel&label=vercel)](https://astro-pure.js.org/)
[![NPM Version](https://img.shields.io/npm/v/astro-pure?logo=npm&style=flat)](https://www.npmjs.com/package/astro-pure)
[![GitHub Release](https://img.shields.io/github/v/release/cworld1/astro-theme-pure?include_prereleases&style=flat&label=template)](https://github.com/cworld1/astro-theme-pure/releases)
[![GitHub License](https://img.shields.io/github/license/cworld1/astro-theme-pure?style=flat)](https://github.com/cworld1/astro-theme-pure/blob/main/LICENSE)

![image](./.github/assets/header.webp)
![image](./.github/assets/body.webp)

> [!CAUTION]
> 我们目前正在积极开发升级到 Astro v5 和 NPM 包方法。新版本已知问题：
>
> 1. 无法在 Vercel 上打包站点地图和 pagefind 资源（[需要上游修复](https://github.com/withastro/astro/issues/12663) & 临时修复）
> 2. Head 标签和自定义选项仍在开发中（已经暴露模板直接改）
> 3. Rehype 标题链接在 NPM 模块链接方法中无法按预期工作（用户无影响）
>
> 稳定版本目前为 [v3.1.4](https://github.com/cworld1/astro-theme-pure/tree/v3.1.4)。

## 简介

查看 [预览 →](https://astro-pure.js.org/)

## :fire: 特性

- [x] :rocket: 快速高性能
- [x] :star: 简单干净的设计
- [x] :iphone: 响应式设计
- [x] :mag: 使用 [pagefind](https://pagefind.app/) 构建的全站搜索
- [x] :world_map: 站点地图和 RSS 订阅
- [x] :spider_web: 友好的 SEO
- [x] :book: 目录（table of contents）
- [x] :framed_picture: 动态为文章生成可供三方媒体预览的分享图像
- [x] :framed_picture: Mediumzoom 图像灯箱

## :package: 组件

主题包含了许多组件，不仅可以在主题中使用，还可以在其他 Astro 项目中使用。

> 对于其他 Astro 项目，需要 Tailwind CSS。

- 基础组件：`Aside`、`Tabs`、`Timeline`、`Steps`、`Spoiler`...
- 高级组件：`GithubCard`、`LinkPreview`、`Quote`、`QRCode`...

## :white_check_mark: Lighthouse 分数

[![lighthouse-score](./.github/assets/lighthouse-score.png)](https://pagespeed.web.dev/analysis/https-cworld-top/o229zrt5o4?form_factor=mobile&hl=en)

## 文档

[文档](https://astro-pure.js.org/docs/list) | [展示台](https://github.com/cworld1/astro-theme-pure/issues/10)

## NPM 包

在 NPM 上查看：[astro-theme-pure](https://www.npmjs.com/package/astro-pure)

## 本地开发

环境要求：

- [Nodejs](https://nodejs.org/): 18.0.0+

克隆存储库：

```shell
git clone https://github.com/cworld1/astro-theme-pure.git
cd astro-theme-pure
```

有用的命令：

```shell
# install dependencies
bun install

# start the dev server
bun dev

# build the project
bun run build

# preview (after the build)
bun preview

# create a new post
bun new-post
```

## 贡献

为了花更多时间编写代码，减少在空白上纠结的时间，本项目使用代码约定和样式来鼓励一致性。风格一致的代码更容易（且更不容易出错）进行审查、维护和理解。

## 鸣谢

- [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus)
- [Astro Resume](https://github.com/srleom/astro-theme-resume)
- [Starlight](https://github.com/withastro/starlight)

## 许可证

本项目基于 Apache 2.0 许可证。

[![Star History Chart](https://api.star-history.com/svg?repos=cworld1/astro-theme-pure&type=Date)](https://star-history.com/#cworld1/astro-theme-pure&Date)
