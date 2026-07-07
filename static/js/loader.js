/* ============================================================
   loader.js — control de la pantalla de carga (boot screen)
   Mínimo: espera a que la página cargue, deja terminar las
   animaciones de entrada del dashboard y retira el overlay.
   Sin timers repetidos ni trabajo por frame -> cero dropframes.
   ============================================================ */
(function () {
  var MIN_MS = 2400;   // tiempo mínimo visible (cubre el llenado de la barra)
  var start = performance.now();

  function hideBoot() {
    var boot = document.getElementById("boot-screen");
    if (!boot) return;
    boot.classList.add("boot-hide");
    // Retira del DOM tras el fade para no dejar una capa fija encima
    boot.addEventListener("transitionend", function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, { once: true });
  }

  function scheduleHide() {
    var elapsed = performance.now() - start;
    var wait = Math.max(0, MIN_MS - elapsed);
    setTimeout(hideBoot, wait);
  }

  if (document.readyState === "complete") {
    scheduleHide();
  } else {
    window.addEventListener("load", scheduleHide);
  }
})();
