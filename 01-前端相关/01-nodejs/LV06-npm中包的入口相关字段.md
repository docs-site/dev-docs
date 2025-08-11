---
title: LV06-npm中包的入口相关字段
date: 2025-08-12 09:02:56
icon: famicons:logo-markdown
index: true
tags:
categories:
copyright: true
keywords:
cover:
comments:
mathjax:
top:
description:
---

在做vitepress侧边栏的包的时候，总是会出现config.mts导入报错，为什么？因为导入包的时候我们要知道这是一个什么样的模块，是CommonJS还是ES模块？这个包是要在node环境中用，还是在浏览器环境中用？接下来就来了解一下package.json中相关的一些字段吧。

<!-- more -->

## 一、文件扩展名

开始之前，先来看一下这几种后缀的文件：

| 文件后缀 | 适用模块系统 | 主要使用场景 |
|---------|------------|---------|
| .js | CommonJS / ES Module | 通用JavaScript文件、浏览器端脚本、Node.js项目 |
| .cjs | CommonJS | 明确指定为CommonJS模块、Node.js向后兼容 |
| .mjs | ES Module | 明确指定为ES模块、现代前端项目、浏览器原生模块 |
| .ts | TypeScript / CommonJS / ES Module | TypeScript项目源代码、大型前端应用、需要类型检查的项目 |
| .mts | TypeScript / ES Module | 明确指定为ES模块的TypeScript文件、现代TypeScript项目 |
| .cts | TypeScript / CommonJS | 明确指定为CommonJS的TypeScript文件、Node.js TypeScript项目 |
| .d.ts | TypeScript Declaration | TypeScript类型声明文件、JavaScript库的类型定义 |

### 1. JavaScript相关文件后缀

#### 1.1 `.js` 文件

JS文件是JavaScript代码的载体，后缀名为“.js”。 JavaScript是一种广泛用于网页开发的编程语言，能够在浏览器中执行。JS文件可以嵌入HTML文件中、通过外部引用链接导入、在服务器端运行（如Node.js）。在 TypeScript 项目中也可以直接使用。TypeScript 是 JavaScript 的超集，因此任何有效的 JavaScript 代码也都是有效的 TypeScript 代码。

##### 1.1.1 模块系统支持

可以使用CommonJS (默认) 和 ES Module。具体模式由package.json的"type"字段决定。

```json
"type": "module",
```

无"type"字段就表示是CommonJS，type值为module就表示是ES Module。

##### 1.1.2 模块细节

- **CommonJS模式**：

（1）使用`require()/module.exports`语法

（2）同步加载模块

（3）适用于Node.js传统项目，例如服务器。

（4）`__dirname/__filename`全局变量可用。

（5）当一个模块**导入其他模块**时，不需要显式指定扩展名，会自动尝试`.js`&rarr;`.json`&rarr;`.node`。

- **ES Module模式**：

（1）使用import/export语法

（2）异步加载模块

（3）支持top-level await

（4）在不执行代码的情况下分析代码结构和依赖关系。ES Module的导入导出语句在编译时就能确定，这使得构建工具能够准确识别模块间的依赖关系、移除未使用的代码（Dead Code Elimination）、实现Tree Shaking优化，只打包实际使用的代码，提供更好的代码压缩效果。

（5）在ES Module中，当一个模块**导入其他模块**时，相对导入路径必须包含文件扩展名，这是与CommonJS的重要区别。注意，这里的规则主要适用于模块的导入方，而不是被导入的模块文件本身。

```javascript
// 错误 - ES Module中不包含扩展名会报错
import { helper } from './utils';

// 正确 - 必须包含扩展名
import { helper } from './utils.js';
import { config } from './config.json';

// 对于目录导入，需要指向具体的文件
import { module } from './lib/index.js';  // 而不是 './lib'
```

为什么这么要求？主要是确保模块解析的明确性，避免文件系统查找开销，使工具能够准确分析依赖关系。而对于被其他模块导入的文件本身（即作为导出方），它并不强制要求其文件扩展名，而是由导入它的模块来遵循此规则。


##### 1.1.3 代码示例

```javascript
// CommonJS示例
const fs = require('fs');
const joinPaths = (...args) => path.join(...args);
module.exports = { joinPaths };

// ES Module示例
import { readFile } from 'node:fs/promises';
export const readJSON = async (path) =>
  JSON.parse(await readFile(path, 'utf-8'));
```

#### 1.2 `.cjs` 文件

`.cjs` 文件是 **CommonJS 模块**的文件扩展名，主要用于 Node.js 环境中定义和使用模块。

##### 1.2.1 模块系统支持

专用于CommonJS模块系统，无论项目的package.json文件中"type"字段设置为什么值，.cjs文件始终会被当作CommonJS模块来处理。这意味着可以在一个设置了"type": "module"的项目中使用.cjs文件来编写CommonJS代码，而不需要担心模块系统冲突。

这种文件在ES模块项目中明确分离模块类型，避免模块系统混淆，在为库提供双格式支持时，可以明确区分.cjs和.mjs。

> Tips：一般是用来兼容那些只支持旧版CommonJS格式的npm包

##### 1.2.2 模块细节

- **强制CommonJS模式**：

（1）无论项目配置如何，始终使用require()/module.exports

（2）不支持ES Module的import/export语法

（3）与.mjs文件可在同一项目中共存

（4）解决了.js文件在"type": "module"项目中的兼容性问题

- **执行机制**：

（1）同步模块加载

（2）模块缓存机制

（3）支持循环依赖（但可能导致未定义行为）

##### 1.2.3 常见问题及解决方案

- （1）**`__dirname和__filename`不可用**：

```javascript
// 解决方案
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

- （2）**JSON导入方式**：

```javascript
// .cjs文件中
const config = require('./config.json');
```

##### 1.2.4 代码示例

```javascript
// 配置加载器示例
const fs = require('fs');
const path = require('path');

