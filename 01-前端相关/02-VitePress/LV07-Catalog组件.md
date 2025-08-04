---
title: LV07-Catalog组件
date: 2025-08-04 09:20:55
icon: famicons:logo-markdown
index: true
tags:
categories:
---

## 一、概述

Catalog组件是一个用于在VitePress文档中显示当前目录下其他文档链接的组件。它可以帮助读者快速浏览同一目录下的相关内容，提升文档的导航体验。

## 二、实现原理

Catalog组件的实现基于VitePress的插件机制和虚拟模块技术。整个实现分为以下几个部分：

（1）**Vite插件**：负责扫描文件系统并生成目录数据

（2）**虚拟模块**：在构建时或运行时提供目录数据

（3）**Vue组件**：展示目录数据并与用户交互

> 为什么使用虚拟模块？为什么不能直接在组件中获取相关数据，而要使用虚拟模块呢？其实一开始我就是想直接在组件中实现，但是始终无法获取到正确的文档列表，后来采用的这种虚拟模块的方式，这里还有几个重要原因：
>
> （1）**构建时优化**：在生产环境中，我们希望在构建时就确定所有目录数据，而不是在每次页面加载时都去扫描文件系统。这样可以大大提高运行时性能。
>
> （2）**开发环境热更新**：在开发环境中，我们需要监听文件系统的变更并实时更新目录数据。通过虚拟模块和开发服务器中间件，我们可以轻松实现这一功能。
>
> （3）**模块化和解耦**：虚拟模块提供了一种标准化的数据访问接口，使得组件不需要关心数据的具体来源（是来自文件系统扫描还是静态数据），只需要通过统一的接口获取数据。
>
> （4）**SSR兼容性**：VitePress支持服务端渲染，而Node.js的文件系统API在浏览器环境中不可用。通过虚拟模块，我们可以为不同环境提供不同的数据获取方式。

### 1. 工作流程

整个Catalog组件的工作流程可以简单表示为：

>Markdown文件 &rarr; Vite插件 &rarr; 虚拟模块 &rarr; Vue组件渲染 &rarr; 展示目录数据

（1）插件在构建阶段扫描所有Markdown文件

（2）为每个包含index.md的目录生成目录数据

（3）通过虚拟模块机制提供数据访问接口

（4）Catalog组件在运行时获取并展示当前目录的数据

### 2. 数据结构设计

为了高效地存储和检索目录数据，我们设计了以下数据结构：

```typescript
interface CatalogItem {
  path: string    // 文档路径
  title: string   // 文档标题
}

interface CatalogData {
  [key: string]: CatalogItem[]  // 以页面路径为键，目录项数组为值
}
```

这种设计允许我们通过当前页面路径快速查找对应的目录数据。

### 3. 虚拟模块详解

虚拟模块是Vite的一个强大特性，它允许我们在构建时或运行时动态生成模块内容。在Catalog组件中，我们通过以下方式实现虚拟模块：

#### 3.1 模块ID解析

```typescript
resolveId(id) {
  if (id === '@site/catalog') {
    return '@site/catalog'  // 返回虚拟模块的ID
  }
  return null
}
```

#### 3.2 模块内容加载

在开发环境中，我们返回一个动态获取数据的函数：

```javascript
export default function(pagePath) {
  // 开发环境下,通过fetch获取实时数据
  return new Promise((resolve) => {
    fetch('/@site/catalog?page=' + encodeURIComponent(pagePath))
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(() => resolve([]));
  });
}
```

在生产环境中，我们返回预生成的静态数据：

```javascript
export function getCatalog(pagePath) {
  const catalogData = /* 预生成的静态数据 */;
  return catalogData[pagePath] || [];
}

export default function(pagePath) {
  return getCatalog(pagePath);
}
```

#### 3.4 开发服务器中间件

在开发环境中，我们通过中间件处理虚拟模块的API请求：

```typescript
configureServer(server) {
  server.middlewares.use(async (req, res, next) => {
    if (req.url?.startsWith('/@site/catalog')) {
      // 动态扫描文件系统并返回数据
      const data = getCatalogForPage(pagePath, siteConfig)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
      return
    }
    next()
  })
}
```

### 4. 注意事项

（1）确保目录中包含 `index.md` 文件才能生成目录数据

