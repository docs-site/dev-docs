'use strict';

const exports = {};

const hasWindow = typeof window !== 'undefined';

/**
 * 面包屑导航配置选项
 * @type {Object}
 * @property {boolean} showHome - 是否显示首页链接，默认false
 * @property {string} homeText - 首页链接显示文本，默认'Home'
 * @property {string} separator - 面包屑分隔符，默认' &rsaquo; ' (右箭头)
 * @property {string} casing - 文本大小写转换，可选值: 
 *                             'capitalize'(首字母大写)|'uppercase'(全大写)|'lowercase'(全小写)|'none'(不转换)
 * @property {string} linkColor - 链接颜色，默认使用主题色或绿色(#42b983)
 * @property {string} size - 面包屑尺寸，可选'small'(小)|'medium'(中)|'large'(大)
 */
const options = {
  showHome: false,
  homeText: 'Home',
  separator: ' &rsaquo; ',
  casing: 'capitalize',
  linkColor: 'var(--theme-color, #42b983)',
  size: 'small',
  ...(hasWindow && window.$docsify?.breadcrumb ? window.$docsify.breadcrumb : {})
};

/**
 * 主插件函数，处理面包屑导航生成
 * @param {Function} hook - Docsify生命周期钩子
 * @param {Object} vm - Docsify实例
 */
function breadcrumbPlugin(hook, vm) {
  hook.afterEach(function (html, next) {
    try {
      if (!vm?.route?.path) {
        throw new Error('Invalid route object');
      }

      const url = vm.route.path;
      const isHome = url.length < 2;
      const title = getPageTitle(vm.route);

      const urlParts = getUrlParts(url);
      const readableUrlParts = sanitizeUrlParts(urlParts);
      const homeLink = options.showHome || !isHome ? getHomeLink(isHome) : '';

      const ul = generateAccessibleBreadcrumb(homeLink, getListItems(readableUrlParts, urlParts, title));

      next(ul + html);
    } catch (err) {
      console.error('[docsify-breadcrumb] Error:', err);
      next(html); // 出错时继续渲染原始内容
    }
  });
}

/**
 * 解码URL编码的文件名
 * @param {string} filename - 需要解码的文件名
 * @returns {string} 解码后的文件名，解码失败返回原文件名
 */
function decodeFilename(filename) {
  try {
    return decodeURIComponent(filename);
  } catch (e) {
    return filename;
  }
}

/**
 * 获取页面标题
 * @param {Object} route - Docsify路由对象
 * @returns {string} 处理后的页面标题
 */
function getPageTitle(route) {
  if (!route?.file) return 'Untitled';

  let filename = decodeFilename(route.file.split('/').pop() || 'Untitled');
  const baseName = filename.replace(/\.md$/i, '');

  return baseName
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Untitled';
}

/**
 * 解析URL路径为数组
 * @param {string} url - 当前页面URL
 * @returns {Array<string>} 过滤后的URL路径部分数组
 * @throws {URIError} 当URL解码失败时抛出
 */
function getUrlParts(url) {
  try {
    return decodeURI(url).split('/').filter(str => ['#', '', 'README'].indexOf(str) === -1);
  } catch (e) {
    console.error('[docsify-breadcrumb] URL decode error:', e);
    return [];
  }
}

/**
 * 清理URL路径部分，替换分隔符为空格
 * @param {Array} urlParts - URL路径部分数组
 * @returns {Array} 处理后的路径部分数组
 */
function sanitizeUrlParts(urlParts) {
  return urlParts.map(part => part.replace(/[._-]/g, ' '));
}

/**
 * 生成面包屑导航列表项HTML
 * @param {Array<string>} readableUrlParts - 可读的URL路径部分
 * @param {Array<string>} urlParts - 原始URL路径部分
 * @param {string} title - 当前页面标题
 * @returns {string} 生成的列表项HTML字符串
 */
function getListItems(readableUrlParts, urlParts, title) {
  return readableUrlParts.reduce((acc, part, i) => {
    const link = getItemLink(urlParts, i + 1);
    const isLastLink = i === readableUrlParts.length - 1;

    // 转义HTML特殊字符防止XSS
    const escapedPart = part.replace(/[&<>'"]/g,
      char => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[char]);
    const escapedTitle = title.replace(/[&<>'"]/g,
      char => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[char]);

    const itemDom = !isLastLink
      ? `<li><a href="${link}" style="color: ${options.linkColor}">${escapedPart}</a>${options.separator}</li>`
      : `<li class="active" aria-current="page">${escapedTitle}</li>`;

    return acc + itemDom;
  }, '');
}

/**
 * 生成面包屑导航项的链接
 * @param {Array<string>} urlParts - URL路径部分数组
 * @param {number} end - 结束索引
 * @returns {string} 生成的链接
 */
function getItemLink(urlParts, end) {
  return `#/${urlParts.slice(0, end).join('/')}/`;
}

/**
 * 生成首页链接HTML
 * @param {boolean} isHome - 当前是否是首页
 * @returns {string} 首页链接HTML
 */
function getHomeLink(isHome) {
  const color = isHome ? 'inherit' : options.linkColor;
  const fontWeight = isHome ? `font-weight:inherit;` : '';
  const separator = isHome ? '' : options.separator;
  const escapedHomeText = options.homeText.replace(/[&<>'"]/g,
    char => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[char]);

  return `<li><a href="#/" style="color: ${color}; ${fontWeight}">${escapedHomeText}</a>${separator}</li>`;
}

/**
 * 生成完整的可访问面包屑导航HTML
 * @param {string} homeLink - 首页链接HTML
 * @param {string} list - 列表项HTML
 * @returns {string} 完整的面包屑导航HTML
 */
function generateAccessibleBreadcrumb(homeLink, list) {
  return `
      <nav aria-label="Breadcrumb" class="breadcrumb">
        <ol
          class="breadcrumb--${options.size}"
          style="text-transform:${options.casing}"
        >
          ${homeLink}
          ${list}
        </ol>
      </nav>
    `;
}

if (hasWindow) {
  window.$docsify = window.$docsify || {};
  window.$docsify.breadcrumb = options;
  window.$docsify.plugins = [].concat(breadcrumbPlugin, window.$docsify.plugins || []);
}

// 导出到全局对象
if (typeof window !== 'undefined') {
  window.docsifyBreadcrumb = {
    breadcrumbPlugin,
    options
  };
}
