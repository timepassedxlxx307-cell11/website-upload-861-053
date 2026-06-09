function mountMoviePlayer(videoUrl) {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-player-button]");
  if (!video || !button || !videoUrl) {
    return;
  }

  var hasLoaded = false;
  var hlsInstance = null;
  var requestedPlay = false;

  function showMessage(message) {
    button.classList.remove("is-hidden");
    button.innerHTML = '<span class="play-icon">▶</span><strong>' + message + '</strong><em>重新播放</em>';
  }

  function playVideo() {
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  function loadVideo() {
    if (hasLoaded) {
      return;
    }
    hasLoaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", function () {
        if (requestedPlay) {
          playVideo();
        }
      }, { once: true });
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requestedPlay) {
          playVideo();
        }
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("播放加载失败，请稍后重试");
        }
      });
      return;
    }
    showMessage("播放加载失败，请稍后重试");
  }

  function startPlayback() {
    requestedPlay = true;
    button.classList.add("is-hidden");
    loadVideo();
    if (video.readyState > 0 || video.src) {
      playVideo();
    }
  }

  button.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
