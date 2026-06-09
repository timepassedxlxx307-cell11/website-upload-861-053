(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"movie-card__poster\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-card__badge\">" + escapeHtml(movie.type) + "</span>" +
      "</a>" +
      "<div class=\"movie-card__body\">" +
      "<p class=\"movie-card__meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</p>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.description) + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("siteNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === activeSlide);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === activeSlide);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });
    startHero();

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list] .movie-card"));
    var emptyMessage = document.querySelector("[data-empty-message]");

    function applyFilters() {
      var query = filterInput ? text(filterInput.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var matched = true;
        var keywords = text(card.getAttribute("data-keywords"));
        if (query && keywords.indexOf(query) === -1) {
          matched = false;
        }
        filterSelects.forEach(function (select) {
          var key = select.getAttribute("data-card-filter");
          var selected = select.value;
          if (selected && card.getAttribute("data-" + key) !== selected) {
            matched = false;
          }
        });
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (emptyMessage) {
        emptyMessage.classList.toggle("is-visible", visible === 0);
      }
    }

    if (filterInput || filterSelects.length) {
      if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
      }
      filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      applyFilters();
    }

    var searchResults = document.getElementById("searchResults");
    var searchInput = document.querySelector("[data-site-search-input]");
    if (searchResults && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      if (searchInput) {
        searchInput.value = queryValue;
      }
      var source = text(queryValue.trim());
      var list = window.SEARCH_MOVIES;
      var results = source ? list.filter(function (movie) {
        return text(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags.join(" ") + " " + movie.description).indexOf(source) !== -1;
      }).slice(0, 96) : list.slice(0, 48);
      if (results.length) {
        searchResults.innerHTML = results.map(createSearchCard).join("");
        var fallback = document.querySelector(".search-fallback");
        if (fallback) {
          fallback.classList.add("is-hidden");
        }
      } else {
        searchResults.innerHTML = "<p class=\"empty-message is-visible\">没有找到匹配内容</p>";
      }
    }
  });
}());
