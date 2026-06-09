(function () {
  function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var activeIndex = 0;
    var activate = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate(activeIndex + 1);
    }, 5600);
  }

  var sortableGrid = document.querySelector('[data-sortable-grid]');
  var sortSelect = document.querySelector('[data-sort-select]');
  if (sortableGrid && sortSelect) {
    sortSelect.addEventListener('change', function () {
      var cards = Array.prototype.slice.call(sortableGrid.querySelectorAll('.movie-card'));
      var mode = sortSelect.value;
      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      cards.forEach(function (card) {
        sortableGrid.appendChild(card);
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var searchGrid = document.querySelector('[data-search-grid]');
  var noResults = document.querySelector('[data-no-results]');
  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      searchInput.value = query;
    }
    var filterCards = function () {
      var keyword = normalizeText(searchInput.value);
      var type = filterSelect ? filterSelect.value : '';
      var shown = 0;
      Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card')).forEach(function (card) {
        var text = normalizeText(card.dataset.search || '');
        var cardType = card.dataset.group || '';
        var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
        var hitType = !type || cardType === type;
        var visible = hitKeyword && hitType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle('is-visible', shown === 0);
      }
    };
    searchInput.addEventListener('input', filterCards);
    if (filterSelect) {
      filterSelect.addEventListener('change', filterCards);
    }
    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('.player-trigger');
    var url = box.getAttribute('data-video');
    var hlsInstance = null;
    if (!video || !url) {
      return;
    }
    var playVideo = function () {
      box.classList.add('is-playing');
      if (box.getAttribute('data-ready') === '1') {
        video.play().catch(function () {});
        return;
      }
      box.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    };
    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
