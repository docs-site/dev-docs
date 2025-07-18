(function() {
  const install = function(hook, vm) {
    // Create button element
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.title = 'Back to top';
    backToTopBtn.innerHTML = '';
    document.body.appendChild(backToTopBtn);

    // Scroll event listener
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    // Click event
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  // Add to docsify plugins
  window.$docsify = window.$docsify || {};
  $docsify.plugins = [].concat($docsify.plugins || [], install);
})();
