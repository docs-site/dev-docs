
/**
 * @brief docsify复制代码插件主函数
 * @description 为代码块添加复制按钮并处理复制逻辑
 * @param {Function} hook - docsify生命周期钩子
 * @param {Object} vm - docsify实例
 */
function docsifyCopyCode(hook, vm) {
  /** 
   * @brief 国际化文本配置
   * @description 默认的按钮和状态提示文本，可通过配置覆盖
   */
  const i18n = {
    buttonText: 'Copy to clipboard',
    errorText: 'Error',
    successText: 'Copied',
  };

  /**
   * @brief 页面渲染完成后执行
   * @description 在每个页面渲染完成后，为代码块添加复制按钮
   */
  hook.doneEach(function () {
    const targetElms = Array.from(document.querySelectorAll('pre[data-lang]'));

    // Update i18n strings based on options and location.href
    if (vm.config.copyCode) {
      Object.keys(i18n).forEach((key) => {
        const textValue = vm.config.copyCode[key];

        if (typeof textValue === 'string') {
          i18n[key] = textValue;
        } else if (typeof textValue === 'object') {
          Object.keys(textValue).some((match) => {
            const isMatch = location.href.indexOf(match) > -1;

            i18n[key] = isMatch ? textValue[match] : i18n[key];

            return isMatch;
          });
        }
      });
    }

    const template = [
      '<button class="docsify-copy-code-button">',
      `<span class="label">${i18n.buttonText}</span>`,
      `<span class="error" aria-hidden="hidden">${i18n.errorText}</span>`,
      `<span class="success" aria-hidden="hidden">${i18n.successText}</span>`,
      '<span aria-live="polite"></span>',
      '</button>',
    ].join('');

    targetElms.forEach((elm) => {
      elm.insertAdjacentHTML('beforeend', template);
    });
  });

  /**
   * @brief 插件挂载时执行
   * @description 设置复制按钮的点击事件监听器
   */
  hook.mounted(function () {
    const listenerHost = document.querySelector('.content');

    if (listenerHost) {
      listenerHost.addEventListener('click', function (evt) {
        const isCopyCodeButton = evt.target.classList.contains(
          'docsify-copy-code-button'
        );

        if (isCopyCodeButton) {
          const buttonElm =
            evt.target.tagName === 'BUTTON'
              ? evt.target
              : evt.target.parentNode;
          const range = document.createRange();
          const preElm = buttonElm.parentNode;
          const codeElm = preElm.querySelector('code');
          const liveRegionElm = buttonElm.querySelector('[aria-live]');

          let selection = window.getSelection();

          range.selectNode(codeElm);

          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }

          try {
            // Copy selected text
            const successful = document.execCommand('copy');

            if (successful) {
              buttonElm.classList.add('success');
              liveRegionElm.innerText = i18n.successText;

              setTimeout(function () {
                buttonElm.classList.remove('success');
                liveRegionElm.innerText = '';
              }, 1000);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`docsify-copy-code: ${err}`);

            buttonElm.classList.add('error');
            liveRegionElm.innerText = i18n.errorText;

            setTimeout(function () {
              buttonElm.classList.remove('error');
              liveRegionElm.innerText = '';
            }, 1000);
          }

          selection = window.getSelection();

          if (selection) {
            if (typeof selection.removeRange === 'function') {
              selection.removeRange(range);
            } else if (typeof selection.removeAllRanges === 'function') {
              selection.removeAllRanges();
            }
          }
        }
      });
    }
  });
}

/**
 * @brief v1.x版本样式表弃用警告
 * @description 若js文件已引入则，提示用户不再需要手动引入样式表
 */
// Deprecation warning for v1.x: stylesheet
// if (document.querySelector('link[href*="docsify-copy-code"]')) {
//   // eslint-disable-next-line no-console
//   console.warn(
//     '[Deprecation] Link to external docsify-copy-code stylesheet is no longer necessary.'
//   );
// }

/**
 * @brief v1.x版本初始化方法弃用警告
 * @description 保留旧版API兼容性，提示用户新的使用方式
 */
// Deprecation warning for v1.x: init()
window.DocsifyCopyCodePlugin = {
  init: function () {
    return function (hook, vm) {
      hook.ready(function () {
        // eslint-disable-next-line no-console
        console.warn(
          '[Deprecation] Manually initializing docsify-copy-code using window.DocsifyCopyCodePlugin.init() is no longer necessary.'
        );
      });
    };
  },
};

window.$docsify = window.$docsify || {};
window.$docsify.plugins = [docsifyCopyCode].concat(
  window.$docsify.plugins || []
);
