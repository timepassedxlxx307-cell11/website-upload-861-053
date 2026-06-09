(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function createResultItem(item) {
    var link = document.createElement("a");
    link.className = "search-result-item";
    link.href = item.url;

    var image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";

    var body = document.createElement("span");
    var title = document.createElement("strong");
    var meta = document.createElement("em");
    title.textContent = item.title;
    meta.textContent = item.region + " · " + item.type + " · " + item.year + " · " + item.category;
    body.appendChild(title);
    body.appendChild(meta);

    var action = document.createElement("span");
    action.className = "primary-button";
    action.textContent = "查看详情";

    link.appendChild(image);
    link.appendChild(body);
    link.appendChild(action);
    return link;
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-search-box]");
    var box = document.querySelector("[data-search-results]");
    var index = window.movieSearchIndex || [];
    if (!input || !box || !index.length) {
      return;
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      box.innerHTML = "";
      if (!keyword) {
        return;
      }
      var results = index.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 12);
      if (!results.length) {
        var empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent = "暂未找到匹配影片";
        box.appendChild(empty);
        return;
      }
      results.forEach(function (item) {
        box.appendChild(createResultItem(item));
      });
    }

    input.addEventListener("input", render);
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-local-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.classList.toggle("is-hidden-card", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilter();
  });
})();
