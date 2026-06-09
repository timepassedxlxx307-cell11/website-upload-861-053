(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function filterCards(root) {
    var queryInput = root.querySelector('.local-filter') || root.querySelector('.global-search-input');
    var yearSelect = root.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var empty = root.querySelector('.empty-result');
    function apply() {
      var query = normalize(queryInput ? queryInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    if (queryInput) {
      queryInput.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    apply();
  }

  function setupSearchQuery() {
    var input = document.getElementById('searchBox');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupSearchQuery();
    Array.prototype.slice.call(document.querySelectorAll('.searchable-list')).forEach(function (list) {
      var section = list.closest('section') || document;
      filterCards(section);
    });
  });
})();
