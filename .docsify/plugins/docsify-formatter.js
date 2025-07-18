/**
 * @file docsify-formatter.js
 * @brief 将YAML front matter转换为Markdown代码块的Docsify插件
 * @license MIT
 */

/**
 * @brief 主插件函数
 * @description 将Markdown文件开头的YAML front matter(---标记之间的内容)
 * 转换为Markdown代码块以便在Docsify中正确渲染
 * 
 * 功能特点:
 * - 处理UTF-8 BOM头
 * - 支持Windows(CRLF)和Unix(LF)换行符
 * - 保留原始内容格式
 * - 优雅处理没有front matter的文件
 * 
 * @param {object} hook - Docsify钩子对象
 * @param {object} vm - Docsify VM实例
 */
window.$docsify = window.$docsify || {};
window.$docsify.plugins = (window.$docsify.plugins || []).concat(function(hook, vm) {
  
  /**
   * @brief BeforeEach钩子处理函数
   * @description 在Docsify渲染前处理内容
   * @param {string} content - 原始Markdown内容
   * @return {string} 处理后的Markdown内容
   */
  hook.beforeEach(function(content) {
    if (!content || typeof content !== 'string') {
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
        const formattedContent = `\`\`\`yaml\n${yamlContent}\n\`\`\`\n`;
        return content.replace(frontMatterPattern, formattedContent);
      } catch (e) {
        console.warn('[docsify-formatter] Error processing front matter:', e);
        return content;
      }
    }
    
    return content;
  });
});
