/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-back-to-top.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: 回到顶部按钮
 * ======================================================
 */

/** 
 * @brief 默认配置选项
 * @property {number} showAt - 滚动多少像素后显示按钮(默认300)
 * @property {number} scrollDuration - 滚动动画持续时间(ms, 默认500) 
 * @property {string} className - 按钮CSS类名(默认'back-to-top')
 * @property {string} title - 按钮标题提示文本(默认'Back to top')
 * @property {string} icon - 按钮内HTML内容(默认空)
 */
var defaultOptions = {
  showAt: 300,
  scrollDuration: 500,
  className: 'back-to-top',
  title: 'Back to top',
  icon: ''
};

/**
 * @brief 创建返回顶部按钮
 * @param {object} options - 配置选项
 * @return {HTMLElement} 创建的按钮元素
 */
var createButton = function (options) {
  var btn = document.createElement('div');
  btn.className = options.className;
  btn.title = options.title;
  btn.innerHTML = options.icon;
  return btn;
};

/**
 * @brief 处理滚动事件
 * @param {HTMLElement} btn - 返回顶部按钮
 * @param {number} showAt - 显示按钮的滚动阈值
 * @return {function} 滚动事件处理函数
 */
var handleScroll = function (btn, showAt) {
  return function () {
    if (window.pageYOffset > showAt) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  };
};

/**
 * @brief 处理点击事件
 * @param {number} scrollDuration - 滚动动画持续时间
 * @return {function} 点击事件处理函数
 */
var handleClick = function (scrollDuration) {
  return function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
      duration: scrollDuration
    });
  };
};

/**
 * @brief Docsify插件主函数
 * @param {object} hook - Docsify生命周期钩子
 * @param {object} vm - Docsify虚拟机实例
 */
function plugin(hook, vm) {
  var userOptions = vm.config.backToTop || {};

  hook.doneEach(function () {
    var options = Object.assign({}, defaultOptions, userOptions);
    var btn = createButton(options);

    // 移除已存在的按钮
    var existingBtn = document.querySelector('.' + options.className);
    if (existingBtn) {
      existingBtn.parentNode.removeChild(existingBtn);
    }

    // 添加事件监听
    window.addEventListener('scroll', handleScroll(btn, options.showAt));
    btn.addEventListener('click', handleClick(options.scrollDuration));

    document.body.appendChild(btn);
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
  window.$docsify.backToTop = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.backToTop || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    p => p.name === 'docsifyBackToTop'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    plugin.name = 'docsifyBackToTop';
    window.$docsify.plugins.unshift(plugin);
  }
})();
