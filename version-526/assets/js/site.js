
(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length > 1) {
            var index = 0;
            var show = function (next) {
                slides[index].classList.remove('is-active');
                if (dots[index]) {
                    dots[index].classList.remove('is-active');
                }
                index = next;
                slides[index].classList.add('is-active');
                if (dots[index]) {
                    dots[index].classList.add('is-active');
                }
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                });
            });
            window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        if (filterInput && filterCards.length) {
            var applyFilter = function () {
                var value = filterInput.value.trim().toLowerCase();
                filterCards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
                });
            };
            filterInput.addEventListener('input', applyFilter);
        }
    });
})();

function initPlayer(videoId, buttonId, overlayId, sourceUrl) {
    var start = function () {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        if (!video || !sourceUrl) {
            return;
        }
        var started = false;
        var load = function () {
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                load();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', load);
        }
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                load();
            }
        });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
}
