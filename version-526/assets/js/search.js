
(function () {
    function renderSearch() {
        var form = document.querySelector('[data-search-page-form]');
        var input = document.querySelector('[data-search-page-input]');
        var results = document.querySelector('[data-search-results]');
        if (!form || !input || !results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        var createCard = function (item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="' + item.url + '" data-title="' + escapeHtml(item.title) + '">' +
                '<div class="movie-poster"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="movie-year">' + escapeHtml(item.year) + '</span></div>' +
                '<div class="movie-info"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '<div class="tag-list">' + tags + '</div></div></a>';
        };
        var search = function () {
            var value = input.value.trim().toLowerCase();
            var list = window.SEARCH_INDEX.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
                return !value || haystack.indexOf(value) !== -1;
            }).slice(0, 96);
            results.innerHTML = list.map(createCard).join('');
        };
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            search();
            var q = input.value.trim();
            var url = q ? './search.html?q=' + encodeURIComponent(q) : './search.html';
            history.replaceState(null, '', url);
        });
        input.addEventListener('input', search);
        search();
    }
    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSearch);
    } else {
        renderSearch();
    }
})();
