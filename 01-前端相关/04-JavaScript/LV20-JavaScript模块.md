---
title: LV20-JavaScript模块
date: 2025-08-11 09:24:28
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

要了解Typescript的模块，我们先从Javascript模块开始。

<!-- more -->

> 参考资料：
>
> - [Modules ES6 • Exploring JavaScript (ES2025 Edition)](https://exploringjs.com/js/book/ch_modules.html)
> - [JavaScript 模块 | MDN Web 中文网](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/)

这里主要是参考MDN的Javascript教程中模块这一部分，这部分的示例代码可以在[GitHub - mdn/js-examples: Code examples that accompany the MDN JavaScript/ECMAScript documentation](https://github.com/mdn/js-examples)找到。

## 一、模块背景

JavaScript 程序一开始相当小 - 早期的大部分用途是执行独立的脚本任务，在需要时为网页提供一些交互性，因此通常不需要大型脚本。快进几年，我们现在已经有了在带有大量 JavaScript 的浏览器中运行的完整应用，以及在其他上下文中使用的 JavaScript（例如 [Node.js](https://web.nodejs.cn/en-US/docs/Glossary/Node.js)）。

其实最原始的 JavaScript 文件加载方式，就是Script 标签，如果把每一个文件看做是一个模块，那么他们的接口通常是暴露在全局作用域下，也就是定义在 window 对象中，不同模块的接口调用都是一个作用域中，一些复杂的框架，会使用命名空间的概念来组织这些模块的接口。就会出现下面的问题：

（1）污染全局作用域

（2）开发人员必须主观解决模块和代码库的依赖关系

（3）文件只能按照script标签的书写顺序进行加载

（4）在大型项目中各种资源难以管理，长期积累的问题导致代码库混乱不堪。

因此，近年来开始考虑提供将 JavaScript 程序分割成单独模块的机制，以便在需要时可以导入，这是有意义的。Node.js 很早就具备这种能力，并且有许多 JavaScript 库和框架支持模块使用（例如，其他基于 [CommonJS](https://en.wikipedia.org/wiki/CommonJS) 和 [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) 的模块系统，如 [RequireJS](https://requirejs.org/)，以及最近的 [Webpack](https://webpack.js.org/) 和 [Babel](https://babel.nodejs.cn/)）。

好消息是现代浏览器已经开始原生支持模块功能，这就是本文的主题。这只能是一件好事 - 浏览器可以优化模块的加载，使其比必须使用库并执行所有额外的客户端处理和额外的往返更有效。

原生 JavaScript 模块的使用取决于 [`import`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/import) 和 [`export`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/export) 语句；这些在浏览器中受支持，如下兼容性表所示。

## 二、浏览器兼容性

原生 JavaScript 模块的使用取决于 `import` 和 `export` 语句；这些在浏览器中受支持，如下兼容性表所示。

这个直接还是看原文档吧：[JavaScript 模块 - 浏览器兼容性](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#浏览器兼容性)

## 三介绍一个例子

为了演示模块的用法，我们创建了一个[一组简单的例子](https://github.com/mdn/js-examples/tree/main/module-examples)，你可以在 GitHub 上找到它。这些示例演示了一组简单的模块，这些模块在网页上创建[`<canvas>`](https://web.nodejs.cn/en-us/docs/web/html/element/canvas/) 元素（图形画布元素），然后在画布上绘制（并报告相关信息）不同的形状。

这些都是相当琐碎的，但为了清楚地演示模块而故意保持简单。

> 注意：如果你想下载示例并在本地运行它们，则需要通过本地 Web 服务器运行它们。

### 1. 基本示例结构

在我们的第一个示例（参见 [js-examples/module-examples/basic-modules at main · mdn/js-examples · GitHub](https://github.com/mdn/js-examples/tree/main/module-examples/basic-modules)）中，我们的文件结构如下：

```bash
basic-modules
├── index.html
├── main.js
└── modules
    ├── canvas.js
    └── square.js

1 directories, 4 files
```

> 注意：本指南中的所有示例都具有基本相同的结构；上面的内容应该开始变得非常熟悉了。

模块目录的两个模块描述如下：

- canvas.js — 包含与设置画布相关的函数：

`create()` — 在具有指定 ID 的封装器[`<div>`](https://web.nodejs.cn/en-us/docs/web/html/element/div/)具有指定 `width` 和 `height` 的画布，该封装器本身附加在指定的父元素内。返回一个包含画布的 2D 上下文和封装器 ID 的对象。

`createReportList()` — 创建一个附加在指定封装元素内的无序列表，可用于将报告数据输出到其中。返回列表的 ID。

- square.js — 包含：

`name` — 包含字符串 'square' 的常量。

`draw()` — 在指定画布上绘制一个具有指定大小、位置和颜色的正方形。返回一个包含正方形大小、位置和颜色的对象。

`reportArea()` — 将一个正方形的面积写入特定的报告列表（给定其长度）。

`reportPerimeter()` — 将一个正方形的周长写入特定的报告列表（给定其长度）。

### 2. 旁白 — .mjs 与 .js

在本文中，我们对模块文件使用了 `.js` 扩展名，但在其他资源中你可能会看到使用 `.mjs` 扩展名。例如，[V8 的文档推荐这个](https://v8.dev/features/modules#mjs)。给出的理由是：

- 它有利于清晰，即它清楚地表明哪些文件是模块，哪些是常规 JavaScript。
- 它确保你的模块文件被运行时（例如 [Node.js](https://nodejs.cn/api/esm.html#esm_enabling)）和构建工具（例如 [Babel](https://babel.nodejs.cn/docs/options#sourcetype)）解析为模块。

然而，我们决定继续使用 `.js`，至少目前是这样。为了让模块在浏览器中正常工作，你需要确保你的服务器为它们提供包含 JavaScript MIME 类型（例如 `text/javascript`）的 `Content-Type` 标头。如果不这样做，你将收到类似于 "服务器使用非 JavaScript MIME 类型进行响应" 的严格 MIME 类型检查错误，并且浏览器将不会运行你的 JavaScript。大多数服务器已经为 `.js` 文件设置了正确的类型，但尚未为 `.mjs` 文件设置正确的类型。已正确提供 `.mjs` 文件的服务器包括 Node.js 的 [GitHub 页面](https://pages.github.com/) 和 [`http-server`](https://github.com/http-party/http-server#readme)。

如果你已经在使用这样的环境，或者如果你没有使用这样的环境，但你知道自己在做什么并且具有访问权限（即你可以配置服务器为 `.mjs` 文件设置正确的 [`Content-Type`](https://web.nodejs.cn/en-US/docs/Web/HTTP/Headers/Content-Type)），那么这是可以的。但是，如果你无法控制提供文件的服务器，或者发布文件供公共使用（就像我们在这里一样），则可能会导致混乱。

出于学习和可移植性的目的，我们决定保留 `.js`。

如果你确实重视对模块使用 `.mjs` 与对 "normal" JavaScript 文件使用 `.js` 的清晰度，但又不想遇到上述问题，那么你始终可以在开发过程中使用 `.mjs`，并在构建步骤中将它们转换为 `.js`。

还值得注意的是：

- 有些工具可能永远不支持 `.mjs`。
- `<script type="module">` 属性用于表示何时指向模块，如下所示。

### 3. 运行

在windows本地运行时，可能无法正常打开index.html，浏览器调试页面可能会有如下报错：

```bash
Access to script at 'file:///D:/sumu_blog/js-examples/module-examples/basic-modules/main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome-extension, chrome-untrusted, data, edge, http, https, isolated-app.
```

这是从 `file:///` 协议访问本地 JavaScript 模块时，被 CORS 策略阻止。这是浏览器的安全限制，不允许通过 `file://` 协议进行跨源请求。解决这个问题的常见方法包括：

（1）使用本地开发服务器（如 Live Server、Vite、Webpack Dev Server）来提供文件服务。

（2）修改浏览器设置以允许本地文件访问（不推荐，因为有安全风险）。

（3）将代码改为使用内联脚本或非模块化方式加载（仅适用于简单示例）。

我是用的vscode开发，所以安装了[GitHub - ritwickdey/vscode-live-server: Launch a development local Server with live reload feature for static & dynamic pages.](https://github.com/ritwickdey/vscode-live-server)这个扩展。

## 四、[导出模块功能](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#导出模块功能)

要访问模块功能，你要做的第一件事就是导出它们。这是使用 [`export`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/export) 语句完成的。

使用它的最简单方法是将其放置在你想要从模块中导出的任何项目的前面，例如：

```javascript
export const name = "square";

export function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, length, length);

  return { length, x, y, color };
}
```

你可以导出函数、`var`、`let`、`const` 以及（稍后我们将看到）类。它们必须是顶层项目：例如，你不能在函数内使用 `export`。

导出要导出的所有项目的更方便的方法是在模块文件末尾使用单个导出语句，后跟用大括号括起来的以逗号分隔的要导出的功能列表。例如：

```javascript
export { name, draw, reportArea, reportPerimeter };
```



## 五、[将功能导入到脚本中](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#将功能导入到脚本中)

从模块中导出一些功能后，你需要将它们导入到脚本中才能使用它们。最简单的方法如下：

```javascript
import { name, draw, reportArea, reportPerimeter } from "./modules/square.js";
```

你使用 [`import`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/import) 语句，后跟要导入的以逗号分隔的功能列表（用大括号括起来），然后是关键字 `from`，最后是模块说明符。

模块说明符提供 JavaScript 环境可以解析为模块文件路径的字符串。在浏览器中，这可能是相对于站点根目录的路径，对于我们的 `basic-modules` 示例来说是 `/js-examples/module-examples/basic-modules`。但是，这里我们使用点 (`.`) 语法来表示 "当前位置"，后跟我们要查找的文件的相对路径。这比每次写出整个绝对路径要好得多，因为相对路径更短并且使 URL 可移植 - 如果你将其移动到站点层次结构中的其他位置，该示例仍然有效。

例如：

```bash
/js-examples/module-examples/basic-modules/modules/square.js
```

becomes

```bash
./modules/square.js
```

你可以在 [`main.js`](https://github.com/mdn/js-examples/blob/main/module-examples/basic-modules/main.js) 中看到这些行的运行情况。

> 注意：在某些模块系统中，你可以使用像 `modules/square` 这样的模块说明符，它不是相对或绝对路径，并且没有文件扩展名。如果你首先定义 导入地图，则可以在浏览器环境中使用这种说明符。

将这些功能导入到脚本中后，你就可以像在同一文件中定义它们一样使用它们。以下内容位于 `main.js` 的导入行下方：

```javascript
const myCanvas = create("myCanvas", document.body, 480, 320);
const reportList = createReportList(myCanvas.id);

const square1 = draw(myCanvas.ctx, 50, 50, 100, "blue");
reportArea(square1.length, reportList);
reportPerimeter(square1.length, reportList);
```

> 注意：导入的值是导出的要素的只读视图。与 `const` 变量类似，你无法重新分配导入的变量，但你仍然可以修改对象值的属性。该值只能由导出它的模块重新分配。请参阅 [`import` 参考](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/import#imported_values_can_only_be_modified_by_the_exporter) 的示例。



## 六、[使用导入映射导入模块](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#使用导入映射导入模块)

上面我们看到了浏览器如何使用模块说明符导入模块，该模块说明符可以是绝对 URL，也可以是使用文档的基本 URL 解析的相对 URL：

```javascript
import { name as squareName, draw } from "./shapes/square.js";
import { name as circleName } from "https://example.com/shapes/circle.js";
```

[导入地图](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/script/type/importmap) 允许开发者在导入模块时在模块说明符中指定几乎任何他们想要的文本；映射提供了一个相应的值，该值将在解析模块 URL 时替换文本。

例如，下面导入映射中的 `imports` 键定义了一个 "模块说明符映射" JSON 对象，其中属性名称可以用作模块说明符，当浏览器解析模块 URL 时，相应的值将被替换。这些值必须是绝对或相对 URL。使用包含导入映射的文档的 [基本网址](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/base) 将相对 URL 解析为绝对 URL 地址。

```html
<script type="importmap">
  {
    "imports": {
      "shapes": "./shapes/square.js",
      "shapes/square": "./modules/shapes/square.js",
      "https://example.com/shapes/square.js": "./shapes/square.js",
      "https://example.com/shapes/": "/shapes/square/",
      "../shapes/square": "./shapes/square.js"
    }
  }
</script>
```

导入映射是使用 `<script>` 元素内的 [JSON 对象](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/script/type/importmap#import_map_json_representation) 定义的，并且 `type` 属性设置为 [`importmap`](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/script/type/importmap)。文档中只能有一个导入映射，并且由于它用于解析在静态导入和动态导入中加载哪些模块，因此必须在导入模块的任何 `<script>` 元素之前声明它。请注意，导入映射仅适用于文档 - 规范不涵盖如何在工作线程或工作集上下文中应用导入映射。

通过此映射，你现在可以使用上面的属性名称作为模块说明符。如果模块说明符键上没有尾部正斜杠，则匹配并替换整个模块说明符键。例如，下面我们匹配裸模块名称，并将 URL 重新映射到另一个路径。

```javascript
// Bare module names as module specifiers
import { name as squareNameOne } from "shapes";
import { name as squareNameTwo } from "shapes/square";

// Remap a URL to another URL
import { name as squareNameThree } from "https://example.com/shapes/square.js";
```

如果模块说明符尾部有一个正斜杠，则该值也必须有一个，并且键匹配为 "路径前缀"。这允许重新映射整个 URL 类别。

```javascript
// Remap a URL as a prefix ( https://example.com/shapes/)
import { name as squareNameFour } from "https://example.com/shapes/moduleshapes/square.js";
```

导入映射中的多个键可能与模块说明符有效匹配。例如，模块说明符 `shapes/circle/` 可以匹配模块说明符键 `shapes/` 和 `shapes/circle/`。在这种情况下，浏览器将选择最具体（最长）的匹配模块说明符键。

导入映射允许使用裸模块名称（如在 Node.js 中）导入模块，并且还可以模拟从带有或不带有文件扩展名的包导入模块。虽然上面没有显示，但它们还允许根据导入模块的脚本的路径导入特定版本的库。一般来说，它们让开发者编写更符合人机工程学的导入代码，并使管理站点使用的模块的不同版本和依赖变得更容易。这可以减少在浏览器和服务器中使用相同 JavaScript 库所需的工作量。

以下各节详细介绍了上述各种功能。

### 1. [特性检测](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#特性检测)

你可以使用 [`HTMLScriptElement.supports()`](https://web.nodejs.cn/en-US/docs/Web/API/HTMLScriptElement/supports_static) 静态方法检查对导入映射的支持（该方法本身已得到广泛支持）：

```javascript
if (HTMLScriptElement.supports?.("importmap")) {
  console.log("Browser supports import maps.");
}
```

### 2. [将模块作为裸名称导入](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#将模块作为裸名称导入)

在某些 JavaScript 环境中，例如 Node.js，你可以使用模块说明符的裸名称。这是可行的，因为环境可以将模块名称解析到文件系统中的标准位置。例如，你可以使用以下语法导入 "square" 模块。

```javascript
import { name, draw, reportArea, reportPerimeter } from "square";
```

要在浏览器上使用裸名称，你需要一个导入映射，它提供浏览器将模块说明符解析为 URL 所需的信息（如果 JavaScript 尝试导入无法解析为模块的模块说明符，它将抛出 `TypeError` 地点）。

下面你可以看到定义 `square` 模块说明符键的映射，在本例中映射到相对地址值。

```html
<script type="importmap">
  {
    "imports": {
      "square": "./shapes/square.js"
    }
  }
</script>
```

有了这个映射，我们现在可以在导入模块时使用裸名称：

```javascript
import { name as squareName, draw } from "square";
```

### 3. [重新映射模块路径](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#重新映射模块路径)

模块说明符映射条目（其中说明符键及其关联值都有一个尾部正斜杠 (`/`)）可用作路径前缀。这允许将一整套导入 URL 从一个位置重新映射到另一个位置。它还可以用于模拟使用 "包和模块"，就像你在 Node 生态系统中看到的那样。

> 注意：尾随 `/` 表示模块说明符键可以替换为模块说明符的一部分。如果不存在，浏览器将仅匹配（并替换）整个模块说明符键。

#### 3.1 模块包

以下 JSON 导入映射定义将 `lodash` 映射为裸名称，并将模块说明符前缀 `lodash/` 映射到路径 `/node_modules/lodash-es/`（解析为文档基本 URL）：

```json
{
  "imports": {
    "lodash": "/node_modules/lodash-es/lodash.js",
    "lodash/": "/node_modules/lodash-es/"
  }
}
```

通过此映射，你可以使用裸名称导入整个 "package" 以及其中的模块（使用路径映射）：

```javascript
import _ from "lodash";
import fp from "lodash/fp.js";
```

可以在没有 `.js` 文件扩展名的情况下导入上面的 `fp`，但你需要为该文件创建一个裸模块说明符键，例如 `lodash/fp`，而不是使用路径。这对于一个模块来说可能是合理的，但如果你希望导入许多模块，则扩展性很差。

#### 3.2 通用 URL 重新映射

模块说明符键不必是路径 - 它也可以是绝对 URL（或类似 URL 的相对路径，如 `./`、`../`、`/`）。如果你想使用你自己的本地资源重新映射具有指向资源的绝对路径的模块，这可能会很有用。

```json
{
  "imports": {
    "https://www.unpkg.com/moment/": "/node_modules/moment/"
  }
}
```



### 4. [用于版本管理的范围模块](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#用于版本管理的范围模块)

Node 等生态系统使用 npm 等包管理器来管理模块及其依赖。包管理器确保每个模块与其他模块及其依赖分开。因此，虽然复杂的应用可能多次包含相同的模块，并且模块图中的不同部分有多个不同的版本，但用户不需要考虑这种复杂性。

> 注意：你还可以使用相对路径实现版本管理，但这不太理想，因为除其他外，这会在你的项目上强制使用特定的结构，并阻止你使用裸模块名称。

导入映射同样允许你在应用中拥有多个版本的依赖，并使用相同的模块说明符引用它们。你可以使用 `scopes` 键来实现此功能，它允许你提供将根据执行导入的脚本的路径使用的模块说明符映射。下面的例子演示了这一点。

```json
{
  "imports": {
    "coolmodule": "/node_modules/coolmodule/index.js"
  },
  "scopes": {
    "/node_modules/dependency/": {
      "coolmodule": "/node_modules/some/other/location/coolmodule/index.js"
    }
  }
}
```

通过此映射，如果 URL 包含 `/node_modules/dependency/` 的脚本导入 `coolmodule`，则将使用 `/node_modules/some/other/location/coolmodule/index.js` 中的版本。如果范围映射中没有匹配范围，或者匹配范围不包含匹配说明符，则 `imports` 中的映射将用作后备。例如，如果从具有不匹配范围路径的脚本导入 `coolmodule`，则将使用 `imports` 中的模块说明符映射，映射到 `/node_modules/coolmodule/index.js` 中的版本。

请注意，用于选择范围的路径不会影响地址的解析方式。映射路径中的值不必与范围路径匹配，并且相对路径仍解析为包含导入映射的脚本的基本 URL。

就像模块说明符映射一样，你可以有许多范围键，并且这些键可能包含重叠的路径。如果多个作用域与引用 URL 匹配，则首先检查最具体的作用域路径（最长的作用域键）是否有匹配的说明符。如果没有匹配的说明符，浏览器将回退到下一个最具体的匹配范围路径，依此类推。如果任何匹配范围中都没有匹配说明符，则浏览器将检查 `imports` 键中模块说明符映射中的匹配项。

### 5. [通过映射散列文件名来改进缓存](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#通过映射散列文件名来改进缓存)

网站使用的脚本文件通常具有哈希文件名以简化缓存。这种方法的缺点是，如果模块发生更改，则任何使用其哈希文件名导入该模块的模块也需要更新/重新生成。这可能会导致级联更新，从而浪费网络资源。

导入地图为这个问题提供了便捷的解决方案。应用和脚本不依赖于特定的散列文件名，而是依赖于模块名称（地址）的未散列版本。然后，像下面这样的导入映射会提供到实际脚本文件的映射。

```json
{
  "imports": {
    "main_script": "/node/srcs/application-fg7744e1b.js",
    "dependency_script": "/node/srcs/dependency-3qn7e4b1q.js"
  }
}
```

如果 `dependency_script` 发生变化，则文件名中包含的哈希值也会发生变化。在这种情况下，我们只需要更新导入映射以反映模块的更改名称。我们不必更新依赖于它的任何 JavaScript 代码的源代码，因为 import 语句中的说明符不会改变。

## 七、[将模块应用到你的 HTML](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#将模块应用到你的_html)

现在我们只需要将 `main.js` 模块应用到我们的 HTML 页面即可。这与我们将常规脚本应用到页面的方式非常相似，但有一些显着的差异。

首先，你需要在 [`<script>`](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/script) 元素中包含 `type="module"`，以将该脚本声明为模块。要导入 `main.js` 脚本，我们使用以下命令：

```html
<script type="module" src="main.js"></script>
```

你还可以通过将 JavaScript 代码放置在 `<script>` 元素的主体内，将模块的脚本直接嵌入到 HTML 文件中：

```html
<script type="module">
  /* JavaScript module code here */
</script>
```

你只能在模块内使用 `import` 和 `export` 语句，而不能在常规脚本中使用。如果你的 `<script>` 元素没有 `type="module"` 属性并尝试导入其他模块，则会引发错误。例如：

```html
<script>
  import _ from "lodash"; // SyntaxError: import declarations may only appear at top level of a module
  // ...
</script>
<script src="a-module-using-import-statements.js"></script>
<!-- SyntaxError: import declarations may only appear at top level of a module -->
```

你通常应该在单独的文件中定义所有模块。HTML 中内联声明的模块只能导入其他模块，但它们导出的任何内容都无法被其他模块访问（因为它们没有 URL）。

> 注意：模块及其依赖可以通过在 [`<link>`](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/link) 元素中用 [`rel="modulepreloaded"`](https://web.nodejs.cn/en-US/docs/Web/HTML/Attributes/rel/modulepreload) 指定来预加载。这可以显着减少使用模块时的加载时间。

## 八、[模块和标准脚本之间的其他差异](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#模块和标准脚本之间的其他差异)

- 你需要注意本地测试 - 如果你尝试在本地加载 HTML 文件（即使用 `file://` URL），由于 JavaScript 模块安全要求，你将遇到 CORS 错误。你需要通过服务器进行测试。
- 另请注意，你可能会从模块内部定义的脚本部分获得与标准脚本中不同的行为。这是因为模块自动使用 [strict mode](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Strict_mode)。
- 加载模块脚本时无需使用 `defer` 属性（参见 [`<script>` 属性](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/script#attributes)）；模块会自动推迟。
- 模块仅执行一次，即使它们已在多个 `` 标记中引用。
- 最后但并非最不重要的一点是，让我们明确这一点 - 模块功能被导入到单个脚本的范围内 - 它们在全局范围内不可用。因此，你只能在导入的脚本中访问导入的功能，而无法从 JavaScript 控制台访问它们。你仍然会收到 DevTools 中显示的语法错误，但你将无法使用你可能期望使用的一些调试技术。

模块定义的变量的作用域为模块，除非显式附加到全局对象。另一方面，全局定义的变量在模块内可用。例如，给出以下代码：

```html
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <title></title>
    <link rel="stylesheet" href="" />
  </head>
  <body>
    <div id="main"></div>
    <script>
      // A var statement creates a global variable.
      var text = "Hello";
    </script>
    <script type="module" src="./render.js"></script>
  </body>
</html>
```

```javascript
/* render.js */
document.getElementById("main").innerText = text;
```

该页面仍会呈现 `Hello`，因为全局变量 `text` 和 `document` 在模块中可用。（还请注意，从这个示例中，模块不一定需要导入/导出语句 - 唯一需要的是入口点具有 `type="module"`。）



## 九、[默认导出与命名导出](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#默认导出与命名导出)

到目前为止，我们导出的功能由命名导出组成 - 每个项目（无论是函数、`const` 等）在导出时都通过其名称来引用，并且该名称已用于在导入时引用它 以及。

还有一种称为默认导出的导出类型 - 旨在使模块提供的默认功能变得容易，并且还帮助 JavaScript 模块与现有 CommonJS 和 AMD 模块系统进行互操作（如Jason Orendorff在 [ES6 深入了解：模块](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/) 中所做的很好的解释；搜索 "Default exports")。

让我们看一个例子来解释它是如何工作的。在我们的基本模块 `square.js` 中，你可以找到一个名为 `randomSquare()` 的函数，它创建一个具有随机颜色、大小和位置的正方形。我们希望将其导出为默认值，因此在文件底部我们编写以下内容：

```javascript
export default randomSquare;
```

请注意缺少大括号。

我们可以在函数前面添加 `export default` 并将其定义为匿名函数，如下所示：

```javascript
export default function (ctx) {
  // ...
}
```

在 `main.js` 文件中，我们使用以下行导入默认函数：

```javascript
import randomSquare from "./modules/square.js";
```

再次注意缺少大括号。这是因为每个模块只允许一个默认导出，而我们知道就是 `randomSquare`。上面的行基本上是以下内容的简写：

```javascript
import { default as randomSquare } from "./modules/square.js";
```

> 注意：下面的 重命名导入和导出 部分解释了重命名导出项目的 as 语法。

## 十、[避免命名冲突](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#避免命名冲突)

到目前为止，我们的画布形状绘制模块似乎工作正常。但是，如果我们尝试添加一个用于绘制其他形状（例如圆形或三角形）的模块，会发生什么情况？这些形状可能也有相关的功能，如 `draw()`、`reportArea()` 等；如果我们尝试将同名的不同函数导入到同一个顶层模块文件中，最终会出现冲突和错误。

幸运的是，有很多方法可以解决这个问题。我们将在以下部分中讨论这些内容。

### 1. [重命名导入和导出](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#重命名导入和导出)

在 `import` 和 `export` 语句的大括号内，你可以使用关键字 `as` 和新功能名称，以更改将用于顶层模块内功能的标识名称。

例如，以下两项将完成相同的工作，尽管方式略有不同：

```javascript
// inside module.js
export { function1 as newFunctionName, function2 as anotherNewFunctionName };

// inside main.js
import { newFunctionName, anotherNewFunctionName } from "./modules/module.js";
```

```javascript
// inside module.js
export { function1, function2 };

// inside main.js
import {
  function1 as newFunctionName,
  function2 as anotherNewFunctionName,
} from "./modules/module.js";
```

让我们看一个真实的例子。在我们的 [renaming](https://github.com/mdn/js-examples/tree/main/module-examples/renaming) 目录中，你将看到与上一个示例相同的模块系统，只是我们添加了 `circle.js` 和 `triangle.js` 模块来绘制和报告圆形和三角形。

在每个模块中，我们都导出了具有相同名称的功能，因此每个模块的底部都有相同的 `export` 语句：

```javascript
export { name, draw, reportArea, reportPerimeter };
```

当将它们导入 `main.js` 时，如果我们尝试使用

```javascript
import { name, draw, reportArea, reportPerimeter } from "./modules/square.js";
import { name, draw, reportArea, reportPerimeter } from "./modules/circle.js";
import { name, draw, reportArea, reportPerimeter } from "./modules/triangle.js";
```

浏览器会抛出一个错误，例如“SyntaxError:重新声明导入名称”（Firefox）。

相反，我们需要重命名导入以使它们是唯一的：

```javascript
import {
  name as squareName,
  draw as drawSquare,
  reportArea as reportSquareArea,
  reportPerimeter as reportSquarePerimeter,
} from "./modules/square.js";

import {
  name as circleName,
  draw as drawCircle,
  reportArea as reportCircleArea,
  reportPerimeter as reportCirclePerimeter,
} from "./modules/circle.js";

import {
  name as triangleName,
  draw as drawTriangle,
  reportArea as reportTriangleArea,
  reportPerimeter as reportTrianglePerimeter,
} from "./modules/triangle.js";
```

请注意，你可以在模块文件中解决问题，例如

```javascript
// in square.js
export {
  name as squareName,
  draw as drawSquare,
  reportArea as reportSquareArea,
  reportPerimeter as reportSquarePerimeter,
};
```

```javascript
// in main.js
import {
  squareName,
  drawSquare,
  reportSquareArea,
  reportSquarePerimeter,
} from "./modules/square.js";
```

而且它的工作原理是一样的。你使用什么样式取决于你，但是，保留模块代码并在导入中进行更改可以说更有意义。当你从你无法控制的第三方模块导入时，这尤其有意义。

### 2. [创建模块对象](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#创建模块对象)

上面的方法效果还可以，但是有点乱，啰嗦。更好的解决方案是将每个模块的功能导入模块对象内。以下语法形式可以做到这一点：

```javascript
import * as Module from "./modules/module.js";
```

这会获取 `module.js` 内所有可用的导出，并使它们作为对象 `Module` 的成员可用，从而有效地为其提供自己的命名空间。例如：

```javascript
Module.function1();
Module.function2();
```

再次，让我们看一个真实的例子。如果你转到我们的 [module-objects](https://github.com/mdn/js-examples/tree/main/module-examples/module-objects) 目录，你将再次看到相同的示例，但已重写以利用此新语法。在模块中，导出均采用以下简单形式：

```javascript
export { name, draw, reportArea, reportPerimeter };
```

另一方面，导入看起来像这样：

```javascript
import * as Canvas from "./modules/canvas.js";

import * as Square from "./modules/square.js";
import * as Circle from "./modules/circle.js";
import * as Triangle from "./modules/triangle.js";
```

在每种情况下，你现在都可以访问指定对象名称下的模块导入，例如：

```javascript
const square1 = Square.draw(myCanvas.ctx, 50, 50, 100, "blue");
Square.reportArea(square1.length, reportList);
Square.reportPerimeter(square1.length, reportList);
```

因此，你现在可以像以前一样编写代码（只要在需要的地方包含对象名称），并且导入更加整洁。

### 3. [模块和类](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#模块和类)

正如我们之前暗示的，你还可以导出和导入类；这是避免代码冲突的另一种选择，如果你已经以面向对象的风格编写了模块代码，则该选项特别有用。

你可以在 [classes](https://github.com/mdn/js-examples/tree/main/module-examples/classes) 目录中看到用 ES 类重写的形状绘图模块的示例。例如，[`square.js`](https://github.com/mdn/js-examples/blob/main/module-examples/classes/modules/square.js) 文件现在在单个类中包含其所有功能：

```javascript
class Square {
  constructor(ctx, listId, length, x, y, color) {
    //...
  }

  draw() {
    //...
  }

  //...
}
```

然后我们导出：

```javascript
export { Square };
```

在 [`main.js`](https://github.com/mdn/js-examples/blob/main/module-examples/classes/main.js) 中，我们像这样导入它：

```javascript
import { Square } from "./modules/square.js";
```

然后使用该类来绘制我们的正方形：

```javascript
const square1 = new Square(myCanvas.ctx, myCanvas.listId, 50, 50, 100, "blue");
square1.draw();
square1.reportArea();
square1.reportPerimeter();
```

## 十一、[聚合模块](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#聚合模块)

有时你会想要将模块聚合在一起。你可能有多个级别的依赖，你希望简化事情，将多个子模块组合到一个父模块中。这可以在父模块中使用以下形式的导出语法：

```javascript
export * from "x.js";
export { name } from "x.js";
```

有关示例，请参阅我们的 [module-aggregation](https://github.com/mdn/js-examples/tree/main/module-examples/module-aggregation) 目录。在此示例中（基于我们之前的类示例），我们有一个名为 `shapes.js` 的额外模块，它将 `circle.js`、`square.js` 和 `triangle.js` 的所有功能聚合在一起。我们还将子模块移动到 `modules` 目录中名为 `shapes` 的子目录中。所以本例中的模块结构为：

```
module-aggregation
├── index.html
├── main.js
└── modules
    ├── canvas.js      
    ├── shapes
    │   ├── circle.js  
    │   ├── square.js  
    │   └── triangle.js
    └── shapes.js      

2 directories, 7 files 
```

在每个子模块中，导出的形式相同，例如

```javascript
export { Square };
```

接下来是聚合部分。在 [`shapes.js`](https://github.com/mdn/js-examples/blob/main/module-examples/module-aggregation/modules/shapes.js) 中，我们包含以下几行：

```javascript
export { Square } from "./shapes/square.js";
export { Triangle } from "./shapes/triangle.js";
export { Circle } from "./shapes/circle.js";
```

它们从各个子模块中获取导出，并有效地使它们可以从 `shapes.js` 模块中使用。

> 注意：`shapes.js` 中引用的导出基本上通过该文件进行重定向，并且实际上并不存在于该文件中，因此你将无法在同一文件中编写任何有用的相关代码。

所以现在在 `main.js` 文件中，我们可以通过替换来访问所有三个模块类

```javascript
import { Square } from "./modules/square.js";
import { Circle } from "./modules/circle.js";
import { Triangle } from "./modules/triangle.js";
```

与以下单行：

```javascript
import { Square, Circle, Triangle } from "./modules/shapes.js";
```

## 十二、[动态模块加载](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#动态模块加载)

最近添加的 JavaScript 模块功能是动态模块加载。这允许你仅在需要时动态加载模块，而不必预先加载所有内容。这有一些明显的性能优势；让我们继续阅读并看看它是如何工作的。

这个新功能允许你将 [`import()`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Operators/import) 作为函数调用，并将模块的路径作为参数传递给它。它返回一个 [`Promise`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)，它包含一个模块对象（请参阅 [创建模块对象](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#creating_a_module_object)），使你可以访问该对象的导出。例如：

```javascript
import("./modules/myModule.js").then((module) => {
  // Do something with the module.
});
```

> 注意：浏览器主线程以及共享和专用工作线程中允许动态导入。但是，如果在 Service Worker 或 Worklet 中调用，`import()` 将会抛出异常。

让我们看一个例子。在 [dynamic-module-imports](https://github.com/mdn/js-examples/tree/main/module-examples/dynamic-module-imports) 目录中，我们有另一个基于我们的类示例的示例。然而这一次，当示例加载时，我们没有在画布上绘制任何内容。相反，我们包括三个按钮 - "圆圈"、"正方形" 和 "三角形" - 按下这些按钮时，会动态加载所需的模块，然后用它来绘制相关的形状。

在此示例中，我们仅对 [`index.html`](https://github.com/mdn/js-examples/blob/main/module-examples/dynamic-module-imports/index.html) 和 [`main.js`](https://github.com/mdn/js-examples/blob/main/module-examples/dynamic-module-imports/main.js) 文件进行了更改 - 模块导出与以前相同。

在 `main.js` 中，我们使用 [`document.querySelector()`](https://web.nodejs.cn/en-US/docs/Web/API/Document/querySelector) 调用获取了对每个按钮的引用，例如：

```javascript
const squareBtn = document.querySelector(".square");
```

然后，我们将一个事件监听器附加到每个按钮，以便在按下时动态加载相关模块并用于绘制形状：

```javascript
squareBtn.addEventListener("click", () => {
  import("./modules/square.js").then((Module) => {
    const square1 = new Module.Square(
      myCanvas.ctx,
      myCanvas.listId,
      50,
      50,
      100,
      "blue",
    );
    square1.draw();
    square1.reportArea();
    square1.reportPerimeter();
  });
});
```

请注意，由于 Promise 履行返回一个模块对象，因此该类将成为该对象的子功能，因此我们现在需要访问前缀为 `Module.` 的构造函数，例如 `Module.Square( /* ... */ )`。

动态导入的另一个优点是它们始终可用，即使在脚本环境中也是如此。因此，如果 HTML 中现有 `<script>`标记没有 `type="module"`，你仍然可以通过动态导入来重用作为模块分发的代码。

```html
<script>
  import("./modules/square.js").then((module) => {
    // Do something with the module.
  });
  // Other code that operates on the global scope and is not
  // ready to be refactored into modules yet.
  var btn = document.querySelector(".square");
</script>
```

## 十三、[顶层等待](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#顶层等待)

顶层等待是模块内可用的功能。这意味着可以使用 `await` 关键字。它允许模块充当大 [异步函数](https://web.nodejs.cn/en-US/docs/Learn/JavaScript/Asynchronous/Introducing)，这意味着可以在父模块中使用之前对代码进行评估，但不会阻止同级模块的加载。

让我们看一个例子。你可以在 [`top-level-await`](https://github.com/mdn/js-examples/tree/main/module-examples/top-level-await) 目录中找到本节中描述的所有文件和代码，该目录扩展自前面的示例。

首先，我们将在单独的 [`colors.json`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/data/colors.json) 文件中声明我们的调色板：

```json
{
  "yellow": "#F4D03F",
  "green": "#52BE80",
  "blue": "#5499C7",
  "red": "#CD6155",
  "orange": "#F39C12"
}
```

然后我们将创建一个名为 [`getColors.js`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/modules/getColors.js) 的模块，它使用获取请求来加载 [`colors.json`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/data/colors.json) 文件并将数据作为对象返回。

```javascript
// fetch request
const colors = fetch("../data/colors.json").then((response) => response.json());

export default await colors;
```

请注意此处的最后一个导出行。

在指定要导出的常量 `colors` 之前，我们使用关键字 `await`。这意味着包含此模块的任何其他模块将等到 `colors` 下载并解析后才能使用它。

让我们将此模块包含在 [`main.js`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/main.js) 文件中：

```javascript
import colors from "./modules/getColors.js";
import { Canvas } from "./modules/canvas.js";

const circleBtn = document.querySelector(".circle");

// ...
```

调用形状函数时，我们将使用 `colors` 而不是之前使用的字符串：

```javascript
const square1 = new Module.Square(
  myCanvas.ctx,
  myCanvas.listId,
  50,
  50,
  100,
  colors.blue,
);

const circle1 = new Module.Circle(
  myCanvas.ctx,
  myCanvas.listId,
  75,
  200,
  100,
  colors.green,
);

const triangle1 = new Module.Triangle(
  myCanvas.ctx,
  myCanvas.listId,
  100,
  75,
  190,
  colors.yellow,
);
```

这很有用，因为 [`main.js`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/main.js) 中的代码只有在 [`getColors.js`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/modules/getColors.js) 中的代码运行后才会执行。但是它不会阻止其他模块的加载。例如，我们的 [`canvas.js`](https://github.com/mdn/js-examples/blob/main/module-examples/top-level-await/modules/canvas.js) 模块将在获取 `colors` 时继续加载。

## 十四、[导入报关单被吊起](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#导入报关单被吊起)

导入报关单为 [hoisted](https://web.nodejs.cn/en-US/docs/Glossary/Hoisting)。在这种情况下，这意味着导入的值甚至在声明它们的位置之前就可以在模块的代码中使用，并且导入模块的副作用是在模块的其余代码开始运行之前产生的。

例如，在 `main.js` 中，在代码中间导入 `Canvas` 仍然有效：

```javascript
// ...
const myCanvas = new Canvas("myCanvas", document.body, 480, 320);
myCanvas.create();
import { Canvas } from "./modules/canvas.js";
myCanvas.createReportList();
// ...
```

尽管如此，将所有导入放在代码顶部仍然被认为是一种很好的做法，这样可以更轻松地分析依赖。



## 十五、[循环导入](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#循环导入)

模块可以导入其他模块，这些模块也可以导入其他模块，等等。这形成了称为 "依赖图" 的 [有向图](https://en.wikipedia.org/wiki/Directed_graph)。在理想情况下，该图是 [acyclic](https://en.wikipedia.org/wiki/Directed_acyclic_graph)。在这种情况下，可以使用深度优先遍历来评估图。

然而，周期往往是不可避免的。如果模块 `a` 导入模块 `b`，但 `b` 直接或间接依赖于 `a`，则会出现循环导入。例如：

```javascript
// -- a.js --
import { b } from "./b.js";

// -- b.js --
import { a } from "./a.js";

// Cycle:
// a.js ───> b.js
//  ^         │
//  └─────────┘
```

循环导入并不总是失败。导入变量的值仅在实际使用该变量时才会检索（因此允许 [实时绑定](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Statements/import#imported_values_can_only_be_modified_by_the_exporter)），并且仅当该变量当时仍未初始化时才会抛出 [`ReferenceError`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init)。

```javascript
// -- a.js --
import { b } from "./b.js";

setTimeout(() => {
  console.log(b); // 1
}, 10);

export const a = 2;

// -- b.js --
import { a } from "./a.js";

setTimeout(() => {
  console.log(a); // 2
}, 10);

export const b = 1;
```

在本例中，`a` 和 `b` 都是异步使用的。因此，在评估模块时，实际上并未读取 `b` 和 `a`，因此其余代码正常执行，并且两个 `export` 声明生成 `a` 和 `b` 的值。然后，超时后，`a` 和 `b` 都可用，因此两条 `console.log` 语句也正常执行。

如果将代码更改为同步使用 `a`，模块评估将失败：

```javascript
// -- a.js (entry module) --
import { b } from "./b.js";

export const a = 2;

// -- b.js --
import { a } from "./a.js";

console.log(a); // ReferenceError: Cannot access 'a' before initialization
export const b = 1;
```

这是因为当 JavaScript 评估 `a.js` 时，它需要首先评估 `b.js`，即 `a.js` 的依赖。但是，`b.js` 使用了 `a`，目前尚不可用。

另一方面，如果将代码更改为同步使用 `b` 但异步使用 `a`，则模块评估会成功：

```javascript
// -- a.js (entry module) --
import { b } from "./b.js";

console.log(b); // 1
export const a = 2;

// -- b.js --
import { a } from "./a.js";

setTimeout(() => {
  console.log(a); // 2
}, 10);
export const b = 1;
```

这是因为 `b.js` 的评估正常完成，因此当评估 `a.js` 时，`b` 的值可用。

你通常应该避免在项目中进行循环导入，因为它们会使你的代码更容易出错。一些常见的循环消除技术是：

- 将两个模块合并为一个。
- 将共享代码移至第三个模块。
- 将一些代码从一个模块移动到另一个模块。

但是，如果库相互依赖，也可能会发生循环导入，这很难修复。

## 十六、[编写 "isomorphic" 模块](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#编写_isomorphic_模块)

模块的引入鼓励 JavaScript 生态系统以模块化方式分发和重用代码。然而，这并不一定意味着一段 JavaScript 代码可以在每个环境中运行。假设你发现了一个可以生成用户密码的 SHA 哈希值的模块。可以在浏览器前端使用吗？你可以在 Node.js 服务器上使用它吗？答案是：这取决于。

如前所述，模块仍然可以访问全局变量。如果模块引用像 `window` 这样的全局变量，它可以在浏览器中运行，但会在 Node.js 服务器中抛出错误，因为 `window` 在那里不可用。同样，如果代码需要访问 `process` 才能正常运行，则只能在 Node.js 中使用。

为了最大限度地提高模块的可重用性，通常建议将代码设置为 "isomorphic"，即在每个运行时都表现出相同的行为。这通常通过三种方式实现：

- 将模块分为 "core" 和 "binding"。对于 "core"，专注于纯 JavaScript 逻辑，例如计算哈希，没有任何 DOM、网络、文件系统访问和公开实用函数。对于 "binding" 部分，你可以读取和写入全局上下文。例如，"浏览器绑定" 可以选择从输入框读取值，而 "节点绑定" 可以从 `process.env` 读取值，但是从任一位置读取的值都将通过管道传输到相同的核心函数并以相同的方式处理。核心可以在每个环境中导入并以相同的方式使用，而只有绑定（通常是轻量级的）需要特定于平台。

- 在使用之前检测特定全局是否存在。例如，如果你测试`typeof window === "undefined"`，你就知道你可能处于 Node.js 环境中，并且不应该读取 DOM。

  ```javascript
// myModule.js
  let password;
  if (typeof process !== "undefined") {
    // We are running in Node.js; read it from `process.env`
  password = process.env.PASSWORD;
  } else if (typeof window !== "undefined") {
  // We are running in the browser; read it from the input box
    password = document.getElementById("password").value;
}
  ```
  
  如果两个分支实际上最终具有相同的行为 ("isomorphic")，则这是更好的选择。如果无法提供相同的功能，或者这样做涉及加载大量代码而大部分代码未使用，则最好使用不同的 "bindings"。
  
- 使用 Polyfill 为缺失的功能提供后备。例如，如果你想使用[`fetch`](https://web.nodejs.cn/en-us/docs/web/api/fetch_api/)功能，该功能自 v18 起仅在 Node.js 中支持，你可以使用类似的 API，如 [node-fetch](https://www.npmjs.com/package/node-fetch) 提供的 API。你可以通过动态导入有条件地执行此操作：

  ```javascript
// myModule.js
  if (typeof fetch === "undefined") {
  // We are running in Node.js; use node-fetch
    globalThis.fetch = (await import("node-fetch")).default;
}
  // …
  ```
```
  
[`globalThis`](https://web.nodejs.cn/en-us/docs/web/javascript/reference/global_objects/globalthis/)变量是一个全局对象，在每个环境中都可用，如果你想在模块内读取或创建全局变量，则该变量非常有用。

这些做法并不是模块所独有的。尽管如此，随着代码可重用性和模块化的趋势，我们鼓励你使代码跨平台，以便尽可能多的人享受它。Node.js 等运行时也在尽可能积极地实现 Web API，以提高与 Web 的互操作性。

## 十七、[故障排除](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#故障排除)

如果你在使模块正常工作时遇到问题，这里有一些提示可能会对你有所帮助。如果你发现更多，请随时添加到列表中！

- 我们之前提到过这一点，但重申一下：`.mjs` 文件需要使用 `text/javascript` 的 MIME 类型（或其他与 JavaScript 兼容的 MIME 类型，但建议使用 `text/javascript`）加载，否则你将得到像 "服务器使用非 JavaScript MIME 类型进行响应" 这样严格的 MIME 类型检查错误。
- 如果你尝试在本地加载 HTML 文件（即使用 `file://` URL），由于 JavaScript 模块安全要求，你将遇到 CORS 错误。你需要通过服务器进行测试。GitHub 页面是理想的选择，因为它还提供具有正确 MIME 类型的 `.mjs` 文件。
- 由于 `.mjs` 是非标准文件扩展名，某些操作系统可能无法识别它，或者尝试用其他名称替换它。例如，我们发现 macOS 会默默地将 `.js` 添加到 `.mjs` 文件的末尾，然后自动隐藏文件扩展名。所以我们所有的文件实际上都以 `x.mjs.js` 的形式出现。一旦我们关闭自动隐藏文件扩展名，并训练它接受 `.mjs`，就 OK 了。

## 十八、[也可以看看](https://web.nodejs.cn/en-us/docs/web/javascript/guide/modules/#也可以看看)

- v8.dev 上的 [JavaScript 模块](https://v8.dev/features/modules) (2018)
- hacks.mozilla.org 上的 [ES 模块：卡通深潜](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) (2018)
- hacks.mozilla.org 上的 [ES6 深入研究：模块](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/) (2015)
- [探索 JS，第 16 章：模块](https://exploringjs.com/es6/ch_modules.html) 博士阿克塞尔·劳施梅尔

```