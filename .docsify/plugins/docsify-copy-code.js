/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-copy-code.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: A docsify plugin that copies Markdown code block to your clipboard.
 *              https://github.com/jperasmus/docsify-copy-code
 * ======================================================
 */

// 默认配置选项
var defaultOptions = {
  buttonText: 'Copy to clipboard',  // 按钮文本
  errorText: 'Error',               // 复制失败提示
  successText: 'Copied'             // 复制成功提示
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
function docsifyCopyCode(hook, vm) {
  /**
   * @brief 获取当前配置
   * @description 合并默认配置和用户配置
   */
  function getCurrentConfig() {
    return Object.assign(
      {},
      defaultOptions,
      window.$docsify.copyCode,
      vm.config.copyCode
    );
  }

  /**
   * @brief 页面渲染完成后钩子
   * @description 为每个代码块添加复制按钮
   */
  hook.doneEach(function () {
    const config = getCurrentConfig();

    // 创建复制按钮模板
    const template = [
      '<button class="docsify-copy-code-button">',
      `<span class="label">${config.buttonText}</span>`,
      `<span class="error" aria-hidden="hidden">${config.errorText}</span>`,
      `<span class="success" aria-hidden="hidden">${config.successText}</span>`,
      '<span aria-live="polite"></span>',
      '</button>',
    ].join('');

    // 为每个代码块添加按钮
    Array.from(document.querySelectorAll('pre[data-lang]')).forEach((elm) => {
      if (!elm.querySelector('.docsify-copy-code-button')) {
        elm.insertAdjacentHTML('beforeend', template);
      }
    });
  });

  /**
   * @brief 插件挂载钩子
   * @description 设置复制按钮点击事件
   */
  hook.mounted(function () {
    const listenerHost = document.querySelector('.content');
    if (!listenerHost) return;

    listenerHost.addEventListener('click', function (evt) {
      const isCopyCodeButton = evt.target.classList.contains('docsify-copy-code-button') ||
        evt.target.closest('.docsify-copy-code-button');
      if (!isCopyCodeButton) return;

      const buttonElm = evt.target.classList.contains('docsify-copy-code-button')
        ? evt.target
        : evt.target.closest('.docsify-copy-code-button');
      const preElm = buttonElm.parentNode;
      const codeElm = preElm.querySelector('code');
      const liveRegionElm = buttonElm.querySelector('[aria-live]');
      const config = getCurrentConfig();

      // 创建选择范围
      const range = document.createRange();
      range.selectNode(codeElm);

      // 执行复制操作
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const successful = document.execCommand('copy');
        if (successful) {
          buttonElm.classList.add('success');
          liveRegionElm.innerText = config.successText;
          setTimeout(() => {
            buttonElm.classList.remove('success');
            liveRegionElm.innerText = '';
          }, 1000);
        }
      } catch (err) {
        console.error(`docsify-copy-code: ${err}`);
        buttonElm.classList.add('error');
        liveRegionElm.innerText = config.errorText;
        setTimeout(() => {
          buttonElm.classList.remove('error');
          liveRegionElm.innerText = '';
        }, 1000);
      } finally {
        const selection = window.getSelection();
        if (selection) {
          if (typeof selection.removeRange === 'function') {
            selection.removeRange(range);
          } else {
            selection.removeAllRanges();
          }
        }
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
  window.$docsify.copyCode = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.copyCode || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    p => p.name === 'docsifyCopyCode'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    docsifyCopyCode.name = 'docsifyCopyCode';
    window.$docsify.plugins.unshift(docsifyCopyCode);
  }
})();

// 兼容旧版API
window.DocsifyCopyCodePlugin = {
  init: function () {
    return function (hook, vm) {
      hook.ready(function () {
        console.warn(
          '[Deprecation] Manually initializing docsify-copy-code is no longer necessary.'
        );
      });
    };
  },
};
