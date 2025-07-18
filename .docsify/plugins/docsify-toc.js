/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-toc.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: Add a Table of Contents to your site.
 *              https://github.com/mrpotatoes/docsify-toc
 * ======================================================
 */


// 默认配置选项
var defaultOptions = {
  headings: 'h1, h2',    // 要包含的标题级别
  scope: '.markdown-section', // 内容范围选择器
  title: 'Contents',     // 目录标题文本
  listType: 'ul',        // 列表类型(ul/ol)
  minScreenWidth: 1200   // 显示目录的最小屏幕宽度
};

/**
 * @brief 创建目录标题元素
 * @param {string} title - 标题文本
 * @return {HTMLElement} 标题元素
 */
var createTocHeading = function (title) {
  return document.createElement('h2').appendChild(
    document.createTextNode(title)
  );
};

/**
 * @brief 创建目录链接元素
 * @param {HTMLElement} src - 源标题元素
 * @return {HTMLElement} 链接元素
 */
var createTocLink = function (src) {
  var a = document.createElement('a');
  a.innerHTML = src.innerHTML;
  a.href = src.firstChild.href || '#' + src.id;
  a.onclick = handleTocClick;
  a.setAttribute('class', 'anchor');
  return a;
};

/**
 * @brief 处理目录项点击事件
 * @param {Event} e - 点击事件对象
 */
var handleTocClick = function (e) {
  var activeItems = document.querySelectorAll('.page_toc .active');
  [].forEach.call(activeItems, function (item) {
    item.setAttribute('class', 'anchor');
  });
  e.currentTarget.setAttribute('class', 'active');
};

/**
 * @brief 创建多级列表结构
 * @param {HTMLElement} wrapper - 父级容器
 * @param {number} depth - 嵌套深度
 * @return {HTMLElement} 最内层列表元素
 */
var createNestedList = function (wrapper, depth) {
  while (depth--) {
    if (wrapper) {
      wrapper = wrapper.appendChild(
        document.createElement('ul')
      );
    }
    if (depth) {
      wrapper = wrapper.appendChild(
        document.createElement('li')
      );
    }
  }
  return wrapper;
};

/**
 * @brief 获取所有符合条件的标题元素
 * @param {string} selector - 选择器
 * @return {Array} 标题元素数组
 */
var getHeaders = function (selector) {
  var headings = document.querySelectorAll(selector);
  var ret = [];
  [].forEach.call(headings, function (heading) {
    ret = ret.concat(heading);
  });
  return ret;
};

/**
 * @brief 获取标题级别
 * @param {HTMLElement} header - 标题元素
 * @return {number} 标题级别(1-6)
 */
var getHeaderLevel = function (header) {
  var level = header.match(/\d/g);
  return level ? Math.min.apply(null, level) : 1;
};

/**
 * @brief 向上查找父级列表
 * @param {HTMLElement} current - 当前元素
 * @param {number} levels - 向上查找的层级数
 * @return {HTMLElement} 目标父级元素
 */
var findParentList = function (current, levels) {
  while (levels--) {
    current = current.parentElement;
  }
  return current;
};

/**
 * @brief 构建目录结构
 * @param {object} options - 配置选项
 * @return {HTMLElement} 完整的目录元素
 */
var buildTocStructure = function (options) {
  var tocRoot = document.createElement('ul');
  var currentWrapper = tocRoot;
  var lastItem = null;
  var selector = options.scope + ' ' + options.headings;
  var headers = getHeaders(selector).filter(h => h.id);

  headers.reduce(function (prevLevel, currentHeader, index) {
    var currentLevel = getHeaderLevel(currentHeader.tagName);
    var levelDiff = currentLevel - prevLevel;

    currentWrapper = (levelDiff > 0)
      ? createNestedList(lastItem, levelDiff)
      : findParentList(currentWrapper, -levelDiff * 2);

    currentWrapper = currentWrapper || tocRoot;

    var listItem = document.createElement('li');
    currentWrapper.appendChild(listItem).appendChild(createTocLink(currentHeader));
    lastItem = listItem;

    return currentLevel;
  }, getHeaderLevel(options.headings));

  return tocRoot;
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
function docsifyToc(hook, vm) {
  var userOptions = Object.assign({}, defaultOptions, window.$docsify.toc);

  hook.doneEach(function () {
    // 小屏幕不显示目录
    if (window.innerWidth < userOptions.minScreenWidth) {
      const existingNav = document.querySelector('.nav');
      if (existingNav) {
        existingNav.parentNode?.removeChild(existingNav);
      }
      return;
    }

    // 检查是否有标题
    const selector = userOptions.scope + ' ' + userOptions.headings;
    const headers = getHeaders(selector).filter(h => h.id);
    if (headers.length === 0) {
      const existingNav = document.querySelector('.nav');
      if (existingNav) {
        existingNav.parentNode?.removeChild(existingNav);
      }
      return;
    }

    // 创建导航容器
    let nav = document.querySelector('.nav');
    if (!nav) {
      const content = window.Docsify.dom.find(".content");
      if (!content) return;

      nav = window.Docsify.dom.create("aside", "");
      window.Docsify.dom.toggleClass(nav, "add", "nav");
      window.Docsify.dom.before(content, nav);
    }

    // 渲染目录
    requestAnimationFrame(() => {
      const toc = buildTocStructure(userOptions);
      const title = document.createElement('p');
      title.innerHTML = userOptions.title;
      title.setAttribute('class', 'title');

      const container = document.createElement('div');
      container.setAttribute('class', 'page_toc');

      container.appendChild(title);
      container.appendChild(toc);

      // 移除旧目录
      const oldToc = document.querySelectorAll('.nav .page_toc');
      if (oldToc.length > 0) {
        oldToc[0].parentNode.removeChild(oldToc[0]);
      }

      nav.appendChild(container);
    });
  });
}

/**
 * @brief 注册插件
 * @description 安全地注册插件并合并配置
 */
(function registerPlugin() {
  // 初始化docsify全局对象
  window.$docsify = window.$docsify || {};
  
  // 深度合并配置
  window.$docsify.toc = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.toc || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    plugin => plugin.name === 'docsifyToc'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    docsifyToc.name = 'docsifyToc';
    window.$docsify.plugins.unshift(docsifyToc);
  }
})();
