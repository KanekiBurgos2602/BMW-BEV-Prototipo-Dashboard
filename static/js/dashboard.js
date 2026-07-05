/* ============================================================
   dashboard.js — top-bar clock, stage scaling and module boot.
   ============================================================ */
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }

  function fitStage() {
    var stage = document.querySelector(".stage");
    if (!stage) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(vw / 1920, vh / 1080);
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }

  function tickClock() {
    var d = new Date();
    var clockEl = document.querySelector(".clock-pill .time");
    var dateEl = document.querySelector(".topbar .date");
    if (clockEl) clockEl.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    if (dateEl) dateEl.textContent = d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  window.addEventListener("DOMContentLoaded", function () {
    window.initCalendario(document.getElementById("mod-calendario"));
    window.initHora(document.getElementById("mod-hora"));
    window.initAcceso(document.getElementById("mod-acceso"));

    tickClock();
    setInterval(tickClock, 1000);

    fitStage();
    window.addEventListener("resize", fitStage);
  });
})();
