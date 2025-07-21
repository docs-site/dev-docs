---
title: LV01-hexo插件
date: 2025-07-12 09:23:41
icon: famicons:logo-markdown
index: true
tags:
categories:
---

本文主要是Hexo中的两种的相关笔记，若笔记中有错误或者不合适的地方，欢迎批评指正😃。

<!-- more -->

在看`Hexo`文档的时候发现了关于`Hexo`中的插件的相关知识，于是就去找了一些插件的源码，了解了一下大概的插件编写的格式，本文是记录一下自己开始尝试`Hexo`插件的第一步。

## 一、`Hexo`的插件

### 1. 两种插件

在`Hexo`中，有强大的插件系统，使开发者能偶轻松扩展功能而不用修改核心模块的源码。它的插件分为两种：脚本（`Scripts`）和插件（`Packages`）。

如果自己的代码很简单，可以编写脚本，这个时候只需要把自己编写的`JavaScript`文件放到`[site]/scripts`文件夹，整个文件夹一般默认是没有的，所以需要自己在站点根目录下创建，整个文件夹中的脚本文件在启动时就会自动载入。

另一种则适合自己的代码较为复杂的情况，或是自己想要发布到`npm`上，首先，在`node_modules`文件夹中建立文件夹，文件夹名称开头必须为`hexo-`，如此一来`Hexo`才会在启动时载入，否则`Hexo`将会忽略它。文件夹内至少要包含`2`个文件：一个是主程序，另一个是 `package.json`，描述插件的用途和所依赖的插件。

<table>
	<tbody>
		<tr>
			<td align="left">
			Hexo说明文档
			</td>
			<td align="left">
			<a href="https://hexo.io/zh-cn/docs/" target="_blank">https://hexo.io/zh-cn/docs/</a>
			</td>
		</tr>
		<tr>
			<td align="left">
			Hexo API文档
			</td>
			<td align="left">
			<a href="https://hexo.io/zh-cn/api/" target="_blank">https://hexo.io/zh-cn/api/</a>
			</td>
		</tr>
	</tbody>
</table>

### 2. 插件的加载流程

#### 2.1 脚本（`Scripts`）的加载

在阅读源码的过程中，有这么一部分代码，大致理解一下，就是使用此函数完成了根目录下`scripts`文件夹和主题文件目录下的`scripts`文件夹中的各个脚本文件的加载。

```JavaScript [site]/node_modules/hexo/lib/hexo/load_plugins.js
function loadScripts(ctx) {
  const baseDirLength = ctx.base_dir.length;

  function displayPath(path) {
    return magenta(path.substring(baseDirLength));
  }

  return Promise.filter([
    ctx.theme_script_dir,
    ctx.script_dir
  ], scriptDir => { // Ignore the directory if it does not exist
    return scriptDir ? exists(scriptDir) : false;
  }).map(scriptDir => listDir(scriptDir).map(name => {
    const path = join(scriptDir, name);

    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Script loaded: %s', displayPath(path));
    }).catch(err => {
      ctx.log.error({err}, 'Script load failed: %s', displayPath(path));
    });
  }));
}
```

#### 2.2 插件（`Packages`）的加载

`plugins`的加载是通过以下函数完成的。

```JavaScript [site]/node_modules/hexo/lib/hexo/load_plugins.js
function loadModules(ctx) {
  return loadModuleList(ctx).map(name => {
    const path = ctx.resolvePlugin(name);

    // Load plugins
    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Plugin loaded: %s', magenta(name));
    }).catch(err => {
      ctx.log.error({err}, 'Plugin load failed: %s', magenta(name));
    });
  });
}
```

### 3. `Hexo`相关函数

在使用插件之前，肯定要先了解一下基本的函数啦，这一节的内容大部分来自于`Hexo`官方文档。

#### 3.1 过滤器（`Filter`）

##### 3.1.1 函数原型

过滤器用于修改特定文件，`Hexo`将这些文件依序传给过滤器，而过滤器可以针对文件进行修改。

```JavaScript [site]/node_modules/hexo/lib/extend/filter.js
class Filter {
  constructor() {
    this.store = {};
  }
  register(type, fn, priority) {
    if (!priority) {
      if (typeof type === 'function') {
        priority = fn;
        fn = type;
        type = 'after_post_render';
      }
    }

    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    type = typeAlias[type] || type;
    priority = priority == null ? 10 : priority;

    const store = this.store[type] || [];
    this.store[type] = store;

    fn.priority = priority;
    store.push(fn);

    store.sort((a, b) => a.priority - b.priority);
  }
}
```
##### 3.1.2 函数说明