function loadConfig(configPath) {
    const fullPath = path.resolve(__dirname, configPath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function saveConfig(configPath, data) {
    const fullPath = path.resolve(__dirname, configPath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

module.exports = { loadConfig, saveConfig };
```

#### 1.3 `.mjs` 文件

`.mjs` 是 JavaScript 的模块文件扩展名，代表"Module JavaScript"，是 ECMAScript 模块(ESM)的官方文件扩展名。在 Node.js 环境中使用此后缀名可以明确表示这是 ES 模块。`.mjs` 扩展名的引入主要是为了解决 JavaScript 生态中长期存在的模块系统混乱问题，为 ES 模块提供明确的标识。

> Tips：不是所有环境都原生支持.mjs 文件，某些旧工具链可能需要额外配置才能处理.mjs

##### 1.3.1 模块系统支持

- 专用于ES Module模块系统
- 完全独立于package.json的"type"字段

##### 1.3.2 模块细节

- **强制ES Module模式**：

（1）无论项目配置如何，始终使用import/export语法

（2）不支持CommonJS的require()/module.exports

（3）可以与.cjs文件可在同一项目中共存

（4）解决了.js文件在"type": "commonjs"项目中的兼容性问题

（5）当一个模块**导入其他模块**时，模块路径必须包含完整扩展名(不能省略.mjs)。

- **执行机制**：

（1）异步模块加载

（2）静态分析和tree-shaking支持

（3）支持top-level await

（4）更严格的模块解析规则

##### 1.3.3 关键特性

- **Top-level await支持**：

```javascript
// 可以在模块顶层直接使用await
const data = await fetch('/api/config').then(res => res.json());
export { data };
```

- **动态导入**：

```javascript
// 条件加载模块
if (condition) {
    const module = await import('./feature.js');
    module.doSomething();
}
```

- **模块元数据**：

```javascript
// 获取模块自身信息
console.log(import.meta.url);  // 模块URL
console.log(import.meta.resolve('./relative-path'));  // 解析相对路径
```

##### 1.3.4 常见问题及解决方案

- **文件扩展名必须明确**：

```javascript
// 错误 - 相对导入必须包含扩展名
import { helper } from './utils';

// 正确
import { helper } from './utils.mjs';
```

- **`__dirname`和`__filename`不可用**：

```javascript
// 解决方案
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

##### 1.3.5 代码示例

```javascript
// 现代HTTP客户端示例
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Top-level await使用
const config = await readFile('./config.json', 'utf8').then(JSON.parse);

export class HttpClient {
    constructor(baseURL = config.apiBase) {
        this.baseURL = baseURL;
    }
    
    async get(endpoint) {
        const url = new URL(endpoint, this.baseURL);
        const response = await fetch(url);
        return response.json();
    }
}

// 动态导入功能模块
export async function loadFeature(name) {
    try {
        const module = await import(`./features/${name}.mjs`);
        return module.default;
    } catch (error) {
        console.warn(`Failed to load feature ${name}:`, error);
        return null;
    }
}

// 创建HTTP服务器
const server = createServer(async (req, res) => {
    if (req.url === '/api/data') {
        const client = new HttpClient();
        const data = await client.get('/data');
        res.end(JSON.stringify(data));
    }
});

server.listen(3000);
```

#### 1.4 `.js`与`.mjs`文件

| 特性       | .mjs 文件                | 普通.js 文件                      |
| :--------- | :----------------------- | :-------------------------------- |
| 模块类型   | 始终被视为 ES 模块       | 取决于 `package.json` 或扩展名    |
| 导入/导出  | 必须使用 `import/export` | 可以使用 `require/module.exports` |
| 严格模式   | 默认启用                 | 需要手动启用                      |
| 文件扩展名 | `.mjs`                   | `.js`                             |

### 2. TypeScript相关文件后缀

#### 2.1 .ts 文件

`.ts` 是 TypeScript 文件的标准扩展名，用于存储 TypeScript 代码。在一个 TypeScript 项目中，大部分代码都会存储在 .ts 文件中。这些文件中可以包含变量声明、函数定义、类定义等 TypeScript 语言的特性。

##### 2.1.1 模块系统支持
支持多种模块系统：CommonJS、ES Module、AMD、UMD等。实际模块系统由tsconfig.json中的"module"选项决定，编译后可生成对应模块系统的JavaScript代码。

##### 2.1.2 模块细节

- **模块系统配置**：（可以参考[module](https://www.typescriptlang.org/zh/tsconfig/#module)）

（1）"module": "commonjs" - 生成CommonJS代码

（2）"module": "esnext" - 生成ES Module代码

（3）"module": "umd" - 生成UMD代码，兼容多种环境

- **编译过程**：

（1）类型擦除：运行时无类型信息

（2）可配置目标JavaScript版本（ES5、ES6等）

（3）支持source map便于调试

##### 2.1.4 常见问题及解决方案

- **any类型的滥用**：

```typescript
// 避免
const data: any = getData();

// 推荐
interface DataStructure {
  id: number;
  name: string;
}
const data: DataStructure = getData();
```

- **模块解析问题**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

##### 2.1.5 代码示例

```typescript
// math.ts
export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;

// main.ts
import { add, subtract } from './math';

console.log(add(5, 3)); // 输出: 8
console.log(subtract(5, 3)); // 输出: 2
```

#### 2.2 `.mts` 文件

TS4.5 新增的扩展名，专用于ES Module的TypeScript文件。

##### 2.2.1 模块系统支持
专用于ES Module的TypeScript文件，编译后生成.mjs文件。完全独立于tsconfig.json的"module"配置。

##### 2.2.2 模块细节
- **强制ES Module模式**：

（1）无论tsconfig.json如何配置，始终使用import/export语法

（2）编译后始终生成ES Module格式的JavaScript

（3）与.cts文件可在同一项目中共存

（4）解决了.ts文件在不同module配置下的不确定性

##### 2.2.3 常见问题及解决方案
- **文件扩展名必须明确**：

```typescript
// 错误 - 相对导入必须包含扩展名
import { helper } from './utils';

// 正确
import { helper } from './utils.mts';
```

- **与CommonJS交互**：

```typescript
// 导入CommonJS模块
import fs = require('fs');  // 在ES Module中仍然可用
// 或者
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const someCjsModule = require('some-cjs-module');
```

- **JSON模块导入（实验性）**：

```typescript
// 需要在tsconfig.json中启用
// {
//   "compilerOptions": {
//     "resolveJsonModule": true
//   }
// }

import config from '../config.json' assert { type: 'json' };
```

##### 2.2.4 代码示例

- 目录结构

```typescript
ts-demo
├── src
│   ├── main.ts       
│   └── math.mts      
└── tsconfig.json     

1 directories, 3 files
```

- src/math.mts 

```typescript
// src/math.mts
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}
```

- src/main.ts 

```typescript
// src/main.ts
import { add, multiply } from './math.mjs';

console.log('Addition: 2 + 3 =', add(2, 3));
console.log('Multiplication: 4 * 5 =', multiply(4, 5));
```

- tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```



#### 2.3 `.cts` 文件

TS4.5 新增的扩展名，专用于于CommonJS的TypeScript文件。

##### 2.3.1 模块系统支持
专用于CommonJS的TypeScript文件，编译后生成.cjs文件。完全独立于tsconfig.json的"module"配置。

##### 2.3.2 模块细节
- **强制CommonJS模式**：

（1）无论tsconfig.json如何配置，始终使用require()/module.exports语法

（2）编译后始终生成CommonJS格式的JavaScript

（3）与.mts文件可在同一项目中共存

（4）解决了.ts文件在不同module配置下的不确定性

##### 2.3.3 常见问题及解决方案

- **ES Module类型导入**：

```typescript
// 错误 - 不能在.cts中使用ES导入语法
import type { User } from './types.mts';  // 不推荐

// 正确 - 使用JSDoc或类型导入
/** @typedef {import('./types.mts').User} User */
// 或者
import type { User } from './types';  // 如果有对应的.d.ts文件
```

- **循环依赖处理**：

```typescript
// 使用延迟加载解决循环依赖
let userService: UserService;

function getUserService(): UserService {
  if (!userService) {
    userService = require('./userService.cts');
  }
  return userService;
}

module.exports = { getUserService };
```

- **JSON导入**：

```typescript
// CommonJS标准方式
const config = require('../config.json');

// 或者带类型安全
interface Config {
  port: number;
  host: string;
}

const config: Config = require('../config.json');
```

##### 2.3.4 代码示例

- 目录结构

```typescript
ts-demo
├── src
│   ├── main.ts       
│   └── math.cts      
└── tsconfig.json     

1 directories, 3 files
```

- src/math.cts 

```typescript
// math.cts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
```

- src/main.ts 

```typescript
// main.ts
import { add, subtract } from './math.cjs';

console.log(add(1, 2));
console.log(subtract(5, 3));
```

- tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "checkJs": false,
    "removeComments": false,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### 2.4 `.d.ts` 文件

`.d.ts` 是 TypeScript 声明文件的扩展名，用于描述已有 JavaScript 库或模块的类型信息。当在 TypeScript 项目中使用第三方 JavaScript 库时，通常需要为其编写一个声明文件，以便 TypeScript 可以理解该库的类型信息。

##### 2.4.1 模块系统支持

专门用于TypeScript类型声明,不参与实际模块系统的运行时行为。为JavaScript库和模块提供类型信息。

##### 2.4.2 文件特点

- **纯类型文件**：

（1）只包含类型信息，不含任何运行时代码

（2）编译过程中被完全擦除

（3）不会产生任何JavaScript输出

（4）支持ambient declarations（环境声明）

- **声明空间**：

（1）全局声明空间：declare var, declare function, declare class

（2）模块声明空间：declare module

（3）命名空间声明：namespace

- **三斜线指令**：

```typescript
/// <reference types="node" />
/// <reference path="./custom.d.ts" />
/// <reference lib="es2015" />
```

##### 2.4.3 使用场景

- **JavaScript库类型增强**：为现有的JavaScript库提供类型定义，提升开发体验和代码安全性

- **全局类型声明**：扩展全局对象（Window、global等），声明全局变量和函数
- **模块类型声明**：为没有类型定义的模块提供声明，为自定义模块格式提供类型支持

##### 2.4.4 基本用法

- **模块声明结构**：

```typescript
// 为第三方库提供声明
declare module 'third-party-lib' {
  export interface Config {
    apiKey: string;
    timeout: number;
  }
  
  export function initialize(config: Config): void;
  export default function main(): void;
}
```

- **全局声明组织**：

```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      config: AppConfig;
    };
  }
  
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    CUSTOM_API_KEY: string;
  }
}

// 必须导出至少一个东西使文件成为模块
export {};
```

- **类型声明发布**：

```json
// package.json
{
  "name": "my-library",
  "types": "dist/index.d.ts",
  "files": [
    "dist/"
  ]
}
```

- **模块合并**：

```typescript
// 可以多次声明同一个模块来合并声明
declare module 'express' {
  interface Request {
    user?: User;
  }
}

declare module 'express' {
  interface Response {
    sendSuccess(data: any): this;
  }
}
```

- **命名空间声明**：

```typescript
// 声明命名空间
declare namespace MyLibrary {
  interface Config {
    debug: boolean;
  }
  
  function init(config: Config): void;
}

// 使用
MyLibrary.init({ debug: true });
```

- **类型导入**：

```typescript
// 从其他声明文件导入类型
import type { User } from './user';

declare module 'auth-service' {
  export function getCurrentUser(): User;
}
```

##### 2.4.5 常见问题及解决方案

- **模块解析问题**：

```typescript
// 确保TypeScript能找到声明文件
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["node", "jest"]
  }
}
```

- **默认导出声明**：

```typescript
// 正确声明默认导出
declare module 'my-module' {
  const value: string;
  export default value;
}

