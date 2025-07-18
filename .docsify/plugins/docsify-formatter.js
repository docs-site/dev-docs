/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-formatter.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: 将YAML front matter转换为Markdown代码块的Docsify插件
 * ======================================================
 */

// 默认配置选项
var defaultOptions = {
  enabled: true,          // 是否启用插件
  language: 'yaml',       // 代码块语言标识
  showWarnings: true      // 是否显示警告信息
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
function docsifyFormatter(hook, vm) {
  /**
   * @brief 获取当前配置
   * @description 合并默认配置和用户配置
   * @return {object} 合并后的配置对象
   */
  function getConfig() {
    return Object.assign(
      {},
      defaultOptions,
      window.$docsify.formatter
    );
  }

  /**
   * @brief BeforeEach钩子处理函数
   * @description 在Docsify渲染前处理内容
   * @param {string} content - 原始Markdown内容
   * @return {string} 处理后的Markdown内容
   */
  hook.beforeEach(function (content) {
    const config = getConfig();
    if (!config.enabled || !content || typeof content !== 'string') {
      return content;
    }

    /**
     * @brief 匹配YAML front matter的正则表达式
     * @description 匹配:
     * 1. 可选的UTF-8 BOM头(\uFEFF)
     * 2. 开头的---标记
     * 3. 内容(包括换行)
     * 4. 结尾的---标记
     * 
     * 支持CRLF和LF两种换行符
     */
    const frontMatterPattern = /^(\uFEFF)?---\r?\n([\s\S]+?)\r?\n---\r?\n/;
    const match = content.match(frontMatterPattern);

    if (match) {
      try {
        const yamlContent = match[2];
        const formattedContent = `\`\`\`${config.language}\n${yamlContent}\n\`\`\`\n`;
        return content.replace(frontMatterPattern, formattedContent);
      } catch (e) {
        if (config.showWarnings) {
          console.warn('[docsify-formatter] Error processing front matter:', e);
        }
        return content;
      }
    }

    return content;
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
  window.$docsify.formatter = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.formatter || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    p => p.name === 'docsifyFormatter'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    docsifyFormatter.name = 'docsifyFormatter';
    window.$docsify.plugins.unshift(docsifyFormatter);
  }
})();
