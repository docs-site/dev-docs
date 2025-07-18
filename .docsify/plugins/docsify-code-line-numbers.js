/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-code-line-numbers.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: 为code的代码显示添加行号，并高亮显示激活行。
 *              https://github.com/spite-triangle/docsify-codeLineNum
 * ======================================================
 */

// 默认配置选项
var defaultOptions = {
  blacklist: [],  // 要过滤的语言列表
  lineHighlight: true  // 是否启用行高亮
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
var plugin = function (hook, vm) {

  /**
   * @brief 通过属性值获取元素
   * @param {string} tag - 要查找的标签名
   * @param {string} dataAttr - 要匹配的数据属性名
   * @return {Array} 匹配的元素数组
   */
  var getElementByAttr = function (tag, dataAttr) {
    var aElements = document.getElementsByTagName(tag);
    var aEle = [];
    for (var i = 0; i < aElements.length; i++) {
      var ele = aElements[i].getAttribute(dataAttr).toLowerCase();
      // 配置检测
      if (window.$docsify.codeLineNum === undefined || window.$docsify.codeLineNum.blacklist === undefined) {
        aEle.push(aElements[i]);
        continue;
      }

      if (window.$docsify.codeLineNum.blacklist.indexOf(ele) == -1) {
        aEle.push(aElements[i]);
      }
    }
    return aEle;
  };

  /**
   * @brief 获取子元素中的第一个指定标签元素
   * @param {HTMLElement} parent - 父元素
   * @param {string} tagName - 要查找的子标签名
   * @return {HTMLElement|null} 找到的元素或null
   */
  var getFirstSubelementByTag = function (parent, tagName) {
    // 没有子元素
    if (parent.childNodes == undefined) {
      return null;
    }
    var element = null;
    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i].tagName != undefined && parent.childNodes[i].tagName == tagName) {
        element = parent.childNodes[i];
        break;
      }
    }
    return element;
  };

  /**
   * @brief 创建带行号的代码行
   * @param {number} index - 行号
   * @param {string} content - 代码内容
   * @return {string} 生成的HTML字符串
   */
  var createLine = function (index, content) {
    var line = "<tr>";
    line += '<td id="L' + index + '" class="td-code td-code-line-number" data-line-number="' + index + '">';
    line += '<span class="code-line-number">' + index + '</span>'
    line += '</td>';
    line += '<td id="LC' + index + '" class="td-code td-code-line-content">' + content + '</td>';
    line += "</tr>"
    return line;
  };

  //------------------------------------------------------------------------
  // 插件钩子函数
  //------------------------------------------------------------------------

  /**
   * @brief 初始化钩子 - 规范配置参数
   */
  hook.init(function () {
    // 合并用户配置和默认配置
    window.$docsify.codeLineNum = Object.assign(defaultOptions, window.$docsify.codeLineNum);

    // 配置检测和处理
    if (window.$docsify.codeLineNum.blacklist == undefined) {
      return;
    }
    window.$docsify.codeLineNum.blacklist.forEach(function (item, index) {
      window.$docsify.codeLineNum.blacklist[index] = item.trim().toLowerCase();
    });
  });

  /**
   * @brief 页面渲染完成后钩子 - 为代码块添加行号
   */
  hook.doneEach(function () {
    // 清空选中
    window.$docsify["lastSelectedLine"] = null;

    // 查找所有的 code，黑名单除外
    var pres = getElementByAttr('pre', 'data-lang');

    // 遍历所有的 code
    pres.forEach(function (pre, index) {
      // 增加一个标记
      pre.classList.add("pre-code-block");

      var html = '';

      // 获取 code 标签
      var code = getFirstSubelementByTag(pre, 'CODE');
      // 代码拆分行
      var lines = code.innerHTML.split('\n');
      for (var i = 0; i < lines.length; i++) {
        html += createLine(i + 1, lines[i]);
      }
      code.innerHTML = '<table class="code-table"><tbody width=100%>' + html + '</tbody></table>';
      code.classList.add("code-block")

      // 如果启用了行高亮
      if (window.$docsify.codeLineNum.lineHighlight) {
        var codeLineNums = code.querySelectorAll('.td-code-line-content');
        codeLineNums.forEach(function (line) {
          // 行高亮
          line.addEventListener('mouseup', function (e) {
            var curTime = new Date();

            // 左键点击，且不是长按
            if (e.button != 0 || (curTime - window.$docsify.lastTime) > 200) {
              return;
            }

            // 当前行被选中
            this.classList.add("code-line-highlight");
            window.$docsify.lastSelectedLine = this;
          });

          line.addEventListener('mousedown', function (e) {
            // 存一下当前时间
            window.$docsify.lastTime = new Date();

            // 查看之前有没有被选中的
            if (window.$docsify.lastSelectedLine != null) {
              window.$docsify.lastSelectedLine.classList.remove("code-line-highlight");
            }
          });
        });
      }
    });
  });
};

/**
 * @brief 注册插件
 * @description 安全地注册插件并合并配置
 */
(function registerPlugin() {
  // 初始化docsify全局对象
  window.$docsify = window.$docsify || {};
  
  // 深度合并配置
  window.$docsify.codeLineNum = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.codeLineNum || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    p => p.name === 'docsifyCodeLineNumbers'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    plugin.name = 'docsifyCodeLineNumbers';
    window.$docsify.plugins.unshift(plugin);
  }
})();
