/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-hide-code.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: A docsify plugin that hide code.
 *              https://github.com/jl15988/docsify-hide-code
 * ======================================================
 */

// 默认配置选项
var defaultOptions = {
  height: 200,       // 代码块最大高度(px)
  scroll: false,     // 是否允许滚动
  enabled: true      // 是否启用插件
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
function docsifyHideCode(hook, vm) {
  /**
   * @brief 获取当前配置
   * @description 合并默认配置和用户配置
   * @return {object} 合并后的配置对象
   */
  function getConfig() {
    return Object.assign(
      {},
      defaultOptions,
      window.$docsify.hideCode,
      vm.config.hideCode
    );
  }

  /**
   * @brief 页面渲染完成后钩子
   * @description 为符合条件的代码块添加折叠功能
   */
  hook.doneEach(function () {
    const config = getConfig();
    if (!config.enabled) return;

    const targetElms = Array.from(document.querySelectorAll("pre[data-lang]"));
    const template = [
      '<div class="hide-code-mask">',
      '<div class="hide-code-mask-btn">',
      '</div>',
      '</div>'
    ].join("");

    targetElms.forEach(function (elm) {
      if (!config.scroll && config.height < elm.offsetHeight) {
        elm.classList.add('hide-code');
      }
      elm.style.maxHeight = config.height + 'px';
      if (!elm.querySelector('.hide-code-mask')) {
        elm.insertAdjacentHTML("beforeend", template);
      }
    });
  });

  /**
   * @brief 插件挂载钩子
   * @description 处理折叠按钮点击事件
   */
  hook.mounted(function () {
    const config = getConfig();
    if (!config.enabled) return;

    const listenerHost = document.querySelector(".content");
    if (!listenerHost) return;

    listenerHost.addEventListener("click", function (evt) {
      const isButton = evt.target.classList.contains("hide-code-mask-btn") ||
        evt.target.closest(".hide-code-mask-btn");
      if (!isButton) return;

      const buttonElm = evt.target.classList.contains("hide-code-mask-btn")
        ? evt.target
        : evt.target.closest(".hide-code-mask-btn");
      const preElm = buttonElm.closest("pre[data-lang]");

      if (preElm) {
        preElm.classList.remove('hide-code');
        preElm.style.maxHeight = "";
      }
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
  window.$docsify.hideCode = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.hideCode || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    plugin => plugin.name === 'docsifyHideCode'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    docsifyHideCode.name = 'docsifyHideCode';
    window.$docsify.plugins.unshift(docsifyHideCode);
  }
})();
