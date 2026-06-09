function initializePlayer(videoUrl) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.getElementById("playOverlay");
  var attached = false;
  var hls = null;

  if (!video) return;

  function attach() {
    if (attached) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
    attached = true;
  }

  function start() {
    attach();
    if (overlay) overlay.classList.add("is-hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) overlay.classList.remove("is-hidden");
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) start();
  });

  video.addEventListener("play", function () {
    if (overlay) overlay.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) overlay.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