（2）插件会自动排除 `.vitepress`、`public`、`test` 等目录

（3）需要在VitePress配置中正确注册插件

（4）组件需要在支持异步加载的环境中运行

## 三、创建的文件及作用

### 1. 插件文件 (`catalog-plugin.ts`)

`src/.vitepress/theme/plugins/catalog-plugin.ts`是核心插件文件，负责实现以下功能：

- 扫描文件系统中的Markdown文件
- 生成目录数据结构
- 创建虚拟模块提供数据访问
- 支持开发环境和生产环境的不同处理

```typescript
// 主要功能函数
function getCatalogForPage(pagePath: string, siteConfig: any): CatalogItem[]
function scanAllPages(siteConfig: any): CatalogData
```

### 2. 组件文件 (`Catalog.vue`)

`src/.vitepress/theme/components/Catalog.vue`是Vue组件文件，负责展示目录数据：

- 获取当前页面路径
- 调用虚拟模块获取目录数据
- 渲染目录列表
- 处理主题切换和样式

```vue
<!-- 主要功能 -->
<script setup lang="ts">
// 获取当前页面路径
const currentPath = page.value.filePath

// 调用虚拟模块获取数据
const catalogModule = await import('@site/catalog')
const result = await catalogModule.default(pagePath)
</script>
```

### 3. 配置文件 (`config.mts`)

在配置文件`src/.vitepress/config.mts`中注册插件：

```typescript
import { catalogPlugin } from './theme/plugins/catalog-plugin'

export default defineConfig({
  vite: {
    plugins: [
      catalogPlugin({ srcDir: 'src' })  // 注册插件并配置源目录
    ]
  }
})
```

## 四、详细实现过程

### 1. 创建插件文件

在 `src/.vitepress/theme/plugins/` 目录下创建 `catalog-plugin.ts` 文件：

```typescript
import { type Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'

interface CatalogItem {
  path: string
  title: string
}

interface CatalogData {
  [key: string]: CatalogItem[]
}

interface CatalogPluginOptions {
  srcDir?: string
}

export function catalogPlugin(options: CatalogPluginOptions = {}): Plugin {
  const srcDir = options.srcDir || 'src'
  let siteConfig: any = null
  let catalogData: CatalogData = {}
  
  // 插件实现...
}
```

### 2. 实现文件扫描功能

在插件中实现文件扫描和数据生成功能。这个功能分为两部分：

（1）**单页面目录生成**：为特定页面生成同目录下的文件列表

（2）**全站扫描**：在构建时扫描所有页面的目录数据

```typescript
function getCatalogForPage(pagePath: string, siteConfig: any): CatalogItem[] {
  // 移除开头的斜杠和.html后缀
  const normalizedPath = pagePath.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '')

  // 获取当前页面的目录路径
  const dirPath = path.dirname(normalizedPath === 'index' ? '' : normalizedPath)

  // 查找该目录下的所有md文件
  const rootPath = siteConfig.root || process.cwd()
  const fullPath = path.join(rootPath, srcDir, dirPath)

  if (!fs.existsSync(fullPath)) {
    return []
  }

  const files = fs.readdirSync(fullPath)
  const mdFiles = files.filter(file =>
    file.endsWith('.md') &&
    file !== 'index.md' &&
    file !== 'README.md'
  )

  return mdFiles.map(file => {
    // 直接使用文件名（去掉.md后缀）作为标题
    const title = file.replace('.md', '')

    // 生成路径，去掉.md后缀
    const relativePath = path.join(dirPath, file).replace(/\\/g, '/').replace(/\.md$/, '')

    return {
      path: `/${relativePath}`,
      title
    }
  })
}

function scanAllPages(siteConfig: any): CatalogData {
  const rootPath = siteConfig.root || process.cwd()
  const srcPath = path.join(rootPath, srcDir)
  const catalogData: CatalogData = {}

  // 定义需要排除的目录
  const excludedDirs = ['.vitepress', 'public', 'test']

  function scanDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      return
    }

    const files = fs.readdirSync(dirPath)

    // 检查当前目录是否有index.md文件
    if (files.includes('index.md')) {
      // 为每个index.md生成目录数据
      const relativePath = path.relative(srcPath, dirPath).replace(/\\/g, '/')
      const pagePath = relativePath === '' ? 'index' : `${relativePath}/index`

      catalogData[pagePath] = getCatalogForPage(pagePath, siteConfig)
    }

    // 递归扫描子目录
    for (const file of files) {
      // 跳过排除的目录
      if (excludedDirs.includes(file)) {
        continue
      }

      const fullPath = path.join(dirPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scanDirectory(fullPath)
      }
    }
  }

  scanDirectory(srcPath)
  return catalogData
}
```

