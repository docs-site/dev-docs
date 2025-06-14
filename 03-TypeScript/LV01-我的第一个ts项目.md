---
title: LV01-我的第一个ts项目
date: 2025-06-13 09:20:04
icon: famicons:logo-markdown
index: true
tags:
categories:
---

Hello，World！哈哈哈，这里是我的第一个TypeScript项目工程。

<!-- more -->

## <font size=3>一、先来看一个项目</font>

起因是自己看到说vitepress生成静态网页更快，所以就去看了，默认主题真的好简洁，挺喜欢的，但是，就是它的插件和主题并不像hexo、vuepress那么多，就连一个侧边栏都要自己手写，之后在网上看到有大佬写脚本生成侧边栏，直接解决了这个痛点，后来看了下大概的原理，大概就是扫描指定目录，获取目录和文件，过滤不需要的文件和目录，然后排序，最后生成符合vitepress侧边栏数据类型的对象，说起来很简单，但是对于我一个搞嵌入式的人来说，前端多少有些难度了，但是还是想折腾一把，就当学习了。首先就从Hello World开始吧。先看一下自动侧边栏那个插件项目：[GitHub - jooy2/vitepress-sidebar: 🔌 VitePress auto sidebar generator plugin. Easy to use and supports advanced customization.](https://github.com/jooy2/vitepress-sidebar)，它的一级目录结构如下：

<img src="./LV01-我的第一个ts项目/img/image-20250613093020357.png" alt="image-20250613093020357"  />

像里面的`.git`、`.github`、`.vscode`等一下常用的目录和文件一看知道，它有什么用，怎么创建的，但是还有一些文件，之前是没接触过的，后面就来了解一下。

## <font size=3>二、Hello，World!</font>

### <font size=3>1. npm项目</font>

ts文件最后要被编译成js文件，我们运行js文件可以用nodejs，这样的话，我们可以创建一个npm项目，后面也方便管理要用到的依赖包。我们执行以下命令：

```shell
npm init -y # -y表示全部执行默认操作，也可以不加-y表示交互模式
```

### <font size=3>2. tsc工具</font>

怎么把ts文件编译成js？这就要用到`tsc`，它 是 TypeScript 的命令行工具，它负责将 TypeScript 代码编译成标准的 JavaScript 代码。在开发过程中，类型检查是 TypeScript 的一个重要特性，`tsc` 通过静态分析代码，帮助开发者发现潜在的错误。

这里可以安装到项目中，不过后来感觉不是很方便，也可以直接全局安装：

```shell
npm install -D typescript # 局部安装到当前项目
npm install -g typescript # 全局安装
```

### <font size=3>3. index.ts</font>

创建index.ts文件：

```typescript
const message: string = "Hello, World!";
console.log(message);
```

### <font size=3>4. 怎么编译？</font>

我们刚才是局部安装的tsc工具，不能直接使用，可以通过npm run命令来实现，我们在package.json添加脚本：

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc index.ts --outDir dist"
  },
```

其中`--outDir`可以指定输出目录，然后执行以下命令：

```shell
npm run build
```

如果是全局安装的哈，就可以直接执行：

```shell
tsc index.ts --outDir dist
```

就会在dist目录下生成 index.js 文件。

> Tips：相关的编译选项可以看这里 [tsc CLI 选项 - TypeScript 中文文档](https://nodejs.cn/typescript/project-config/compiler-options/#compiler-options)

### <font size=3>5. 怎么运行？</font>

#### <font size=3>5.1 编译后通过node运行</font>

生成index.js文件后，我们可以通过node命令运行：

```shell
node ./dist/index.js
```

然后就能看到打印出了Hello, World!。

#### <font size=3>5.2 tsx</font>

> Tips：[Node.js 中文网 — 使用运行器运行 TypeScript](https://nodejs.cn/en/learn/typescript/run)

[tsx](https://tsx.is/) 是 Node.js 的一个 TypeScript 执行环境。它允许直接在 Node.js 中运行 TypeScript 代码，而无需先编译它。但请注意，它不会对我们的代码进行类型检查。因此，我们建议在交付之前先使用 `tsc` 对代码进行类型检查，然后使用 `tsx` 运行它。

```shell
npm i -D tsx #安装tsx
npx tsx ./src/index.js
```

### <font size=3>6. 项目结构</font>

到现在为止，我们的目录结构如下：

```shell
ts-demo
├── .git
├── .gitignore
├── dist
├── index.ts
├── node_modules
├── package-lock.json
└── package.json