```JavaScript
hexo.extend.filter.register(type, function() {
  // User configuration
  const { config } = this;
  if (config.external_link.enable) // do something...

  // Theme configuration
  const { config: themeCfg } = this.theme;
  if (themeCfg.fancybox) // do something...

}, priority);
```

**type**：为过滤器列表，它应该是一个字符串数据，使用的时候要加上`''`，可以是以下值:

<table>
    <tbody>
      <tr>
        <td align="center">
        type的值
        </td>
        <td align="center">
        说明
        </td>
      </tr>
      <tr>
        <td align="center">
        before_post_render
        </td>
        <td align="left">
        在文章开始渲染前执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        after_post_render
        </td>
        <td align="left">
        在文章渲染完成后执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        before_exit
        </td>
        <td align="left">
        在 Hexo 即将结束时执行，也就是在 hexo.exit 被调用后执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        before_generate
        </td>
        <td align="left">
        在生成器解析前执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        after_generate
        </td>
        <td align="left">
        在生成器解析后执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        template_locals
        </td>
        <td align="left">
        修改模板的<a href="https://hexo.io/zh-cn/docs/variables" target="_blank">局部变量</a>。
        </td>
      </tr>
      <tr>
        <td align="center">
        after_init
        </td>
        <td align="left">
        在 Hexo 初始化完成后执行，也就是在 hexo.init 执行完成后执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        new_post_path
        </td>
        <td align="left">
        用来决定新建文章的路径，在建立文章时执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        post_permalink
        </td>
        <td align="left">
        用来决定文章的永久链接。
        </td>
      </tr>
      <tr>
        <td align="center">
        after_render
        </td>
        <td align="left">
        在<a href="https://hexo.io/zh-cn/api/rendering" target="_blank">渲染</a>后执行。
        </td>
      </tr>
      <tr>
        <td align="center">
        server_middleware
        </td>
        <td align="left">
        新增服务器的 Middleware。app 是一个<a href="https://github.com/senchalabs/connect" target="_blank">Connect</a>实例。
        </td>
      </tr>
    </tbody>
</table>

**priority**：是过滤器的优先级，`priority` 值越低，过滤器会越早执行，默认的 `priority` 是 10。建议提供配置选项如 `hexo.config.your_plugin.priority`，让用户自行决定过滤器的优先级。

#### 3.2 注入器（`Injector`）

##### 3.2.1 函数原型

注入器被用于将静态代码片段注入生成的`HTML `的`<head></head>`或`<body></body>`中。`Hexo`将在 `after_render:html`过滤器 **之前** 完成注入。

```JavaScript [site]/node_modules/hexo/lib/extend/injector.js
class Injector {
  constructor() {
    this.store = {
      head_begin: {},
      head_end: {},
      body_begin: {},
      body_end: {}
    };

  register(entry, value, to = 'default') {
    if (!entry) throw new TypeError('entry is required');
    if (typeof value === 'function') value = value();

    const entryMap = this.store[entry] || this.store.head_end;
    const valueSet = entryMap[to] || new Set();
    valueSet.add(value);
    entryMap[to] = valueSet;
  }
}
```
##### 3.2.2 函数说明

```JavaScript
hexo.extend.injector.register(entry, value, to)
```

- **entry**:字符串类型数据，表示代码片段注入的位置，接受以下值：

（1）`head_begin`: 注入在 `<head>` 之后（默认）

（2）`head_end`: 注入在 `</head>` 之前

（3）`body_begin`: 注入在 `<body>` 之后

（4）`body_end`: 注入在 `</body>` 之前

- **value**:字符串，或者支持返回值为字符串的函数，表示需要注入的代码片段。

- **to**:字符串类型数据，需要注入代码片段的页面类型，接受以下值：

（1）`default`: 注入到每个页面（默认值）

（2）`home`: 只注入到主页（`is_home() `为 `true` 的页面）

（3）`post`: 只注入到文章页面（`is_post()` 为 `true` 的页面）

（4）`page`: 只注入到独立页面（`is_page()` 为 `true` 的页面）

（5）`archive`: 只注入到归档页面（`is_archive()` 为 `true` 的页面）

（6）`category`: 只注入到分类页面（`is_category()` 为 `true` 的页面）

（7）`tag`: 只注入到标签页面（`is_tag()` 为 `true` 的页面）

其他自定义 `layout` 名称，自定义 `layout` 参考<a href="https://hexo.io/zh-cn/docs/writing" target="_blank">写作 - 布局（`Layout`）</a>实例。 

##### 3.2.3 示例程序