### 3. 实现虚拟模块机制

使用Vite的插件钩子实现虚拟模块。我们需要实现多个钩子函数来处理不同阶段的需求：

```typescript
export function catalogPlugin(options: CatalogPluginOptions = {}): Plugin {
  const srcDir = options.srcDir || 'src'
  let siteConfig: any = null
  let catalogData: CatalogData = {}

  return {
    name: 'vitepress-catalog-plugin',

    /**
     * 配置解析阶段
     * 获取VitePress的站点配置，设置虚拟模块别名
     */
    configResolved(config) {
      // 获取VitePress的配置
      const vitepressConfig = (config as any).vitepress
      if (vitepressConfig && vitepressConfig.site) {
        siteConfig = vitepressConfig.site
      } else {
        // 如果没有找到VitePress配置，使用默认值
        siteConfig = {
          root: process.cwd()
        }
      }
    },

    /**
     * 模块ID解析钩子
     * 当Vite遇到 '@site/catalog' 导入时，返回虚拟模块ID
     */
    resolveId(id) {
      if (id === '@site/catalog') {
        return '@site/catalog' // 返回虚拟模块的ID
      }
      return null // 不是我们要处理的模块，让其他插件处理
    },

    /**
     * 模块加载钩子
     * 为虚拟模块提供源代码（开发环境）
     */
    load(id) {
      if (id === '@site/catalog') {
        // 开发环境下的动态处理
        // 返回一个函数，该函数通过fetch从服务器获取数据
        return `
          export default function(pagePath) {
            // 开发环境下,通过fetch获取实时数据
            // 这样每次访问都能获取最新的文件系统状态
            return new Promise((resolve) => {
              fetch('/@site/catalog?page=' + encodeURIComponent(pagePath))
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(() => resolve([]));
            });
          }
        `
      }
      return null
    },

    /**
     * 开发服务器配置
     * 处理虚拟模块的API请求
     */
    configureServer(server) {
      // 添加中间件处理虚拟模块的API请求
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/@site/catalog')) {
          const url = new URL(req.url, 'http://localhost:5173')
          const pagePath = url.searchParams.get('page')

          if (pagePath && siteConfig) {
            // 动态扫描文件系统并返回数据
            const data = getCatalogForPage(pagePath, siteConfig)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return
          }
        }
        next()
      })
    },

    /**
     * 构建开始阶段
     * 在生产构建时预扫描所有页面数据
     */
    buildStart() {
      if (siteConfig) {
        // 在构建时扫描所有页面并生成目录数据
        // 这样生产环境就不需要运行时扫描文件系统
        catalogData = scanAllPages(siteConfig)
      }
    },

    /**
     * 生成打包文件
     * 为生产环境创建包含静态数据的虚拟模块
     */
    generateBundle() {
      // 生成虚拟模块，包含预扫描的静态数据
      this.emitFile({
        type: 'asset',
        fileName: '@site/catalog.js',
        source: `
          // 生产环境：使用预生成的静态数据
          export function getCatalog(pagePath) {
            const catalogData = ${JSON.stringify(catalogData, null, 2)};
            return catalogData[pagePath] || [];
          }
          
          export default function(pagePath) {
            return getCatalog(pagePath);
          }
        `
      })
    }
  }
}
```

### 4. 创建Vue组件

在 `src/.vitepress/theme/components/` 目录下创建 `Catalog.vue` 文件：