3 directories, 4 files
```



## <font size=3>三、ts项目配置</font>

我们先来看 tsconfig.json文件，它是什么？有什么用？这里我们可以参考：[项目配置 - TypeScript 中文文档](https://nodejs.cn/typescript/project-config/)

### <font size=3>1. tsconfig.json</font>

#### <font size=3>1.1 什么是 tsconfig.json</font>

目录中存在 `tsconfig.json` 文件表明该目录是 TypeScript 项目的根目录。`tsconfig.json` 文件**指定编译项目所需的根文件和编译器选项**。对于JavaScript 项目可以改用 `jsconfig.json` 文件，它的作用几乎相同，但默认启用了一些与 JavaScript 相关的编译器标志。

项目通过使用 tsconfig.json 或 jsconfig.json进行编译：

- 通过在没有输入文件的情况下调用 tsc，在这种情况下，编译器会从当前目录开始搜索 `tsconfig.json` 文件，并继续沿父目录链向上。
- 通过在没有输入文件和 `--project`（或只是 `-p`）命令行选项的情况下调用 tsc，该选项指定包含 `tsconfig.json` 文件的目录的路径，或包含配置的有效 `.json` 文件的路径。

在命令行上指定输入文件时，`tsconfig.json` 文件将被忽略。

#### <font size=3>1.2 一般格式</font>

`tsconfig.json`文件的格式，是一个 JSON 对象，最简单的情况可以只放置一个空对象`{}`。下面是一个示例。

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "allowJs": true,
    "target": "es5"
  },
  "include": ["./src/**/*"]
}
```

- `include`：指定哪些文件需要编译。
- `allowJs`：指定源目录的 JavaScript 文件是否原样拷贝到编译后的目录。
- `outDir`：指定编译产物存放的目录。
- `target`：指定编译产物的 JS 版本。

#### <font size=3>1.3 怎么生成？</font>

`tsconfig.json`文件可以不必手写，使用 tsc 命令的`--init`参数自动生成。

```shell
tsc --init
```

通过命令生成的`tsconfig.json`文件，里面会有一些默认配置。配置含义我们可以查阅：[TypeScript: TSConfig 参考 - 所有 TSConfig 选项的文档](https://www.typescriptlang.org/zh/tsconfig/)

我们也可以使用别人预先写好的 tsconfig.json 文件，npm 的`@tsconfig`名称空间下面有很多模块，都是写好的`tsconfig.json`样本，比如 `@tsconfig/recommended`和`@tsconfig/node16`。这些模块需要安装，以`@tsconfig/deno`为例。

```shell
npm install --save-dev @tsconfig/deno
```

安装以后，就可以在`tsconfig.json`里面引用这个模块，相当于继承它的设置，然后进行扩展。

### <font size=3>2. tsconfig.prod.json</font>

当运行`tsc`命令的时候，默认会使用当前目录下的`tsconfig.json`文件，但是要是想用其他的就可以通过`tsc`的`-p`或者`--project`参数来指定配置文件。所以还会看到有些项目有 `tsconfig.prod.json`文件，在这个文件中可以用`extends`来继承另一个配置，然后覆盖或者添加选项，例如：

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["test/**/*.test.ts", "docs-dist/*", "docs/.vitepress/*"]
}
```

extends后面就是要继承的文件，exclude就是要排除的目录及文件。需要注意的是，在使用`tsc -p`来指定配置文件的时候，配置文件必须是要存在的，不然会报错。

### <font size=3>3. 使用实例</font>

#### <font size=3>3.1 `tsconfig.json`</font>

我们创建一个 `tsconfig.json` 文件，配置如下：

```json
{
  "compilerOptions": {
    "target": "ES2020",          // 编译目标ES版本
    "module": "CommonJS",        // 模块系统类型
    "outDir": "./dist",          // 输出目录
    "rootDir": "./src",          // 源代码目录
    "strict": true,              // 启用所有严格类型检查
    "esModuleInterop": true,     // 支持CommonJS/ES模块互操作
    "sourceMap": true            // 生成sourcemap用于调试
  },
  "include": ["src/**/*.ts"],    // 包含的文件
  "exclude": ["node_modules"]    // 排除的文件
}

```

还可以定义一个`tsconfig.prod.json`：

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["test/**/*.test.ts", "docs-dist/*", "docs/.vitepress/*"]
}
```

#### <font size=3>3.2 `src/index.ts`</font>

然后把前面的index.ts文件移动到src目录，最终文件目录结构如下：

```shell
ts-demo
├── .git
├── .gitignore
├── dist
│   └── index.js
├── node_modules
├── package-lock.json
├── package.json
├── src
│   └── index.ts
└── tsconfig.json
```

#### <font size=3>3.3 `package.json`</font>

修改`package.json`如下：

```json
{
  //......
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc --project tsconfig.prod.json",
    "start": "node ./dist/index.js"
  },
  //......
}
```

#### <font size=3>3.4 编译运行</font>

和上面一样，执行`npm run build`或者全局安装了`tsc`的话，直接执行`tsc`也行。运行的话就是`node ./dist/index.js`或者`npm run start`。

## <font size=3>四、Prettier - Code formatter</font>

### <font size=3>1. Prettier 是什么？</font>

