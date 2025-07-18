/** =====================================================
 * Copyright © hk. 2022-2025. All rights reserved.
 * File name  : docsify-image-path.js
 * Author     : 苏木
 * Date       : 2025-07-18
 * Version    : 
 * Description: 将Markdown中的相对图片路径转换为绝对路径,支持自动区分开发/生产环境
 * ======================================================
 */

// 默认配置选项
var defaultOptions = {
  basePath: '',       // 生产环境基础路径
  enabled: true       // 是否启用插件
};

/**
 * @brief 主插件函数
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify虚拟机实例
 */
function docsifyImagePath(hook, vm) {
  /**
   * @brief 获取当前配置
   * @description 合并默认配置和用户配置
   * @return {object} 合并后的配置对象
   */
  function getConfig() {
    return Object.assign(
      {},
      defaultOptions,
      window.$docsify.imagePath,
      vm.config.imagePath
    );
  }

  /**
   * @brief 转换图片路径
   * @description 将相对路径转换为绝对路径
   * @param {string} src - 原始图片路径
   * @param {string} currentPath - 当前页面路径
   * @param {object} config - 插件配置
   * @return {string} 转换后的绝对路径
   */
  function convertImagePath(src, currentPath, config) {
    // 跳过绝对路径和http/https路径
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }

    // 处理相对路径
    const relativePath = src.startsWith('./') ? src.substring(2) : src;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    let absolutePath = currentDir.startsWith('/')
      ? `${currentDir}${relativePath}`
      : `/${currentDir}${relativePath}`;

    // 自动区分环境
    const isProduction = window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    // 生产环境且配置了basePath时添加前缀
    if (isProduction && config.basePath) {
      absolutePath = `${config.basePath}${absolutePath}`;
    }
    return absolutePath;
  }

  /**
   * @brief BeforeEach钩子处理函数
   * @description 在Docsify渲染前处理内容中的图片路径
   * @param {string} content - 原始Markdown内容
   * @return {string} 处理后的Markdown内容
   */
  hook.beforeEach(function (content) {
    const config = getConfig();
    if (!config.enabled) return content;

    // 处理所有相对路径图片
    return content.replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g,
      (match, src, alt) => {
        const absolutePath = convertImagePath(src, vm.route.path, config);
        return `<img src="${absolutePath}" alt="${alt}" />`;
      });
  });

  /**
   * @brief DoneEach钩子处理函数
   * @description 在Docsify渲染后处理DOM中的图片路径
   */
  hook.doneEach(function () {
    const config = getConfig();
    if (!config.enabled) return;

    // 处理所有相对路径图片
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (!src) return;

      const absolutePath = convertImagePath(src, vm.route.path, config);
      img.setAttribute('src', absolutePath);
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
  window.$docsify.imagePath = Object.assign(
    {}, 
    defaultOptions,
    window.$docsify.imagePath || {}
  );

  // 防止重复注册
  if (!window.$docsify.plugins) {
    window.$docsify.plugins = [];
  }
  
  // 检查是否已注册
  const isRegistered = window.$docsify.plugins.some(
    p => p.name === 'docsifyImagePath'
  );
  
  if (!isRegistered) {
    // 为插件函数添加标识
    docsifyImagePath.name = 'docsifyImagePath';
    window.$docsify.plugins.unshift(docsifyImagePath);
  }
})();