```vue
<template>
  <div class="catalog-container">
    <h3 class="catalog-title">目录导航</h3>
    <ul v-if="catalogData.length > 0" class="catalog-list">
      <li v-for="item in catalogData" :key="item.path" class="catalog-item">
        <a :href="withBase(item.path)" class="catalog-link">
          <svg class="catalog-icon" viewBox="0 0 1280 1024" width="16" height="16">
            <path d="M1187.7 905.84H92.3C41.4 905.84 0 864.44 0 813.54V210.46c0-50.9 41.4-92.3 92.3-92.3h1095.38c50.9 0 92.3 41.4 92.3 92.3v603.08c0.02 50.9-41.38 92.3-92.28 92.3z m-880-184.6v-240l123.08 153.84 123.08-153.84v240h123.08V302.76h-123.08l-123.08 153.84-123.08-153.84H184.62v418.46h123.08zM1132.3 512h-123.08V302.76h-123.08V512h-123.08l184.62 215.38L1132.3 512z"/>
          </svg>
          {{ item.title }}
        </a>
      </li>
    </ul>
    <p v-else class="catalog-empty">暂无目录</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData, withBase } from 'vitepress'

interface CatalogItem {
  path: string
  title: string
}

const catalogData = ref<CatalogItem[]>([])
const { page } = useData()

onMounted(async () => {
  try {
    // 获取当前页面路径
    const currentPath = page.value.filePath
    if (!currentPath) return
    
    // 将文件路径转换为页面路径
    const pagePath = currentPath
      .replace(/^src\//, '')
      .replace(/\.md$/, '')
      .replace(/\\/g, '/')
    
    // 动态导入虚拟模块
    const catalogModule = await import('@site/catalog')
    if (typeof catalogModule.default === 'function') {
      const result = await catalogModule.default(pagePath)
      catalogData.value = Array.isArray(result) ? result : []
    } else {
      catalogData.value = []
    }
  } catch (error) {
    console.error('Failed to load catalog data:', error)
    catalogData.value = []
  }
})
</script>

<style scoped>
.catalog-container {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
}

.catalog-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 6px;
}

.catalog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.catalog-item {
  margin: 2px 0;
}

.catalog-link {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  color: #475569;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.catalog-link:hover {
  background-color: #e2e8f0;
  color: #1e293b;
  transform: translateX(4px);
}

.catalog-link:active {
  background-color: #cbd5e1;
}

.catalog-icon {
  margin-right: 8px;
  fill: #475569;
  transition: fill 0.2s ease;
}

.catalog-link:hover .catalog-icon {
  fill: #1e293b;
}

/* Dark theme support */
.dark .catalog-container {
  border: 1px solid #475569;
  background-color: rgba(30, 41, 59, 0.8); /* #1e293b with 80% opacity */
}

.dark .catalog-title {
  color: #f1f5f9;
  border-bottom: 2px solid rgba(30, 41, 59, 0.8);
}

.dark .catalog-link {
  color: #cbd5e1;
}

.dark .catalog-link:hover {
  background-color: #475569;
  color: #f1f5f9;
}

.dark .catalog-icon {
  fill: #cbd5e1;
}

.dark .catalog-link:hover .catalog-icon {
  fill: #f1f5f9;
}

.dark .catalog-empty {
  color: #94a3b8;
}

.catalog-empty {
  margin: 0;
  padding: 8px;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}
</style>
```

### 5. 配置插件

在 `src/.vitepress/config.mts` 中注册插件：

```typescript
import { defineConfig } from 'vitepress'
import { catalogPlugin } from './theme/plugins/catalog-plugin'

export default defineConfig({
  vite: {
    plugins: [
      catalogPlugin({ srcDir: 'src' })  // 配置源目录
    ]
  }
})
```


## 五、使用方法

### 1. 在Markdown中使用

在需要显示目录的页面中，可以直接使用Catalog组件：

```markdown
<script setup>
import Catalog from '../.vitepress/theme/components/Catalog.vue'
</script>

# 页面标题

页面内容...

<Catalog />
```

### 2. 自定义配置

可以通过修改插件配置来自定义源目录：

```typescript
// 在 config.mts 中
catalogPlugin({ srcDir: 'docs' })  // 使用docs目录作为源目录
```

## 六、主题适配

Catalog组件支持VitePress的亮色和暗色主题：

```css
/* 浅色主题样式 */
.catalog-container {
  background-color: #f8fafc;
}

/* 深色主题样式 */
.dark .catalog-container {
  background-color: rgba(30, 41, 59, 0.8);
}
```