直接看官网把：[Prettier 中文网 · Prettier 是一个“有态度”的代码格式化工具](https://www.prettier.cn/)，Prettier 是一种前端代码格式化工具，支持javascript、jsx、typescript、css,less和scss、html、vue、angular、json、markdown等多种前端技术语言格式化。

> Tips：这里有一个配置文档可以参考：[什么是 Prettier？ · Prettier 中文网](https://prettier.nodejs.cn/docs/)

### <font size=3>2. VSCode中使用</font>

我们可以直接在vscode扩展中搜索安装这个扩展：

```txt
名称: Prettier - Code formatter
ID: esbenp.prettier-vscode
说明: Code formatter using prettier
版本: 11.0.0
发布者: Prettier
VS Marketplace 链接: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
```

怎么配置？我们直接在工程中创建 `.vscode`目录，然后创建两个文件：

- `.vscode/extensions.json`：这个文件可以用于**管理项目推荐的扩展插件**。它可以帮助团队统一开发环境，确保所有协作者使用相同的工具链。

```json
{
  "recommendations": ["esbenp.prettier-vscode"]
}
```

- `.vscode/settings.json`：这个配置文件针对工作区生效。

```json
{
  "files.autoSave": "afterDelay", // 文件自动保存
  "editor.formatOnSave": true, // 保存时格式化代码
  "editor.wordWrap": "on",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.tabSize": 2,        // json、js、ts等文件常见的还是2个空格
  "prettier.embeddedLanguageFormatting": "off",
  "prettier.enable": true
}
```

我们还需要创建vscode的代码格式化规则文件，在工程目录创建即可，这个会在后面说明。

### <font size=3>3. 项目中使用</font>

#### <font size=3>3.1 prettier依赖包</font>

如果想在项目中使用prettier，这种方式可以直接格式化整个项目或者是整个目录。建议项目中一定要安装prettier和统一好格式化规则。首先下载prettier依赖，为项目添加格式化依赖。例如：

```shell
npm install --save-dev prettier
```

#### <font size=3>3.2 检查目录及子目录文件格式化情况</font>

我们执行下面的命令可以检查指定目录和子目录的文件格式化情况：

```shell
npx prettier . --check
```

npx 随 npm 提供，可以让我们直接运行本地安装的工具。在执行命令前记得先安装prettier依赖包，不然npx会下载最新版的prettier格式化代码。后续可以在npm项目的`package.json`中编写执行脚本来使用。执行后会有以下打印信息，这里面就是扫描到的没有处理过的文件：

```shell
D:\sumu_blog\ts-demo [master +2 ~2 -0 !]> npx prettier . --check
Checking formatting...
[warn] .prettierrc
[warn] .vscode/extensions.json
[warn] .vscode/settings.json
[warn] index.js
[warn] package-lock.json
[warn] package.json
[warn] src/index.ts
[warn] tsconfig.json
[warn] Code style issues found in 8 files. Run Prettier with --write to fix.
```

可以看到它扫描了很多的文件。其中`index.js`文件是我们用来测试的文件。

#### <font size=3>3.3 格式目录及子目录下的文件</font>

想要格式化那些文件，可以执行：

```shell
npx prettier . --write
npx prettier ./index.js --write
```

### <font size=3>4. 配置文件</font>

怎么自定义格式化风格？我们需要为Prettier编写配置文件，来规定我们项目代码的格式化风格，配置文件写法有点多，我这里是用 JSON 编写 `.prettierrc` 文件，当工程目录下存在有 `.prettierrc`  时，就可以使用这个文件中的配置来格式化，包括vscode中的插件也是使用的这个配置文件。

> 多种配置文件风格可参考：[prettier-configuration File](https://www.prettier.cn/docs/configuration.html)或者[配置文件 · Prettier 中文网](https://prettier.nodejs.cn/docs/configuration)

可以简单先写一个，默认的tab键是2个空格，我们可以在`.prettierrc` 中定义一个来做测试：

```json
{
  "tabWidth": 4
}
```

关于有哪些配置项可以看这里：[选项 · Prettier 中文网](https://prettier.nodejs.cn/docs/options)，这里是我目前在用的：

```json
{
  "tabWidth": 2,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "insertPragma": false,
  "requirePragma": false,
  "proseWrap": "never",
  "htmlWhitespaceSensitivity": "strict",
  "endOfLine": "lf"
}
```

### <font size=3>5. 忽略文件</font>

> Tips：可以参考[忽略代码 · Prettier 中文网](https://prettier.nodejs.cn/docs/ignore)

默认情况下，prettier 会忽略版本控制系统目录（".git"、".jj"、".sl"、".svn" 和 ".hg"）和 `node_modules`（除非指定了 [`--with-node-modules` CLI 选项](https://prettier.nodejs.cn/docs/cli#--with-node-modules)）中的文件。如果 ".gitignore" 文件存在于运行它的同一目录中，**Prettier 还将遵循 ".gitignore" 文件中指定的规则**。

我们可以使用 `.prettierignore` 完全忽略（即不重新格式化）某些文件和文件夹。`.prettierignore` 使用 `.gitignore` 语法。例如，如下所示的`.prettierignore`：

```txt
dist/

# IDEs
.idea/
.vscode/

# Project files

# For development
.gitignore
.prettierignore
.prettierrc
node_modules/

package.json
package-lock.json

tsconfig.json
```

这个时候我们再检查，就会排除掉一些文件了：

```shell
Checking formatting...
[warn] index.js
[warn] src/index.ts
[warn] Code style issues found in 2 files. Run Prettier with --write to fix.
```

这个时候发现就只能扫描到2个文件了。

## <font size=3>五、Terser 压缩与混淆</font>

### <font size=3>1. 压缩和混淆是什么？</font>

#### <font size=3>1.1 为什么要压缩和混淆？</font>

了解一下这两个概念：

- **压缩**：删除 Javascript 代码中所有注释、跳格符号、换行符号及无用的空格，从而压缩 JS 文件大小。
- **混淆**：经过编码将变量和函数原命名改为毫无意义的命名，以防止他人窥视和窃取 Javascript 源代码。

所以就很清楚了，就是为了减小体积，加快访问速度，网络传输的时候，体积更小的JS文件会减少带宽占用，对于用户来说也更省流量。还可以避免一些安全问题。

#### <font size=3>1.2 有哪些工具？</font>

压缩和混淆工具就多了，常用的有：

- UglifyJS

[UglifyJS](https://github.com/mishoo/UglifyJS)是一个非常流行的JavaScript压缩工具，可以将JS文件混淆、压缩，并且支持 ES6+ 语法。它具有比较高的压缩率和速度，是前端开发者经常使用的工具之一。然而，UglifyJS的压缩效果可能不如其他一些现代工具。

- Terser

[Terser](https://github.com/terser/terser)是ECMAScript编译器，也可以作为JS压缩工具使用。相比于UglifyJS，Terser更加现代，支持ES6+语法，并且具有更强的压缩能力。Terser可以移除注释、空格和未使用的代码，同时保留了可读性更好的变量名。此外，Terser还可以与Webpack等构建工具集成。它是UglifyJS的替代品，具有更好的压缩效果和更快的压缩速度。

- Closure Compiler

[Google Closure Compiler](https://github.com/google/closure-compiler)是由Google开发的JavaScript压缩工具，具有非常强大的优化能力。它可以做更多的代码优化，包括变量重命名、死代码移除等，从而进一步减小JS文件的体积。需要注意的是，Closure Compiler是基于Java开发的，因此需要安装Java环境才能使用。

### <font size=3>2. Terser安装</font>

#### <font size=3>2.1 Terser简介</font>

这里来学习一下Terser，Terser 是 JavaScript 代码的行业标准压缩器。它压缩变量名称、删除空格和注释、并且删除未使用的代码。我们可以通过 [命令行](https://terser.nodejs.cn/docs/cli-usage) 或 [Node.JS API](https://terser.nodejs.cn/docs/api-reference) 使用它。

> Tips：[Terser 中文网](https://terser.nodejs.cn/)

#### <font size=3>2.2 terser依赖安装</font>

```shell
npm install --save-dev terser 
```

#### <font size=3>2.3 基本用法</font>

> Tips：[CLI 用法 | Terser 中文网](https://terser.nodejs.cn/docs/cli-usage/)

```shell
terser [input files] [options]
```

例如把 index.js 压缩并输出到 output.min.js：

```shell
terser ./dist/index.js --compress --mangle --output ./dist/output.min.js
```

由于是局部安装，所以要放在package.json中才能用，这个我们后面再说。

### <font size=3>3. 配置文件</font>

> Tips：
>
> - [API 参考 | Terser 中文网](https://terser.nodejs.cn/docs/api-reference/#minify-options-structure)
> - [选项 | Terser 中文网](https://terser.nodejs.cn/docs/options/)

#### <font size=3>3.1 配置文件类型</font>

Terser 支持将配置项放在单独的配置文件中，便于管理。之前看到Terser 支持两种配置文件格式：**JavaScript 文件 (`terser.config.js`)** 和 **JSON 文件 (`terser.config.json`)**，额，但是吧，我自己尝试的时候，js文件疯狂报错。留一个问题在这里吧，后面搞明白了再说。在官网的文档中又看到：

<img src="./LV01-我的第一个ts项目/img/image-20250613233402965.png" alt="image-20250613233402965" />

这里貌似只写了JSON文件，所以，后面还是用JSON文件配置吧。

##### <font size=3>3.1.1 terser.config.js</font>

我们可以创建一个名为 terser.config.js 的文件, 具体配置如下:

```javascript
// terser.config.js
module.exports = {
  compress: {
    drop_console: true,   // 去除console.*语句
    drop_debugger: true,  // 去除debugger语句
    passes: 2,            // 多次压缩迭代，效果更明显
    unused: true,         // 删除未使用的代码
    dead_code: true,      // 删除无效的代码分支
  },
  mangle: {
    toplevel: true,       // 混淆顶级变量和函数名
    properties: false,    // 默认不混淆属性名，避免破坏外部接口
  },
  output: {
    comments: false,      // 删除所有注释
    beautify: false,      // 不进行格式化排版，压缩为一行
  },
  sourceMap: {
    filename: "output.min.js",
    url: "output.min.js.map"
  }
};

```

（1）**支持动态逻辑**（条件判断、环境变量等）

（2）**支持非 JSON 类型**（正则表达式、函数等）

（3）**可添加注释**说明配置项

（4）**必须通过 CommonJS 导出** (`module.exports`)

##### <font size=3>3.1.2 terser.config.json</font>

```json
{
  "compress": {
    "drop_console": true,
    "drop_debugger": true,
    "passes": 2,
    "unused": true,
    "dead_code": true
  },
  "mangle": {
    "toplevel": true,
    "properties": false
  },
  "output": {
    "comments": false,
    "beautify": false
  },
  "sourceMap": {
    "filename": "output.min.js",
    "url": "output.min.js.map"
  }
}
```

（1）**纯静态配置**（无逻辑）

（2）**只支持 JSON 兼容类型**（字符串、布尔值、数组、对象）

（3）**不支持注释**（JSON 标准不允许注释）

（4）严格遵循 JSON 语法（双引号、无尾随逗号）

#### <font size=3>3.2 常用配置项</font>

- compress 压缩选项

<table>
	<thead>
		<tr>
			<th align="center">选项名</th>
			<th align="center">说明</th>
			<th align="center">推荐值</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>drop_console</td>
			<td>移除所有console.*语句</td>
			<td>true</td>
		</tr>
		<tr>
			<td>drop_debugger</td>
			<td>移除所有debugger语句</td>
			<td>true</td>
		</tr>
		<tr>
			<td>passes</td>
			<td>重复压缩次数，数值越高效果越好</td>
			<td>2~3</td>
		</tr>
		<tr>
			<td>unused</td>
			<td>删除未使用的变量或函数</td>
			<td>true</td>
		</tr>
		<tr>
			<td>dead_code</td>
			<td>删除死代码</td>
			<td>true</td>
		</tr>
	</tbody>
</table>

- mangle 混淆选项

<table>
	<thead>
		<tr>
			<th align="center">选项名</th>
			<th align="center">说明</th>
			<th align="center">推荐值</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>toplevel</td>
			<td>混淆顶级函数和变量名</td>
			<td>true</td>
		</tr>
		<tr>
			<td>properties</td>
			<td>是否混淆对象属性名</td>
			<td>false（慎用）</td>
		</tr>
		<tr>
			<td>reserved</td>
			<td>不被混淆的变量或函数名（保留关键字）</td>
			<td>按需配置</td>
		</tr>
	</tbody>
</table>

- sourceMap 源码映射选项（用于生成 source map 文件，便于调试）

<table>
	<thead>
		<tr>
			<th align="center">选项名</th>
			<th align="center">说明</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>filename</td>
			<td>指定输出js文件名</td>
		</tr>
		<tr>
			<td>url</td>
			<td>source map 文件的名称</td>
		</tr>
	</tbody>
</table>

#### <font size=3>3.3 怎么使用配置文件？</font>

terser.config.js 和 terser.config.json 文件的使用方式是一样的：

```shell
terser ./dist/index.js -o ./dist/output.min.js -c terser.config.js
terser ./dist/index.js -o ./dist/output.min.js -c terser.config.json
```

为了方便管理，可以在项目的 package.json 中添加一个 npm script：

```json
  "scripts": {
	// ......
    "minify": "terser ./dist/index.js -o ./dist/output.min.js --config-file terser.config.json",
  },
```

但是用js文件会报错：

```shell
D:\sumu_blog\ts-demo [master ≡ +1 ~2 -0 !]> npm run minify

> ts-demo@1.0.0 minify
> terser ./dist/index.js -o ./dist/output.min.js --config-file terser.config.js

SyntaxError: Unexpected token 'm', "module.exp"... is not valid JSON
    at JSON.parse (<anonymous>)
    at run_cli (D:\sumu_blog\ts-demo\node_modules\terser\dist\bundle.min.js:32899:24)
```

前面已经说了，官网的这个配置项似乎也并没有说可以用js文件，这里先这个样子吧，后面就还是用json文件了。

#### <font size=3>3.4 使用demo</font>

我们用这个配置文件尝试一下：

```json
{
  "compress": {
    "drop_console": true,
    "drop_debugger": true,
    "passes": 2,
    "unused": true,
    "dead_code": true
  },
  "mangle": {
    "toplevel": true,
    "properties": false
  },
  "output": {
    "comments": false,
    "beautify": false
  },
  "sourceMap": {
  }
}
```

这个文件会移除所有的`console.*`语句，所以执行压缩后的文件的话，原本打印的Hello,World!就不会再打印了，例如下面的文件：

```javascript
"use strict";
/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : index.ts
 * Author     : 苏木
 * Date       : 2025-06-13
 * Version    :
 * Description:
 * ======================================================
 */
function testPrettier(input) {
    try {
        if (input > 0) {
            return 'Positive';
        }
        else if (input < 0) {
            throw new Error('Negative');
        }
        return 'Zero';
    }
    catch (err) {
        console.error(err);
        return 'Error';
    }
}
const message = 'Hello, World!';
console.log(message);
console.log(testPrettier(5));
```

压缩后就是：

```javascript
"use strict";function r(r){try{if(r>0)return"Positive";if(r<0)throw new Error("Negative");return"Zero"}catch(r){return"Error"}}const t="Hello, World!";
```

## <font size=3>六、ESLint </font>

### <font size=3>1. 什么是ESLint？</font>

[ESLint](https://zh-hans.eslint.org/) 是一个根据方案识别并报告 ECMAScript/JavaScript 代码问题的工具，其目的是使代码风格更加一致并避免错误。在很多地方它都与 JSLint 和 JSHint 类似，除了：

- ESLint 使用 [Espree](https://github.com/eslint/espree) 对 JavaScript 进行解析。
- ESLint 在代码中使用 AST 评估方案。
- ESLint 完全是插件式的，每个规则都是一个插件，你可以在运行时中添加更多插件。

>Tips：
>
>- [Find and fix problems in your JavaScript code - ESLint - Pluggable JavaScript Linter](https://eslint.org/)
>
>- [检测并修复 JavaScript 代码中的问题。 - ESLint - 插件化的 JavaScript 代码检查工具](https://zh-hans.eslint.org/)



### <font size=3>2. 项目中安装ESLint包</font>

在项目中安装 ESLint 包，这个依赖包是eslint的核心代码：

```shell
npm i -D eslint
```

但是我们现在用的是Typescript，还需要再安装两个依赖包：

```shell
# @typescript-eslint/parser：ESLint的解析器，用于解析typescript，从而检查和规范Typescript代码
# @typescript-eslint/eslint-plugin：这是一个ESLint插件，包含了各类定义好的检测Typescript代码的规范
npm i -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

或者这里也可以不装，后面初始化的时候选择完

### <font size=3>3. 配置文件</font>

> 参考资料：
>
> - [配置文件 - ESLint - 插件化的 JavaScript 代码检查工具](https://zh-hans.eslint.org/docs/latest/use/configure/configuration-files#配置文件格式)
> - [ESLint 使用教程（一）：从零配置 ESLint_eslint教程-CSDN博客](https://blog.csdn.net/m0_37890289/article/details/143591974)
> - [在TS项目中，如何优雅的使用ESLint和Prettier构建代码工作流-CSDN博客](https://blog.csdn.net/React_Community/article/details/123343586)

#### <font size=3>3.1 创建配置文件</font>

我们通过以下命令启动初始化配置向导：

```shell
npx eslint --init
```

然后会进入命令行交互步骤，选择适合我们工程的参数即可创建对应的初始配置文件：

```shell
D:\sumu_blog\ts-demo [master ≡ +1 ~2 -0 !]> npx eslint --init
You can also run this command directly using 'npm init @eslint/config@latest'.

> ts-demo@1.0.0 npx
> create-config

@eslint/create-config: v1.9.0

√ What do you want to lint? · javascript
√ How would you like to use ESLint? · problems
√ What type of modules does your project use? · esm
√ Which framework does your project use? · none
√ Does your project use TypeScript? · no / yes
√ Where does your code run? · node
The config that you've selected requires the following dependencies:

eslint, @eslint/js, globals, typescript-eslint
√ Would you like to install them now? · No / Yes
√ Which package manager do you want to use? · npm
☕️Installing...

up to date, audited 135 packages in 2s

40 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Successfully created D:\sumu_blog\ts-demo\eslint.config.mjs file.
```

这个过程中会提示我们需要那些依赖，可以直接选择yes进行安装。然后就会创建一个初始的用于Typescript工程（上面选则的这个）的配置文件：

```javascript
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node }
  },
  tseslint.configs.recommended
]);

```

#### <font size=3>3.2 常用规则配置</font>

> Tips：
>
> - [配置规则 - ESLint - 插件化的 JavaScript 代码检查工具](https://zh-hans.eslint.org/docs/latest/use/configure/rules)
>
> - [规则参考 - ESLint - 插件化的 JavaScript 代码检查工具](https://zh-hans.eslint.org/docs/latest/rules/)

（1）[semi](https://zh-hans.eslint.org/docs/latest/rules/semi)：这一规则控制代码中是否需要分号。选项 always 表示总是需要分号，never 表示从不使用分号。

（2）[indent](https://zh-hans.eslint.org/docs/latest/rules/indent)：一规则控制代码的缩进方式。选项 2 表示使用两个空格缩进，4 表示使用四个空格。

#### <font size=3>3.3 一个简单的配置规则</font>

```typescript
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // 配置对象 1: 基础规则集
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  // 配置对象 2: 环境配置
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node }
  },
  // 配置对象 3: TypeScript支持
  tseslint.configs.recommended,
  // 配置对象 4: 自定义规则覆盖
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    rules: {
      semi: ['error', 'always'], // 强制使用分号
      indent: ['error', 2] // 强制使用2个空格缩进
    }
  }
]);

```

为什么使用多个独立配置对象？

（1）**职责分离原则**：每个配置对象负责单一功能。

（2）**文件作用域控制**：每个配置对象可独立控制应用范围，可为不同文件类型设置不同规则（如单独配置测试文件）。

（3）**配置合并机制**：ESLint 会**深度合并**数组中的配置对象，后面的配置会覆盖前面的同名设置。

（4）**模块化设计**：可直接导入外部配置（如 `tseslint.configs.recommended`），保持配置可复用性。

（5）**类型安全**：每个配置对象有明确的类型定义，避免单一巨大对象导致的配置混乱。

#### <font size=3>3.4 使用配置文件</font>

我们可以定义如下命令：

```json
  "scripts": {
    //......
    "eslint:fix": "eslint --fix -c eslint.config.mjs ./src/index.ts"
  },
```

然后执行 `npm run eslint:fix`即可按照定义的规则处理代码。

### <font size=3>4. 与 prettier 结合？</font>

这里有个问题，就是上面eslint中有控制缩进的参数，假设我们配置为4，但是prettier中配置为2，当我们格式化完代码，再使用eslint来处理，我们的代码缩进又会变成4个空格，这怎么办？我们要明确这两个工具有什么用：

- eslint中包含三类规则：代码质量检查、代码错误检查、代码风格检查
- prettier包含：代码风格检查

eslint的代码格式做的不够彻底，需要prettier进行增强。并且prettier支持更多的文件格式的格式化。但是它们代码风格部分会冲突，我们就需要对冲突部分进行处理了。这里我们安装两个依赖：

```shell
npm i -D eslint-config-prettier eslint-plugin-prettier
```

- [prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)：解决ESLint中的样式规范和prettier中样式规范的冲突，以prettier的样式规范为准，使ESLint中的样式规范自动失效
- [prettier/eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)：将 Prettier 的规则集成到 ESLint 中，通过 ESLint 检查 Prettier 格式问题。

我们修改一下上面的eslint.config.mjs：

```javascript
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  // 配置对象 1: 基础规则集
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  // 配置对象 2: 环境配置
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node }
  },
  // 配置对象 3: TypeScript支持
  tseslint.configs.recommended,
  // 配置对象 4: 自定义规则覆盖 (移除了与 Prettier 冲突的格式化规则)
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		rules: {
      semi: ['error', 'always'], // 强制使用分号
      indent: ['error', 4] // 强制使用2个空格缩进
    }
  },
  // 配置对象 5: 禁用与 Prettier 冲突的规则
  eslintConfigPrettier,
  // 配置对象 6: Prettier 集成 - 使用 Prettier 规则并覆盖其他格式化规则
  eslintPluginPrettierRecommended,
]);
```

这里将indent配置为4，但是.prettierrc中配置为2，最后执行命令后就会发现使用的是.prettierrc中的2个空格。

## <font size=3>七、单元测试</font>

### <font size=3>1. 单元测试简介</font>

#### <font size=3>1.1 什么是单元测试？</font>

单元测试是测试中的一个重要环节，它针对软件中的最小可测试单元进行验证，通常是指对代码中的单个函数、方法或模块进行测试。单元测试旨在确定特定部分代码的行为是否符合预期，通过针对单元代码的各种输入情况进行测试，来验证代码的正确性、稳定性和可靠性。

还会有一个概念叫集成测试，集成测试是将多个模块组合在一起，验证他们的相互协作是否正确。这种测试更关注于模块的接口及其交互。

那为什么要做单元测试？对于前端单元测试可以帮助开发者：

- 早期发现和修复问题，节省后续的修复成本。
- 改善代码质量，使其更加健壮和可靠。
- 为团队提供文档，帮助理解代码的预期行为。

#### <font size=3>1.2 常用的单元测试框架</font>

在Node.js领域，有多个测试框架可供选择，以下是一些流行的选择：

- Mocha：一个功能丰富的测试框架，支持多种风格的测试（行为驱动、测试驱动等），强大的断言库。

- Jasmine：一个行为驱动的开发框架，简单易用，提供了丰富的断言和测试功能。

- Jest：由Facebook开发的测试框架，具备快速的测试运行和优雅的API，内置对ES6、异步测试的支持。有模拟函数、快照等特色功能。

- Chai：一个断言库，可以与Mocha等测试框架结合使用，支持多种断言风格。

#### <font size=3>1.3 node:test</font>

> Tips：[test 测试 | Node.js v24 文档](https://nodejs.cn/api/test.html)

NodeJS 从 16 开始**自带**测试模块，包括了[node:test](https://nodejs.org/api/test.html)和[node:assert](https://nodejs.org/api/assert.html)相对于比较主流的 `jest`, `mocha` 等，好处是简单、轻量级，不需要安装额外的依赖，重要是速度很快！

### <font size=3>2. Node.js test 模块</font>

接下来我们来看一下怎么使用这个模块进行单元测试。

> 参考资料：
>
> - [Node 原生测试模块及tsest](https://www.xdnote.com/node-test-tsest/)

#### <font size=3>2.1 添加测试函数</font>

- index.ts

```typescript
/**
 * @brief 根据输入数字返回字符串表示
 * @param input 输入的数字
 * @return 字符串结果：'Positive'（正数）、'Zero'（零）、'Error'（错误）
 * @throws 当输入为负数时抛出 Error('Negative')
 */
export function testPrettier(input: number): string {
  try {
    if (input > 0) {
      return 'Positive';
    } else if (input < 0) {
      throw new Error('Negative'); // 此行会爆出错误，中断程序执行
    }
    return 'Zero';
  } catch (err) {
    console.error(err);
    return 'Error';
  }
}

console.log("=============start===============");
const message: string = 'Hello, World!';
console.log(message);
console.log(testPrettier(5));
console.log(testPrettier(0));
console.log(testPrettier(-5));
console.log("=============end===============");

```

- 测试文件

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { testPrettier } from '../src/index.ts';

describe('Test: base test', () => {
  it('测试正整数输入 (5)', () => {
    console.log('STEP: 验证输入5时返回"Positive"');
    assert.deepStrictEqual(
      testPrettier(5),
      'Positive'
    );
  });

  it('测试零输入 (0)', () => {
    console.log('STEP: 验证输入0时返回"Zero"');
    assert.deepStrictEqual(testPrettier(0), 'Zero');
  });

  it('测试负整数输入 (-5)', () => {
    console.log('STEP: 验证输入-5时返回"Error"');
    assert.deepStrictEqual(testPrettier(-5), 'Error');
  });
});

```

assert.deepStrictEqual函数原型：

```typescript
assert.deepStrictEqual(actual, expected[, message])
```

该函数接受上述和以下描述的以下参数：

- **actual: **此参数保存需要评估的实际值。它是任何类型。
- **expected: **此参数保存与实际值匹配的期望值。它是任何类型。
- **message: **此参数保存字符串或错误类型的错误消息。它是一个可选参数。

**返回值：**此函数返回对象类型的断言错误。

#### <font size=3>2.2 安装依赖</font>

我们要使用node:test，还需要安装依赖：

```shell
npm i -D @types/node
```

由于我们的测试文件是ts，ts文件还需要编译，我们这里可以安装tsx工具，直接运行ts文件：

```shell
npm i -D tsx
```

#### <font size=3>2.3 添加npm run脚本</font>

```json
"scripts": {
    "test": "tsx test/index.test.ts",
    //......
  },
```

然后我们就可以运行测试了。

#### <font size=3>2.4 测试结果</font>

```shell
D:\sumu_blog\ts-demo [master ↑2 +1 ~3 -0 !]> npm run test

> ts-demo@1.0.0 test
> tsx test/index.test.ts

=============start===============
Hello, World!
Positive
Zero
Error: Negative
    at testPrettier (D:\sumu_blog\ts-demo\src\index.ts:22:13)
    at <anonymous> (D:\sumu_blog\ts-demo\src\index.ts:36:13)
    at Object.<anonymous> (D:\sumu_blog\ts-demo\src\index.ts:37:46)
    at Module._compile (node:internal/modules/cjs/loader:1730:14)
    at Object.transformer (D:\sumu_blog\ts-demo\node_modules\tsx\dist\register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.require (node:internal/modules/cjs/loader:1487:12)
Error
=============end===============
STEP: 验证输入5时返回"Positive"
STEP: 验证输入0时返回"Zero"
STEP: 验证输入-5时返回"Error"
Error: Negative
    at testPrettier (D:\sumu_blog\ts-demo\src\index.ts:22:13)
    at TestContext.<anonymous> (D:\sumu_blog\ts-demo\test\index.test.ts:21:28)
    at Test.runInAsyncScope (node:async_hooks:214:14)
    at Test.run (node:internal/test_runner/test:1047:25)
    at Suite.processPendingSubtests (node:internal/test_runner/test:744:18)
    at Test.postRun (node:internal/test_runner/test:1173:19)
    at Test.run (node:internal/test_runner/test:1101:12)
    at async Suite.processPendingSubtests (node:internal/test_runner/test:744:7)
▶ Test: base test
  ✔ 测试正整数输入 (5) (1.096ms)
  ✔ 测试零输入 (0) (0.3967ms)
  ✔ 测试负整数输入 (-5) (0.774ms)
✔ Test: base test (3.331ms)
ℹ tests 3
ℹ suites 1
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9.4593
```

Error: Negative这部分就是因为调用了testPrettier(-5)，这个时候函数抛出了异常，然后被捕获，通过console.error(err);打印出来的。

## <font size=3>八、总结</font>

在这一部分，了解了Typescript项目工程的创建和配置，代码格式化、代码压缩和混淆、代码检查以及单元测试相关的内容。但是都是简单了解一下，看到别人的项目工程的时候知道这些文件都是做什么的，后续有必要的话再深入学习。
