(function () {
    function toggleMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var section = panel.closest('section') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
            var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
            var activeValue = '';
            var empty = document.createElement('div');
            empty.className = 'no-results';
            empty.textContent = '没有找到匹配的影片';

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-year') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesValue = !activeValue || haystack.indexOf(activeValue.toLowerCase()) !== -1;
                    var ok = matchesQuery && matchesValue;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                var grid = section.querySelector('.movie-grid');
                if (grid) {
                    if (visible === 0) {
                        if (!empty.parentNode) {
                            grid.appendChild(empty);
                        }
                    } else if (empty.parentNode) {
                        empty.parentNode.removeChild(empty);
                    }
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeValue = button.getAttribute('data-filter-value') || '';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayer(streamUrl) {
        var video = document.getElementById('movie-player');
        var start = document.getElementById('player-start');
        var loading = document.getElementById('player-loading');
        var message = document.getElementById('player-message');
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function setLoading(isLoading) {
            if (loading) {
                loading.classList.toggle('hidden', !isLoading);
            }
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.hidden = false;
            }
            setLoading(false);
        }

        function loadStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            setLoading(true);
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    setLoading(false);
                }, { once: true });
                video.addEventListener('error', function () {
                    showMessage('播放暂时不可用，请稍后重试');
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setLoading(false);
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('播放暂时不可用，请稍后重试');
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                    }
                });
            } else {
                showMessage('播放暂时不可用，请稍后重试');
            }
        }

        function playVideo() {
            loadStream();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (start) {
                        start.classList.remove('hidden');
                    }
                });
            }
        }

        if (start) {
            start.addEventListener('click', function () {
                start.classList.add('hidden');
                playVideo();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                if (start) {
                    start.classList.add('hidden');
                }
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (start) {
                start.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && start) {
                start.classList.remove('hidden');
            }
        });
        loadStream();
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