// 错误的方式
declare module 'my-module' {
  export default string;  // 不正确
}
```

- **复合导出声明**：

```typescript
// 声明既有默认导出又有命名导出的模块
declare module 'hybrid-module' {
  export interface Options {
    timeout: number;
  }
  
  export function doWork(options: Options): Promise<void>;
  
  // 默认导出
  export default function createWorker(): Worker;
}
```

##### 2.4.6 代码示例

- 目录结构

```typescript
ts-demo
├── src
│   ├── main.ts       
│   └── math.mts      
└── tsconfig.json     

1 directories, 3 files
```

- src/math.mts 

```typescript
// math.mts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
```

- src/main.ts 

```typescript
import { add, subtract } from './math';

console.log(add(1, 2));
console.log(subtract(5, 3));
```

这里我们为了演示效果，可以吧后缀去掉，这个时候编译就会出现报错，并且也会触发语法检查报错，但我们创建.d.ts文件后，报错都会消失。

- src/math.d.ts

```typescript
// math.d.ts
export function add(a: number, b: number): number;
export function subtract(a: number, b: number): number;
```

- tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "checkJs": false,
    "removeComments": false,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": false,
    "sourceMap": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 3. 如何选择合适的文件后缀？

- **新项目**：

（1）如果项目完全使用ES模块：使用.mjs或.js（配合package.json中的"type": "module"）

（2）如果项目使用TypeScript：使用.ts，根据需要选择.mts或.cts来明确模块系统

- **现有项目**：

（1）CommonJS项目：继续使用.js或明确使用.cjs

（2）迁移到ES模块：可以混合使用.js（CommonJS）和.mjs（ES模块）

- **库开发**：

（1）提供双模块支持：同时提供CommonJS（.cjs）和ES模块（.mjs）版本

（2）TypeScript库：提供.ts源码和编译后的.js/.mjs/.cjs文件，以及.d.ts类型声明

## 二、模块导入的相对路径

### 1. Javascript
在 JavaScript 中导入模块时，对于相对路径的模块处理有一些特定规则：

- **是否需要指明具体后缀**：

在 JavaScript 文件（.js）中，当导入相对路径的模块时，通常不需要显式指定文件扩展名，Node.js 会自动解析。但在某些情况下，特别是当项目配置了不同的模块解析策略或者使用的是较新的模块格式如 .mjs 或 .cjs 时，可能需要明确指定扩展名。

- **可以导入的模块类型**：

（1）JavaScript 可以导入多种类型的模块，包括 JavaScript (.js)、ES 模块 (.mjs)、CommonJS 模块 (.cjs)。

（2）当导入这些不同类型的模块时，需要考虑目标运行环境和 package.json 中的配置。

- **如何导入不同类型模块**：

（1）导入 .js 模块：可以直接通过相对路径导入，例如 `import utils from './utils';` 或 `const utils = require('./utils');`（取决于模块系统）

（2）导入 .mjs 模块：需要明确指定扩展名，例如 `import utils from './utils.mjs';`

（3）导入 .cjs 模块：在 ES 模块中可以使用 `import utils from './utils.cjs';`，在 CommonJS 模块中使用 `const utils = require('./utils.cjs');`

### 2. Typescript

在 TypeScript 中导入模块时，对于相对路径的模块处理有一些特定规则：

- **是否需要指明具体后缀**：

在 TypeScript 文件（.ts）中，当导入相对路径的模块时，通常不需要显式指定文件扩展名，TypeScript 编译器会自动解析。但在某些情况下，特别是当项目配置了不同的模块解析策略或者使用的是较新的模块格式如 .mts 或 .cts 时，可能需要明确指定扩展名。

- **可以导入的模块类型**：

（1）TypeScript 可以导入多种类型的模块，包括 JavaScript (.js)、ES 模块 (.mjs)、CommonJS 模块 (.cjs) 以及其他 TypeScript 文件（.ts, .mts, .cts）。

（2）当导入这些不同类型的模块时，需要考虑目标运行环境和编译配置。

- **如何导入不同类型模块**：

（1）导入 .js 模块：可以直接通过相对路径导入，例如 `import utils from './utils';`

（2）导入 .mjs 模块：如果项目配置允许，可以通过 `import utils from './utils.mjs';` 导入

（3）导入 .cjs 模块：可以使用动态导入 `import utils = require('./utils.cjs');` 或者在 ES 模块中使用 `import utils from './utils.cjs';`（需要注意兼容性）

（4）导入 .ts 模块：直接通过相对路径导入，例如 `import { helper } from './helper';`

（5）导入 .mts 模块：需要明确指定扩展名，例如 `import { helper } from './helper.mts';`

（6）导入 .cts 模块：同样需要明确指定扩展名，例如 `import utils = require('./utils.cts');`

## 三、模块系统互操作性

- ES模块导入CommonJS：ES模块可以导入CommonJS模块，但只能使用默认导入
- CommonJS导入ES模块：CommonJS模块可以使用动态import()导入ES模块
- package.json配置：通过"exports"字段可以精确控制模块的入口点和条件导出

## 四、npm中的字段

### 1. ["main"](https://nodejs.cn/api/packages.html#main) [>](https://nodejs.cn/api/packages/main.html)

[main](https://npm.nodejs.cn/cli/v10/configuring-npm/package-json#main) 字段是模块 ID，它是程序的主要入口点。也就是说，如果我们的包名为 `foo`，并且用户安装了它，然后执行 `require("foo")`，那么主模块的导出对象将被返回。

这应该是相对于包文件夹根目录的模块。如果未设置 `main`，则默认为包根文件夹中的 `index.js`。

### 2. ["exports"](https://nodejs.cn/api/packages.html#exports) [>](https://nodejs.cn/api/packages/exports.html)

[exports](https://npm.nodejs.cn/cli/v10/configuring-npm/package-json#exports) 为 "main" 提供了一种现代替代方案，允许定义多个入口点、在环境之间支持条件入口解析以及阻止除 "exports" 中定义的入口点之外的任何其他入口点。这种封装允许模块作者清楚地定义其包的公共接口。

>详细信息，请参阅 [node.js 包入口点文档](https://nodejs.cn/api/packages.html#package-entry-points)

#### 2.1 [# 包入口点](https://nodejs.cn/api/packages.html#包入口点) [>](https://nodejs.cn/api/packages/6.html)

在包的 `package.json` 文件中，两个字段可以定义包的入口点：[`"main"`](https://nodejs.cn/api/packages.html#main) 和 [`"exports"`](https://nodejs.cn/api/packages.html#exports)。这两个字段都适用于 ES 模块和 CommonJS 模块入口点。

所有版本的 Node.js 都支持 [`"main"`](https://nodejs.cn/api/packages.html#main) 字段，但其功能有限：它只定义包的主要入口点。

[`"exports"`](https://nodejs.cn/api/packages.html#exports) 提供了 [`"main"`](https://nodejs.cn/api/packages.html#main) 的现代替代方案，允许定义多个入口点、环境之间的条件入口解析支持，并防止除 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 中定义的入口点之外的任何其他入口点。此封装允许模块作者清楚地为他们的包定义公共接口。

对于针对当前支持的 Node.js 版本的新包，建议使用 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段。对于支持 Node.js 10 及以下的包，[`"main"`](https://nodejs.cn/api/packages.html#main) 字段是必需的。如果同时定义了 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 和 [`"main"`](https://nodejs.cn/api/packages.html#main)，则在支持的 Node.js 版本中，[`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段优先于 [`"main"`](https://nodejs.cn/api/packages.html#main)。

[条件导出](https://nodejs.cn/api/packages.html#conditional-exports) 可以在 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 中使用，为每个环境定义不同的包入口点，包括包是通过 `require` 还是通过 `import` 引用。有关在单个包中同时支持 CommonJS 和 ES 模块的更多信息，请参阅 [双 CommonJS/ES 模块包部分](https://nodejs.cn/api/packages.html#dual-commonjses-module-packages)。

引入 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段的现有包将阻止包的使用者使用任何未定义的入口点，包括 [`package.json`](https://nodejs.cn/api/packages.html#nodejs-packagejson-field-definitions)（例如 `require('your-package/package.json')`）。这可能是一个突破性的变化。

为了使 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 的引入不会中断，请确保导出每个先前支持的入口点。最好显式指定入口点，以便明确定义包的公共 API。例如，之前导出 `main`、`lib`、`feature` 和 `package.json` 的项目可以使用以下 `package.exports`：

```json
{
  "name": "my-package",
  "exports": {
    ".": "./lib/index.js",
    "./lib": "./lib/index.js",
    "./lib/index": "./lib/index.js",
    "./lib/index.js": "./lib/index.js",
    "./feature": "./feature/index.js",
    "./feature/index": "./feature/index.js",
    "./feature/index.js": "./feature/index.js",
    "./package.json": "./package.json"
  }
} 
```

或者，项目可以选择使用导出模式导出带有和不带有扩展子路径的整个文件夹：

```json
{
  "name": "my-package",
  "exports": {
    ".": "./lib/index.js",
    "./lib": "./lib/index.js",
    "./lib/*": "./lib/*.js",
    "./lib/*.js": "./lib/*.js",
    "./feature": "./feature/index.js",
    "./feature/*": "./feature/*.js",
    "./feature/*.js": "./feature/*.js",
    "./package.json": "./package.json"
  }
} 
```

以上为任何次要包版本提供向后兼容性，包的未来重大更改可以适当地将导出限制为仅暴露的特定功能导出：

```json
{
  "name": "my-package",
  "exports": {
    ".": "./lib/index.js",
    "./feature/*.js": "./feature/*.js",
    "./feature/internal/*": null
  }
} 
```

#### 2.2 [# 主入口点导出](https://nodejs.cn/api/packages.html#主入口点导出) [>](https://nodejs.cn/api/packages/7.html)

当编写新包时，建议使用 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段：

```json
{
  "exports": "./index.js"
} 
```

定义 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段后，包的所有子路径都将被封装，并且不再可供导入者使用。例如，`require('pkg/subpath.js')` 抛出 [`ERR_PACKAGE_PATH_NOT_EXPORTED`](https://nodejs.cn/api/errors.html#err_package_path_not_exported) 错误。

这种导出封装为工具的包接口以及处理包的 semver 升级提供了更可靠的保证。它不是一个强封装，因为直接要求包的任何绝对子路径（例如 `require('/path/to/node_modules/pkg/subpath.js')`）仍然会加载 `subpath.js`。

当前所有受支持的 Node.js 版本和现代构建工具都支持 `"exports"` 字段。对于使用旧版本 Node.js 或相关构建工具的项目，可以通过在指向同一模块的 `"exports"` 旁边包含 `"main"` 字段来实现兼容性：

```json
{
  "main": "./index.js",
  "exports": "./index.js"
}
```

#### 2.3 [# 子路径导出](https://nodejs.cn/api/packages.html#子路径导出) [>](https://nodejs.cn/api/packages/8.html)

> 新增于: v12.7.0

当使用 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段时，可以通过将主入口点视为 `"."` 子路径来定义自定义子路径以及主入口点：

```json
{
  "exports": {
    ".": "./index.js",
    "./submodule.js": "./src/submodule.js"
  }
} 
```

现在使用者只能导入 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 中定义的子路径：

```js
import submodule from 'es-module-package/submodule.js';
// Loads ./node_modules/es-module-package/src/submodule.js 
```

而其他子路径会出错：

```js
import submodule from 'es-module-package/private-module.js';
// Throws ERR_PACKAGE_PATH_NOT_EXPORTED 
```

##### 2.4.1 [#子路径中的扩展](https://nodejs.cn/api/packages.html#子路径中的扩展) [>](https://nodejs.cn/api/packages/9.html)

包作者应在其导出中提供扩展 (`import 'pkg/subpath.js'`) 或无扩展 (`import 'pkg/subpath'`) 子路径。这确保每个导出的模块只有一个子路径，以便所有依赖导入相同的一致说明符，使消费者清楚地了解包合同并简化包的子路径的完成。

传统上，包倾向于使用无扩展名风格，它具有可读性和掩盖包中文件的真实路径的好处。

随着 [导入映射](https://github.com/WICG/import-maps) 现在为浏览器和其他 JavaScript 运行时中的包解析提供标准，使用无扩展样式可能会导致导入映射定义膨胀。显式文件扩展名可以避免此问题，方法是使导入映射尽可能利用 [包文件夹映射](https://github.com/WICG/import-maps#packages-via-trailing-slashes) 映射多个子路径，而不是每个包的子路径导出一个单独的映射条目。这也反映了在相对和绝对导入说明符中使用 [完整说明符路径](https://nodejs.cn/api/esm.html#mandatory-file-extensions) 的要求。

##### 2.4.2 [# 导出目标的路径规则和验证](https://nodejs.cn/api/packages.html#导出目标的路径规则和验证) [>](https://nodejs.cn/api/packages/10.html)

在 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段中将路径定义为目标时，Node.js 会强制执行几条规则以确保安全性、可预测性和正确的封装。理解这些规则对于发布包的作者至关重要。

###### [# 目标必须是相对 URL](https://nodejs.cn/api/packages.html#目标必须是相对-url) [>](https://nodejs.cn/api/packages/url.html)

[`"exports"`](https://nodejs.cn/api/packages.html#exports) 映射中的所有目标路径（与导出键关联的值）必须是以 `./` 开头的相对 URL 字符串。

```json
// package.json
{
  "name": "my-package",
  "exports": {
    ".": "./dist/main.js",          // Correct
    "./feature": "./lib/feature.js", // Correct
    // "./origin-relative": "/dist/main.js", // Incorrect: Must start with ./
    // "./absolute": "file:///dev/null", // Incorrect: Must start with ./
    // "./outside": "../common/util.js" // Incorrect: Must start with ./
  }
} 
```

此行为的原因包括：

- 安全性：防止从包自身目录之外导出任意文件。
- 封装：确保所有导出的路径都相对于包根目录进行解析，从而使包自包含。

###### [# 无路径遍历或无效片段](https://nodejs.cn/api/packages.html#无路径遍历或无效片段) [>](https://nodejs.cn/api/packages/11.html)

导出目标不得解析到包根目录之外的位置。此外，像 `.`（单点）、`..`（双点）或 `node_modules`（及其 URL 编码的等效项）这样的路径段通常不允许出现在初始 `./` 之后的 `target` 字符串中，也不允许出现在替换为目标模式的任何 `subpath` 部分中。

```json
// package.json
{
  "name": "my-package",
  "exports": {
    // ".": "./dist/../../elsewhere/file.js", // Invalid: path traversal
    // ".": "././dist/main.js",             // Invalid: contains "." segment
    // ".": "./dist/../dist/main.js",       // Invalid: contains ".." segment
    // "./utils/./helper.js": "./utils/helper.js" // Key has invalid segment
  }
}
```

#### [2.4 # 导出糖](https://nodejs.cn/api/packages.html#导出糖) [>](https://nodejs.cn/api/packages/12.html)

> 新增于: v12.11.0

如果 `"."` 导出是唯一的导出，则 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段为这种情况提供了语法糖，即直接的 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段值。

```json
{
  "exports": {
    ".": "./index.js"
  }
}
```

可以写成：

```json
{
  "exports": "./index.js"
}
```

#### [2.5 # 子路径导入](https://nodejs.cn/api/packages.html#子路径导入) [>](https://nodejs.cn/api/packages/13.html)

> 新增于: v14.6.0, v12.19.0

除了 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段之外，还有一个包 `"imports"` 字段用于创建仅适用于包本身的导入说明符的私有映射。

`"imports"` 字段中的条目必须始终以 `#` 开头，以确保它们与外部包说明符消除歧义。

例如，可以使用导入字段来获得内部模块条件导出的好处：

```json
// package.json
{
  "imports": {
    "#dep": {
      "node": "dep-node-native",
      "default": "./dep-polyfill.js"
    }
  },
  "dependencies": {
    "dep-node-native": "^1.0.0"
  }
}
```

其中 `import '#dep'` 没有得到外部包 `dep-node-native` 的解析（依次包括其导出），而是获取了相对于其他环境中的包的本地文件 `./dep-polyfill.js`。

与 `"exports"` 字段不同，`"imports"` 字段允许映射到外部包。

导入字段的解析规则与导出字段类似。

#### [2.6 # 子路径模式](https://nodejs.cn/api/packages.html#子路径模式) [>](https://nodejs.cn/api/packages/14.html)

对于具有少量导出或导入的包，我们建议显式地列出每个导出子路径条目。但是对于具有大量子路径的包，这可能会导致 `package.json` 膨胀和维护问题。

对于这些用例，可以使用子路径导出模式：

```json
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./features/*.js": "./src/features/*.js"
  },
  "imports": {
    "#internal/*.js": "./src/internal/*.js"
  }
}
```

**`\*` 映射公开嵌套子路径，因为它只是字符串替换语法。**

然后，右侧 `*` 的所有实例都将替换为该值，包括它是否包含任何 `/` 分隔符。

```js
import featureX from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js

import featureY from 'es-module-package/features/y/y.js';
// Loads ./node_modules/es-module-package/src/features/y/y.js

import internalZ from '#internal/z.js';
// Loads ./node_modules/es-module-package/src/internal/z.js 
```

这是直接静态匹配和替换，无需对文件扩展名进行任何特殊处理。在映射两边包含 `"*.js"` 限制了暴露的包导出到只有 JS 文件。

导出的静态可枚举属性由导出模式维护，因为可以通过将右侧目标模式视为针对包内文件列表的 `**` glob 来确定包的各个导出。因为导出目标中禁止 `node_modules` 路径，所以这个扩展只依赖包本身的文件。

要从模式中排除私有子文件夹，可以使用 `null` 目标：

```json
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./features/*.js": "./src/features/*.js",
    "./features/private-internal/*": null
  }
}
import featureInternal from 'es-module-package/features/private-internal/m.js';
// Throws: ERR_PACKAGE_PATH_NOT_EXPORTED

import featureX from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js 
```

#### [2.7 # 条件导出](https://nodejs.cn/api/packages.html#条件导出) [>](https://nodejs.cn/api/packages/15.html)

条件导出提供了一种根据特定条件映射到不同路径的方法。CommonJS 和 ES 模块导入都支持它们。

比如，包想要为 `require()` 和 `import` 提供不同的 ES 模块导出可以这样写：

```json
// package.json
{
  "exports": {
    "import": "./index-module.js",
    "require": "./index-require.cjs"
  },
  "type": "module"
}
```

Node.js 实现了以下条件，按从最具体到最不具体的顺序列出，因为应该定义条件：

- `"node-addons"` - 类似于 `"node"` 并且匹配任何 Node.js 环境。此条件可用于提供使用原生 C++ 插件的入口点，而不是更通用且不依赖原生插件的入口点。这种情况可以通过 [`--no-addons` 标志](https://nodejs.cn/api/cli.html#--no-addons) 禁用。
- `"node"` - 匹配任何 Node.js 环境。可以是 CommonJS 或 ES 模块文件。在大多数情况下，没有必要显式调出 Node.js 平台。
- `"import"` - 当包通过 `import` 或 `import()` 加载时匹配，或者通过 ECMAScript 模块加载器通过任何顶层导入或解析操作加载。无论目标文件的模块格式如何，都适用。始终与 `"require"` 互斥。
- `"require"` - 通过 `require()` 加载包时匹配。引用的文件应该可以用 `require()` 加载，尽管无论目标文件的模块格式如何，条件都匹配。预期格式包括 CommonJS、JSON、原生插件和 ES 模块。始终与 `"import"` 互斥。
- `"module-sync"` - 无论包是通过 `import`、`import()` 还是 `require()` 加载，都会匹配。格式应为 ES 模块，其模块图中不包含顶层 await - 如果是这样，当模块被 `require()` 化时，将抛出 `ERR_REQUIRE_ASYNC_MODULE`。
- `"default"` - 始终匹配的通用回退。可以是 CommonJS 或 ES 模块文件。这种情况应该总是排在最后。

在 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 对象中，键顺序很重要。在条件匹配过程中，较早的条目具有更高的优先级并优先于较晚的条目。一般规则是条件应按对象顺序从最具体到最不具体。

使用 `"import"` 和 `"require"` 条件可能会导致一些危险，这些危险在 [双 CommonJS/ES 模块包部分](https://nodejs.cn/api/packages.html#dual-commonjses-module-packages) 中有进一步说明。

`"node-addons"` 条件可用于提供使用原生 C++ 插件的入口点。但是，可以通过 [`--no-addons` 标志](https://nodejs.cn/api/cli.html#--no-addons) 禁用此条件。当使用 `"node-addons"` 时，建议将 `"default"` 视为提供更通用入口点的增强功能，例如使用 WebAssembly 而不是原生插件。

条件导出也可以扩展为导出子路径，例如：

```json
{
  "exports": {
    ".": "./index.js",
    "./feature.js": {
      "node": "./feature-node.js",
      "default": "./feature.js"
    }
  }
}
```

定义了一个包，其中 `require('pkg/feature.js')` 和 `import 'pkg/feature.js'` 可以在 Node.js 和其他 JS 环境之间提供不同的实现。

当使用环境分支时，总是尽可能包含 `"default"` 条件。提供 `"default"` 条件可确保任何未知的 JS 环境都能够使用此通用实现，这有助于避免这些 JS 环境必须伪装成现有环境以支持具有条件导出的包。出于这个原因，使用 `"node"` 和 `"default"` 条件分支通常比使用 `"node"` 和 `"browser"` 条件分支更可取。

#### [2.8 # 嵌套条件](https://nodejs.cn/api/packages.html#嵌套条件) [>](https://nodejs.cn/api/packages/16.html)

除了直接映射，Node.js 还支持嵌套条件对象。

例如，要定义一个包，它只有双模式入口点用于 Node.js 而不是浏览器：

```json
{
  "exports": {
    "node": {
      "import": "./feature-node.mjs",
      "require": "./feature-node.cjs"
    },
    "default": "./feature.mjs"
  }
}
```

条件继续按顺序与扁平条件匹配。如果嵌套条件没有任何映射，它将继续检查父条件的剩余条件。通过这种方式，嵌套条件的行为类似于嵌套的 JavaScript `if` 语句。

#### [2.9 # 解析用户条件](https://nodejs.cn/api/packages.html#解析用户条件) [>](https://nodejs.cn/api/packages/17.html)

> 新增于: v14.9.0, v12.19.0

运行 Node.js 时，可以使用 `--conditions` 标志添加自定义用户条件：

```bash
node --conditions=development index.js 
```

然后将解析包导入和导出中的 `"development"` 条件，同时根据需要解析现有的 `"node"`、`"node-addons"`、`"default"`、`"import"` 和 `"require"` 条件。

可以使用重复标志设置任意数量的自定义条件。

典型条件应仅包含字母数字字符，如有必要，使用 ":"、"*" 或 "=" 作为分隔符。任何其他操作都可能在节点之外遇到兼容性问题。

在节点中，条件几乎没有限制，但具体包括：

（1）它们必须至少包含一个字符。

（2）它们不能以 "." 开头，因为它们可能出现在也允许相对路径的地方。

（3）它们不能包含 ","，因为它们可能会被某些 CLI 工具解析为逗号分隔的列表。

（4）它们不能是像 "10" 这样的整数属性键，因为这会对 JS 对象的属性键排序产生意外影响。

#### [2.10 # 社区条件定义](https://nodejs.cn/api/packages.html#社区条件定义) [>](https://nodejs.cn/api/packages/18.html)

默认情况下，除 `"import"`、`"require"`、`"node"`、`"module-sync"`、`"node-addons"` 和 `"default"` 条件 [在 Node.js 核心中实现](https://nodejs.cn/api/packages.html#conditional-exports) 之外的条件字符串将被忽略。

其他平台可能会实现其他条件，用户条件可以通过 [`--conditions` / `-C` 标志](https://nodejs.cn/api/packages.html#resolving-user-conditions) 在 Node.js 中启用。

由于自定义的包条件需要明确定义以确保正确使用，因此下面提供了常见的已知包条件及其严格定义的列表，以协助生态系统协调。

- `"types"` - 类型系统可以使用它来解析给定导出的类型文件。应始终首先包括此条件。
- `"browser"` - 任何网络浏览器环境。
- `"development"` - 可用于定义仅开发环境入口点，例如在开发模式下运行时提供额外的调试上下文，例如更好的错误消息。必须始终与 `"production"` 互斥。
- `"production"` - 可用于定义生产环境入口点。必须始终与 `"development"` 互斥。

对于其他运行时，特定于平台的条件键定义由 [运行时键](https://runtime-keys.proposal.wintercg.org/) 提案规范中的 [WinterCG](https://wintercg.org/) 维护。

通过向 [本节的 Node.js 文档](https://github.com/nodejs/node/blob/HEAD/doc/api/packages.md#conditions-definitions) 创建拉取请求，可以将新的条件定义添加到此列表中。在此处列出新条件定义的要求是：

- 对于所有实现者来说，定义应该是清晰明确的。
- 为什么需要条件的用例应该清楚地证明。
- 应该存在足够的现有实现用法。
- 条件名称不应与另一个条件定义或广泛使用的条件冲突。
- 条件定义的列表应该为生态系统提供协调效益，否则这是不可能的。例如，对于特定于公司或特定于应用的条件，情况不一定如此。
- 该条件应该是 Node.js 用户期望它出现在 Node.js 核心文档中。`"types"` 条件就是一个很好的例子：它并不真正属于 [运行时键](https://runtime-keys.proposal.wintercg.org/) 提案，但很适合 Node.js 文档。

上述定义可能会在适当的时候移到专门的条件仓库中。

#### [2.11 # 使用名称自引用包](https://nodejs.cn/api/packages.html#使用名称自引用包) [>](https://nodejs.cn/api/packages/19.html)

在一个包中，包的 `package.json` [`"exports"`](https://nodejs.cn/api/packages.html#exports) 字段中定义的值可以通过包的名称引用。例如，假设 `package.json` 是：

```json
// package.json
{
  "name": "a-package",
  "exports": {
    ".": "./index.mjs",
    "./foo.js": "./foo.js"
  }
}
```

然后该包中的任何模块都可以引用包本身的导出：

```js
// ./a-module.mjs
import { something } from 'a-package'; // Imports "something" from ./index.mjs. 
```

自引用仅在 `package.json` 具有 [`"exports"`](https://nodejs.cn/api/packages.html#exports) 时可用，并且只允许导入 [`"exports"`](https://nodejs.cn/api/packages.html#exports)（在 `package.json` 中）允许的内容。所以下面的代码，给定前面的包，会产生运行时错误：

```js
// ./another-module.mjs

// Imports "another" from ./m.mjs. Fails because
// the "package.json" "exports" field
// does not provide an export named "./m.mjs".
import { another } from 'a-package/m.mjs'; 
```

在 ES 模块和 CommonJS 模块中使用 `require` 时也可以使用自引用。例如，这段代码也可以工作：

```js
// ./a-module.js
const { something } = require('a-package/foo.js'); // Loads from ./foo.js. 
```

最后，自引用也适用于范围包。例如，这段代码也可以工作：

```json
// package.json
{
  "name": "@my/package",
  "exports": "./index.js"
}
// ./index.js
module.exports = 42; 
// ./other.js
console.log(require('@my/package')); 
$ node other.js
42 
```

### 3. ["type"](https://nodejs.cn/api/packages.html#type) [>](https://nodejs.cn/api/packages/type.html)

`"type"` 字段定义了 Node.js 用于所有 `.js` 文件的模块格式，这些 `.js` 文件将该 `package.json` 文件作为其最近的父文件。

当最近的父 `package.json` 文件包含值为 `"module"` 的顶层字段 `"type"` 时，以 `.js` 结尾的文件将作为 ES 模块加载。

最近的父 `package.json` 定义为在当前文件夹、该文件夹的父文件夹等中搜索时找到的第一个 `package.json`，依此类推，直到到达 node_modules 文件夹或卷根。

```json
// package.json
{
  "type": "module"
} 
```

```bash
# In same folder as preceding package.json
node my-app.js # Runs as ES module
```

如果最近的父 `package.json` 缺少 `"type"` 字段，或包含 `"type": "commonjs"`，则 `.js` 文件将被视为 [CommonJS](https://nodejs.cn/api/modules.html)。如果到达卷根目录但未找到 `package.json`，则 `.js` 文件将被视为 [CommonJS](https://nodejs.cn/api/modules.html)。

如果最近的父 `package.json` 包含 `"type": "module"`，则 `.js` 文件的 `import` 语句被视为 ES 模块。

```js
// my-app.js, part of the same example as above
import './startup.js'; // Loaded as ES module because of package.json 拷贝
```

无论 `"type"` 字段的值如何，`.mjs` 文件始终被视为 ES 模块，而 `.cjs` 文件始终被视为 CommonJS。

### 4. “types”

`types` 字段的作用是**指定 TypeScript 类型定义文件（`.d.ts` 文件）的入口路径**。这个字段主要用于帮助 TypeScript 项目正确识别和使用作者的包的类型信息。如果不设置 `types`，TypeScript 默认会在与 `main` 相同目录下寻找同名的 `.d.ts` 文件。

当使用者在 TypeScript 项目中引入作者的包时，TypeScript 会根据 `types` 字段找到对应的 `.d.ts` 文件，从而获得准确的类型信息。这样可以实现自动补全、类型检查和错误提示等。

一般是配合 `main` 字段使用

- `main` 字段指向实际运行的 JavaScript 入口文件。
- `types` 字段则指向该模块的类型声明文件。

```json
{
  "main": "./lib/index.js",
  "types": "./lib/index.d.ts"
}
```

### 5. “typesVersions”

`typesVersions` 字段用于 **为不同的 TypeScript 版本提供不同的类型声明文件入口**，是一种高级的类型版本控制机制。例如：

```json
{
  "name": "my-package",
  "types": "./dist/index.d.ts", // 默认类型入口（fallback）
  "typesVersions": {
    "<=4.0": {
      "*": ["./ts4.0/*"] // 为 TS <= 4.0 提供特殊类型
    },
    ">=4.1 <5.0": {
      "*": ["./ts4.1/*"] // 为 TS 4.1~4.9 提供类型
    },
    ">=5.0": {
      "*": ["./ts5.0/*"] // 为 TS >= 5.0 提供类型
    }
  }
}
```

