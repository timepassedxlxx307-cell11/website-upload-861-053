(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var shell = document.querySelector("[data-player-shell]");
    var video = document.getElementById("movie-player");
    var start = document.querySelector("[data-player-action='play']");
    var configNode = document.getElementById("player-config");
    if (!shell || !video || !start || !configNode) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }
    var playbackUrl = config.src || "";
    var hls = null;
    var attached = false;

    function attachMedia() {
      if (attached || !playbackUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = playbackUrl;
    }

    function startPlay() {
      attachMedia();
      shell.classList.add("player-ready");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("player-ready");
        });
      }
    }

    start.addEventListener("click", startPlay);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        startPlay();
      }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && hls && video.paused) {
        hls.stopLoad();
      } else if (!document.hidden && hls && attached) {
        hls.startLoad();
      }
    });
  });
})();
