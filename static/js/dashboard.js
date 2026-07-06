/* ============================================================
   dashboard.js — reloj del top-bar, escalado del stage y boot.
   ============================================================ */
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }

  function fitStage() {
    var stage = document.querySelector(".stage");
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }

  // resize acotado a 1 frame: evita recalcular escala en cada evento (dropframe)
  var rafId = null;
  function onResize() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () { rafId = null; fitStage(); });
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
    setInterval(tickClock, 1000);   // reloj: 1s (barato, solo 2 textos)

    fitStage();
    window.addEventListener("resize", onResize);
  });
})();