```JavaScript
const css = hexo.extend.helper.get('css').bind(hexo);
const js = hexo.extend.helper.get('js').bind(hexo);

hexo.extend.injector.register('head_end', () => {
  return css('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css');
}, 'music');

hexo.extend.injector.register('body_end', '<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js">', 'music');

hexo.extend.injector.register('body_end', () => {
  return js('/js/jquery.js');
});
```

#### 3.3 辅助函数（`Helper`）

##### 3.3.1 函数原型

辅助函数帮助我们在模板中快速插入内容，我们可以把复杂的代码放在辅助函数而非模板中。

```JavaScript [site]/node_modules/hexo/lib/extend/helper.js
class Helper {
  constructor() {
    this.store = {};
  }
  /**
   * Register a helper plugin
   * @param {String} name - The name of the helper plugin
   * @param {Function} fn - The helper plugin function
   */
  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }
}
```
##### 3.3.2 函数说明

```JavaScript
hexo.extend.helper.register(name, function(){
});
```
示例如下，此示例的作用是将`js`封装成一个函数，只需要自己填写要调用的脚本文件名称，就可以调用特定路径下的相应文件。

```JavaScript
hexo.extend.helper.register('js', function(path){
  return '<script src="' + path + '"></script>';
});
```

函数注册通过辅助函数注册后，可以通过以下格式调用。

```html
//在nunjuck模板中使用格式
{{- js('script.js') }}

//渲染之后为以下语句
<script src="script.js"></script>
```

## 二、尝试`Hexo`中最基本的插件

首先呢需要初始化一个新的站点目录，不做任何修改，以便于测试自己的写的基本插件是否生效。然后就可以开始编写插件啦😄。

```shell
# 初始化一个新文件夹作为站点
hexo init npm-test

# 进入该站点文件夹，
cd npm-test
```

### 1. 脚本（`Scripts`）测试

#### 1.1 过滤器（`Filter`）测试

在站点根目录下新建`scripts`文件夹，并新建一个`test.js`文件，添加以下内容，在编写环境控制台输出一段提示字符。

```JavaScript JavaScript
//before_exit表示在 Hexo 即将结束时执行，也就是在 hexo.exit 被调用后执行
var priority = 10;
hexo.extend.filter.register('before_exit', function() {
    console.log(`测试程序加载成功(ฅ>ω<*ฅ)`)
}, priority);

```

#### 1.2 注入器（`Injector`）测试

在`scripts/test.js`文件中添加以下内容。该测试程序实现的效果是在所有页面加载一个点击产生礼花炸开效果的脚本，并且在渲染后页面的控制台输出一段提示字符。该段程序可以也可以放在过滤器中。

