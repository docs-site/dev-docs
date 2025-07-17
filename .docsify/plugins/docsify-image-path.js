/**
 * docsify插件 - 图片路径转换
 * 将Markdown中的相对图片路径转换为绝对路径
 */
(function () {
  const install = function (hook, vm) {
    hook.beforeEach(function (content) {
      // 处理所有相对路径图片
      return content.replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g,
        (match, src, alt) => {
          // 跳过绝对路径和http/https路径
          if (src.startsWith('http') || src.startsWith('/')) {
            return match
          }

          // 处理相对路径
          const relativePath = src.startsWith('./') ? src.substring(2) : src
          const currentPath = vm.route.path
          const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
          let absolutePath = currentDir.startsWith('/')
            ? `${currentDir}${relativePath}`
            : `/${currentDir}${relativePath}`
          
          // 自动区分环境
          const isProduction = window.location.hostname !== 'localhost' && 
                             window.location.hostname !== '127.0.0.1'
          
          // 生产环境且配置了basePath时添加前缀
          if (isProduction && vm.config.imagePath?.basePath) {
            absolutePath = `${vm.config.imagePath.basePath}${absolutePath}`
          }
          return `<img src="${absolutePath}" alt="${alt}" />`
        })
    })

    hook.doneEach(function () {
      // 处理所有相对路径图片
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src')
        // 跳过绝对路径和http/https路径
        if (!src || src.startsWith('http') || src.startsWith('/')) return

        // 处理相对路径
        const relativePath = src.startsWith('./') ? src.substring(2) : src
        const currentPath = vm.route.path
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
        let absolutePath = currentDir.startsWith('/')
          ? `${currentDir}${relativePath}`
          : `/${currentDir}${relativePath}`
        
        // 自动区分环境
        const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1'
        
        // 生产环境且配置了basePath时添加前缀
        if (isProduction && vm.config.imagePath?.basePath) {
          absolutePath = `${vm.config.imagePath.basePath}${absolutePath}`
        }
        img.setAttribute('src', absolutePath)
      })
    })
  }

  // 注册插件
  window.$docsify = window.$docsify || {}
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], install)
})()
