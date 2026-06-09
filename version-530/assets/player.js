(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var hls = null;

    if (!video || !button) {
      return;
    }

    function attachSource() {
      var source = video.getAttribute('data-src');

      if (!source || video.getAttribute('data-ready') === '1') {
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      attachSource();
      player.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
