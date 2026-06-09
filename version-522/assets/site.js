(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-menu-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = document.querySelector("[data-mobile-menu]");
        if (!panel) return;
        panel.hidden = !panel.hidden;
      });
    });

    document.querySelectorAll(".cover-shell img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });

    setupHero();
    setupPageFilters();
    setupSearchPage();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = document.querySelector("[data-hero-dots]");
    if (!slides.length || !dots) return;
    var index = 0;
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换焦点影片 " + (i + 1));
      dot.addEventListener("click", function () {
        show(i);
      });
      dots.appendChild(dot);
    });
    var dotButtons = Array.prototype.slice.call(dots.querySelectorAll("button"));

    function show(next) {
      slides[index].classList.remove("active");
      dotButtons[index].classList.remove("active");
      index = next;
      slides[index].classList.add("active");
      dotButtons[index].classList.add("active");
    }

    dotButtons[0].classList.add("active");
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function setupPageFilters() {
    var filterRoot = document.querySelector("[data-filter-page]");
    var grid = document.querySelector("[data-card-grid]");
    if (!filterRoot || !grid) return;
    var search = filterRoot.querySelector("[data-page-search]");
    var genre = filterRoot.querySelector("[data-genre-filter]");
    var year = filterRoot.querySelector("[data-year-filter]");
    var sort = filterRoot.querySelector("[data-sort-filter]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(search ? search.value : "");
      var selectedGenre = genre ? genre.value : "all";
      var selectedYear = year ? year.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedGenre = selectedGenre === "all" || card.dataset.genre === selectedGenre;
        var matchedYear = selectedYear === "all" || card.dataset.year === selectedYear;
        var show = matchedKeyword && matchedGenre && matchedYear;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
      sortCards();
    }

    function sortCards() {
      if (!sort) return;
      var mode = sort.value;
      var ordered = cards.slice();
      if (mode === "popular") {
        ordered.sort(function (a, b) { return Number(b.dataset.views) - Number(a.dataset.views); });
      }
      if (mode === "newest") {
        ordered.sort(function (a, b) { return Number(b.dataset.year) - Number(a.dataset.year); });
      }
      if (mode === "title") {
        ordered.sort(function (a, b) { return String(a.dataset.title).localeCompare(String(b.dataset.title), "zh-CN"); });
      }
      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [search, genre, year, sort].forEach(function (el) {
      if (el) el.addEventListener("input", apply);
      if (el) el.addEventListener("change", apply);
    });
    apply();
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SITE_MOVIES) return;
    var input = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) input.value = q;
    render(q);

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function render(keyword) {
      var query = normalize(keyword);
      var matches = window.SITE_MOVIES.filter(function (movie) {
        if (!query) return true;
        return normalize([
          movie.title,
          movie.description,
          movie.genre,
          movie.region,
          movie.type,
          movie.category,
          movie.tags
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(function (movie) {
        return [
          '<article class="movie-card group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">',
          '<a href="./' + movie.url + '" class="block">',
          '<div class="relative h-48 overflow-hidden cover-shell">',
          '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">',
          '<div class="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">' + escapeHtml(movie.category) + '</div>',
          '</div>',
          '<div class="p-4">',
          '<h2 class="font-bold text-lg mb-2 text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">' + escapeHtml(movie.title) + '</h2>',
          '<p class="text-gray-600 text-sm line-clamp-2 leading-relaxed">' + escapeHtml(movie.description) + '</p>',
          '<div class="mt-3 flex items-center justify-between text-xs text-gray-500"><span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '</div>',
          '</a>',
          '</article>'
        ].join("");
      }).join("");
      if (empty) empty.hidden = matches.length !== 0;
      results.querySelectorAll(".cover-shell img").forEach(function (img) {
        img.addEventListener("error", function () {
          img.classList.add("image-missing");
        });
      });
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[ch] || ch;
      });
    }
  }
})();