```JavaScript
var user_info_js = `
<script>
  class Circle {
    constructor({ origin, speed, color, angle, context }) {
      this.origin = origin
      this.position = { ...this.origin }
      this.color = color
      this.speed = speed
      this.angle = angle
      this.context = context
      this.renderCount = 0
    }
  
    draw() {
      this.context.fillStyle = this.color
      this.context.beginPath()
      this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2)
      this.context.fill()
    }
  
    move() {
      this.position.x = (Math.sin(this.angle) * this.speed) + this.position.x
      this.position.y = (Math.cos(this.angle) * this.speed) + this.position.y + (this.renderCount * 0.3)
      this.renderCount++
    }
  }
  
  class Boom {
    constructor ({ origin, context, circleCount = 16, area }) {
      this.origin = origin
      this.context = context
      this.circleCount = circleCount
      this.area = area
      this.stop = false
      this.circles = []
    }
  
    randomArray(range) {
      const length = range.length
      const randomIndex = Math.floor(length * Math.random())
      return range[randomIndex]
    }
  
    randomColor() {
      const range = ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
      return '#' + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range)
    }
  
    randomRange(start, end) {
      return (end - start) * Math.random() + start
    }
  
    init() {
      for(let i = 0; i < this.circleCount; i++) {
        const circle = new Circle({
          context: this.context,
          origin: this.origin,
          color: this.randomColor(),
          angle: this.randomRange(Math.PI - 1, Math.PI + 1),
          speed: this.randomRange(1, 6)
        })
        this.circles.push(circle)
      }
    }
  
    move() {
      this.circles.forEach((circle, index) => {
        if (circle.position.x > this.area.width || circle.position.y > this.area.height) {
          return this.circles.splice(index, 1)
        }
        circle.move()
      })
      if (this.circles.length == 0) {
        this.stop = true
      }
    }
  
    draw() {
      this.circles.forEach(circle => circle.draw())
    }
  }
  
  class CursorSpecialEffects {
    constructor() {
      this.computerCanvas = document.createElement('canvas')
      this.renderCanvas = document.createElement('canvas')
  
      this.computerContext = this.computerCanvas.getContext('2d')
      this.renderContext = this.renderCanvas.getContext('2d')
  
      this.globalWidth = window.innerWidth
      this.globalHeight = window.innerHeight
  
      this.booms = []
      this.running = false
    }
  
    handleMouseDown(e) {
      const boom = new Boom({
        origin: { x: e.clientX, y: e.clientY },
        context: this.computerContext,
        area: {
          width: this.globalWidth,
          height: this.globalHeight
        }
      })
      boom.init()
      this.booms.push(boom)
      this.running || this.run()
    }
  
    handlePageHide() {
      this.booms = []
      this.running = false
    }
  
    init() {
      const style = this.renderCanvas.style
      style.position = 'fixed'
      style.top = style.left = 0
      style.zIndex = '999999999999999999999999999999999999999999'
      style.pointerEvents = 'none'
  
      style.width = this.renderCanvas.width = this.computerCanvas.width = this.globalWidth
      style.height = this.renderCanvas.height = this.computerCanvas.height = this.globalHeight
  
      document.body.append(this.renderCanvas)
  
      window.addEventListener('mousedown', this.handleMouseDown.bind(this))
      window.addEventListener('pagehide', this.handlePageHide.bind(this))
    }
  
    run() {
      this.running = true
      if (this.booms.length == 0) {
        return this.running = false
      }
  
      requestAnimationFrame(this.run.bind(this))
  
      this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight)
      this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight)
  
      this.booms.forEach((boom, index) => {
        if (boom.stop) {
          return this.booms.splice(index, 1)
        }
        boom.move()
        boom.draw()
      })
      this.renderContext.drawImage(this.computerCanvas, 0, 0, this.globalWidth, this.globalHeight)
    }
  }
  
  const cursorSpecialEffects = new CursorSpecialEffects()
  cursorSpecialEffects.init()
  console.log('点击效果程序加载成功(ฅ>ω<*ฅ)')
</script>
`
hexo.extend.injector.register('body_end', user_info_js, "default")
```
### 2. 插件（`Packages`）测试

上边介绍了脚本（`Scripts`）的测试程序，准备写插件的测试程序的时候发现，插件的测试程序其实和上边的测试程序是一模一样的，只不过是一个直接建立脚本文件，一个是另外生成一个插件，那这里就梳理一下从编写测试插件到安装插件然后运运行的过程吧。

#### 2.1 创建插件文件夹并进行初始化

```shell
# 新建文件夹
mkdir hexo-plugins-test
# 进入插件文件夹并初始化
cd hexo-plugins-test/ && npm init
```
创建并初始化相应文件夹后，会生成`package.json`文件，文件内容如下，基本都是默认的，这个`main`要注意，这里的`index.js`为`Hexo`使用该插件的时候入口脚本，所以插件中的主程序要写在该文件中。
```json
{
  "name": "hexo-plugins-test",
  "version": "0.0.0",
  "description": "我的插件测试程序",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "sumu",
  "license": "ISC"
}

```

#### 2.2 创建`index.js`主程序文件并添加测试程序

由于是使用的`Vscode`软件作为编程环境，所以直接创建该文件，并添加以下程序。此测试程序是将鼠标点击效果脚本添加到了过滤器中，在生成器解析后执行该脚本文件，出现的效果应该为在生成器解析后在编程环境的控制台输出一段测试程序加载成功的提示，随后通过启动本地预览，在那个页面点击都会有礼花炸开的效果，并且页面的控制台也会输出一个效果加载成功的提示。

