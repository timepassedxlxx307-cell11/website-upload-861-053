(function () {
  function toggleMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden");
      if (isOpen) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initLocalFilter() {
    var input = document.querySelector(".page-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".category-list .movie-card"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-filter") || "";
        card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector(".movie-video[data-video]");
    var cover = document.querySelector(".player-cover");
    if (!video) {
      return;
    }
    var url = video.getAttribute("data-video");
    var ready = false;
    function attach() {
      if (ready || !url) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    attach();
    if (cover) {
      cover.addEventListener("click", function () {
        attach();
        cover.classList.add("is-hidden");
        video.play().catch(function () {});
      });
    }
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
        video.play().catch(function () {});
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card compact" data-filter="',
      escapeHtml([movie.title, movie.region, movie.type, movie.genre, movie.year, movie.tags].join(" ").toLowerCase()),
      '">',
      '<a class="poster" href="',
      escapeHtml(movie.url),
      '" aria-label="',
      escapeHtml(movie.title),
      '">',
      '<img src="',
      escapeHtml(movie.cover),
      '" alt="',
      escapeHtml(movie.title),
      '" loading="lazy">',
      '<span class="poster-year">',
      escapeHtml(movie.year),
      '</span></a><div class="card-content"><h2><a href="',
      escapeHtml(movie.url),
      '">',
      escapeHtml(movie.title),
      '</a></h2><p class="movie-meta">',
      escapeHtml(movie.region),
      ' · ',
      escapeHtml(movie.type),
      ' · ',
      escapeHtml(movie.genre),
      '</p><p class="movie-desc">',
      escapeHtml(movie.oneLine),
      '</p></div></article>'
    ].join("");
  }

  function initSearchPage() {
    var container = document.getElementById("searchResults");
    var intro = document.getElementById("searchIntro");
    var input = document.getElementById("searchInput");
    if (!container || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.tags, movie.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);
    if (intro) {
      intro.textContent = results.length ? "搜索结果" : "未找到匹配影片";
    }
    container.innerHTML = results.map(renderSearchCard).join("");
    var defaults = document.querySelector(".search-default");
    if (defaults && results.length) {
      defaults.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileMenu();
    initHero();
    initLocalFilter();
    setupPlayer();
    initSearchPage();
  });
})();
