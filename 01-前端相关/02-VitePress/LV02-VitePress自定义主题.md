---
title: LV02-VitePress自定义主题
date: 2025-07-09 09:23:41
icon: famicons:logo-markdown
index: true
tags:
categories:
---

来了解一下怎么在vitepress中自定义一个主题和组件。

<!-- more -->

## 一、自定义主题

一开始肯定是去查资料怎么实现喽，先去翻官网的资料，看一下这个[自定义主题 | VitePress](https://vitejs.cn/vitepress/guide/custom-theme#using-a-custom-theme)和[扩展默认主题 | VitePress](https://vitejs.cn/vitepress/guide/extending-default-theme)，接下来就先按文档来尝试一下文档中说的内容。

### 1. 解析主题

可以通过创建一个 `.vitepress/theme/index.js` 或 `.vitepress/theme/index.ts` 文件 (即“主题入口文件”) 来启用自定义主题。当**检测到存在主题入口文件时，VitePress 总会使用自定义主题而不是默认主题**。但我们可以[扩展默认主题](https://vitejs.cn/vitepress/guide/extending-default-theme)来在其基础上实现更高级的自定义。我这里用的是ts文件，所以我的目录结构就是：

```shell
.
├─ src                 # 项目根目录
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.ts    # 主题入口
│  │  └─ config.mts     # 配置文件
│  └─ index.md
└─ package.json
```

当`theme/index.ts`文件为空时，我们执行`npm run docs:dev`后，原本的页面也都会消失，这就是因为有了这个文件后就会不再使用默认主题了，我们需要扩展以下默认主题，可以在这个文件中添加以下内容：

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'

export default DefaultTheme

```

这样，我们就可以在默认主题上扩展自己的内容啦。

### 2. 主题接口

我们查阅文档[自定义主题 | VitePress —— 主题接口](https://vitejs.cn/vitepress/guide/custom-theme#theme-interface)这部分，可以知道自定义主题是一个对象，找个对象具有如下接口：

```typescript
interface Theme {
  /**
   * 每个页面的根布局组件
   * @required
   */
  Layout: Component
  /**
   * 增强 Vue 应用实例
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * 扩展另一个主题，在我们的主题之前调用它的 `enhanceApp`
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Vue 应用实例
  router: Router // VitePress 路由实例
  siteData: Ref<SiteData> // 站点级元数据
}
```

### 3. 扩展默认主题

我们上面扩展默认主题的写法是没办法再自定义了，我们可以使用主体接口中的extend选项来扩展，这样`theme/index.ts`可以修改如下：

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'

export default {
	extends: DefaultTheme,
}

```

这样我们不仅可以扩展主题，还可以在里面使用其它接口。

## 二、构建布局

接下来我们看一下 [自定义主题 | VitePress —— 构建布局](https://vitejs.cn/vitepress/guide/custom-theme#building-a-layout) 来按照文档写一个自定义的布局。

### 1.  `<Content />`

最基本的布局组件需要包含一个[`<Content />`](https://vitejs.cn/vitepress/reference/runtime-api#content)组件：

```vue
<!-- .vitepress/theme/MyLayout.vue -->
<template>
  <h1>Custom Layout!</h1>

  <!-- 此处将渲染 markdown 内容 -->
  <Content />
</template>
```

### 2. 使用自定义布局

我们修改`theme/index.ts`如下：

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  Layout: MyLayout,
}
```

然后就会发现，我们所有的页面全部变成了只显示一个`Custom Layout!`和markdown内容的页面，这就是因为我们把默认的布局该覆盖掉了。那怎么办，和上面扩展默认主题一样，继续在默认的布局中扩展就可以了，我们可以修改一下 `theme/Layout.vue` ：

```vue
<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>
<template>
  <Layout>
    <h1>Custom Layout!</h1>

    <!-- 此处将渲染 markdown 内容 -->
    <Content />
  </Layout>
</template>
```

然后会发现 `Custom Layout!`不见了，应该是被覆盖掉了，我们可以参考一下 [扩展默认主题 | VitePress —— 布局插槽](https://vitejs.cn/vitepress/guide/extending-default-theme#layout-slots)，然后修改如下：

```vue
<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>
<template>
  <Layout>
    <template #layout-top>
      <h1>Custom Layout!</h1>

      <!-- 此处将渲染 markdown 内容 -->
      <Content />
    </template>
  </Layout>
</template>

```

然后就会看到主页面正常了，最上面会显示出`Custom Layout!`这个字符串。但是有一些页面可能是有默认的布局影响，会显示异常，可以自己新建一个md文档，在里面做测试。

### 3. [usedata](https://vitejs.cn/vitepress/reference/runtime-api#usedata)

[`useData()`](https://vitejs.cn/vitepress/reference/runtime-api#usedata) 为我们提供了所有的运行时数据，以便我们根据不同条件渲染不同的布局。我们可以访问的另一个数据是当前页面的 frontmatter。例如

```vue
<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
const { Layout } = DefaultTheme
const { theme, frontmatter, page } = useData()
</script>
<template>
  <Layout>
    <template #layout-top>
      <h1>Custom Layout!</h1>
      <h2>theme.logo:{{ theme.logo }}</h2>
      <h2>frontmatter.title :{{ frontmatter.title }}</h2>
      <h2>frontmatter.layout:{{ frontmatter.layout }}</h2>
      <h2>page.filePath:{{ page.filePath }}</h2>
      <h2>page.relativePath:{{ page.relativePath }}</h2>

      <!-- 此处将渲染 markdown 内容 -->
      <Content />
    </template>
  </Layout>
</template>

```

### 4. 总结

不是做vue开发的，所以这里的布局后来就没改过了，直接注释掉了，还是用默认的吧。

## 三、注册全局组件

接下来参考 [扩展默认主题 | VitePress —— 注册全局组件](https://vitejs.cn/vitepress/guide/extending-default-theme#registering-global-components) 这部分内容，这个主要是要用到vue的[组件注册](https://cn.vuejs.org/guide/components/registration)，这里就不详细去了解了，属于vue的知识了。我们在theme目录下创建一个components目录，里面专门放我们的组件，然后创建一个MyGlobalComponent.vue文件并添加以下内容：

```vue
<!-- .vitepress/theme/components/MyGlobalComponent.vue -->
<template>
  <div>MyGlobalComponent</div>
</template>

```

然后我们在主题文件中注册这个组件：

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
// import MyLayout from './Layout.vue'
import MyGlobalComponent from './components/MyGlobalComponent.vue'
export default {
	extends: DefaultTheme,
	// 使用注入插槽的包装组件覆盖 Layout
  // Layout: MyLayout,
  enhanceApp({ app }) {
    // 注册自定义全局组件
    app.component('MyTag', MyGlobalComponent)
  }
}
```

然后，我们新建一个md文档，我这里直接子啊index.md文档里写了，我们输入下面的内容：

```markdown
<MyTag />
```

文档中的这个标签就会被替换成`MyGlobalComponent`了。



> 参考资料：
>
> [如何在 VitePress 中增加一个全局自定义组件_vitepress 自定义组件-CSDN博客](https://blog.csdn.net/sxc1414749109/article/details/140824081)