```JavaScript
hexo.extend.filter.register('after_generate', function() {
  console.log(`测试程序加载成功(ฅ>ω<*ฅ)`)
  var user_info_js = `
  <script>
    class Circle {
      constructor({ origin, speed, color, angle, context }) {
        this.origin = origin
        this.position = { ...this.origin }
        this.color = color
        this.speed = speed
        this.angle = angle
        this.context = context
        this.renderCount = 0
      }
    
      draw() {
        this.context.fillStyle = this.color
        this.context.beginPath()
        this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2)
        this.context.fill()
      }
    
      move() {
        this.position.x = (Math.sin(this.angle) * this.speed) + this.position.x
        this.position.y = (Math.cos(this.angle) * this.speed) + this.position.y + (this.renderCount * 0.3)
        this.renderCount++
      }
    }
    
    class Boom {
      constructor ({ origin, context, circleCount = 16, area }) {
        this.origin = origin
        this.context = context
        this.circleCount = circleCount
        this.area = area
        this.stop = false
        this.circles = []
      }
    
      randomArray(range) {
        const length = range.length
        const randomIndex = Math.floor(length * Math.random())
        return range[randomIndex]
      }
    
      randomColor() {
        const range = ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
        return '#' + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range)
      }
    
      randomRange(start, end) {
        return (end - start) * Math.random() + start
      }
    
      init() {
        for(let i = 0; i < this.circleCount; i++) {
          const circle = new Circle({
            context: this.context,
            origin: this.origin,
            color: this.randomColor(),
            angle: this.randomRange(Math.PI - 1, Math.PI + 1),
            speed: this.randomRange(1, 6)
          })
          this.circles.push(circle)
        }
      }
    
      move() {
        this.circles.forEach((circle, index) => {
          if (circle.position.x > this.area.width || circle.position.y > this.area.height) {
            return this.circles.splice(index, 1)
          }
          circle.move()
        })
        if (this.circles.length == 0) {
          this.stop = true
        }
      }
    
      draw() {
        this.circles.forEach(circle => circle.draw())
      }
    }
    
    class CursorSpecialEffects {
      constructor() {
        this.computerCanvas = document.createElement('canvas')
        this.renderCanvas = document.createElement('canvas')
    
        this.computerContext = this.computerCanvas.getContext('2d')
        this.renderContext = this.renderCanvas.getContext('2d')
    
        this.globalWidth = window.innerWidth
        this.globalHeight = window.innerHeight
    
        this.booms = []
        this.running = false
      }
    
      handleMouseDown(e) {
        const boom = new Boom({
          origin: { x: e.clientX, y: e.clientY },
          context: this.computerContext,
          area: {
            width: this.globalWidth,
            height: this.globalHeight
          }
        })
        boom.init()
        this.booms.push(boom)
        this.running || this.run()
      }
    
      handlePageHide() {
        this.booms = []
        this.running = false
      }
    
      init() {
        const style = this.renderCanvas.style
        style.position = 'fixed'
        style.top = style.left = 0
        style.zIndex = '999999999999999999999999999999999999999999'
        style.pointerEvents = 'none'
    
        style.width = this.renderCanvas.width = this.computerCanvas.width = this.globalWidth
        style.height = this.renderCanvas.height = this.computerCanvas.height = this.globalHeight
    
        document.body.append(this.renderCanvas)
    
        window.addEventListener('mousedown', this.handleMouseDown.bind(this))
        window.addEventListener('pagehide', this.handlePageHide.bind(this))
      }
    
      run() {
        this.running = true
        if (this.booms.length == 0) {
          return this.running = false
        }
    
        requestAnimationFrame(this.run.bind(this))
    
        this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight)
        this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight)
    
        this.booms.forEach((boom, index) => {
          if (boom.stop) {
            return this.booms.splice(index, 1)
          }
          boom.move()
          boom.draw()
        })
        this.renderContext.drawImage(this.computerCanvas, 0, 0, this.globalWidth, this.globalHeight)
      }
    }
    
    const cursorSpecialEffects = new CursorSpecialEffects()
    cursorSpecialEffects.init()
    console.log('点击效果程序加载成功(ฅ>ω<*ฅ)')
  </script>
  `
  hexo.extend.injector.register('body_end', user_info_js, "default")

}, 98);
```
#### 2.3 打包并发布程序到`npm`

这个吧，要先看后边的笔记，了解一下如何在npm发布程序，在这里直接执行以下命令。

```shell
# 发布版本到npm
npm publish
```
出现以下提示信息代表发布成功。

```shell
npm notice 
npm notice package: hexo-plugins-test@0.0.0
npm notice === Tarball Contents ===
npm notice 5.5kB index.js
npm notice 244B  package.json
npm notice === Tarball Details ===
npm notice name:          hexo-plugins-test
npm notice version:       0.0.0
npm notice package size:  1.8 kB
npm notice unpacked size: 5.8 kB
npm notice shasum:        50ce71a91babf482f12b0f54a05a7ad48c3d8298
npm notice integrity:     sha512-EZwg7y6/fCmv/[...]oUQJ/Y0pKTR9g==
npm notice total files:   2
npm notice
+ hexo-plugins-test@0.0.0
```

#### 2.4 进入测试站点并安装插件

```shell
# 进入自己的站点根目录（site代表站点根目录）
cd [site]/
# 安装插件
npm install hexo-plugins-test
```

若无报错，即可进行下一步，启动本地预览，查看效果。

#### 2.5 启动本地预览

```shell
hexo cl && hexo g && hexo s
```