(function () {
  window.initMoviePlayer = function (src) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("startPlayer");
    var loaded = false;
    var hls = null;

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      hideButton();
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    function loadVideo() {
      if (!video || !src) {
        return;
      }
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(src);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        window.setTimeout(playVideo, 300);
        return;
      }
      video.src = src;
      playVideo();
    }

    if (button) {
      button.addEventListener("click", loadVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          loadVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
}());
