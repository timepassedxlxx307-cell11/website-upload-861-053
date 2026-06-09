(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-nav-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      showSlide(0);
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var keyword = document.querySelector("[data-filter-keyword]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var noResults = document.querySelector("[data-no-results]");

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      var value = parseInt(cardYear, 10);
      if (selected === "2020") {
        return value >= 2020 && value < 2030;
      }
      if (selected === "2010") {
        return value >= 2010 && value < 2020;
      }
      if (selected === "2000") {
        return value < 2010;
      }
      return String(cardYear) === selected;
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedType && (card.dataset.type || "").indexOf(selectedType) === -1) {
          ok = false;
        }
        if (!matchYear(card.dataset.year || "", selectedYear)) {
          ok = false;
        }
        if (selectedRegion && (card.dataset.region || "").toLowerCase().indexOf(selectedRegion) === -1) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.style.display = visible ? "none" : "block";
      }
    }

    [keyword, type, year, region].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && keyword) {
      keyword.value = q;
      filterCards();
    }
  });
})();
