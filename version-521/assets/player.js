(function () {
  function playVideo(video, overlay) {
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      var nativePlay = video.play();
      if (nativePlay && typeof nativePlay.catch === 'function') {
        nativePlay.catch(function () {});
      }
      return;
    }
    if (window.Hls) {
      if (!video._hlsReady) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          var hlsPlay = video.play();
          if (hlsPlay && typeof hlsPlay.catch === 'function') {
            hlsPlay.catch(function () {});
          }
        });
        video._hlsReady = true;
      } else {
        var resumePlay = video.play();
        if (resumePlay && typeof resumePlay.catch === 'function') {
          resumePlay.catch(function () {});
        }
      }
      return;
    }
    if (!video.src) {
      video.src = stream;
    }
    var fallbackPlay = video.play();
    if (fallbackPlay && typeof fallbackPlay.catch === 'function') {
      fallbackPlay.catch(function () {});
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('.movie-video');
    var overlay = shell.querySelector('.play-cover');
    if (!video) {
      return;
    }
    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(video, overlay);
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo(video, overlay);
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setupPlayer);
  });
})();
