/* ============================================================
   acceso.js — LÓGICA solamente. El HTML vive en
   template/partials/acceso.html. Rellena el grid con tacómetros
   y gestiona el overlay de detalle.
   ============================================================ */
(function () {
  function operators() {
    return [
      { opName: "Alejandro Ramírez Núñez", opNum: "OP 482", station: "EST-04", value: 88, leader: true },
      { opName: "Mariana Torres",          opNum: "OP 137", station: "EST-01", value: 76 },
      { opName: "Luis Fernando Gómez",     opNum: "OP 305", station: "EST-02", value: 81 },
      { opName: "Sofía Herrera",           opNum: "OP 219", station: "EST-03", value: 69 },
      { opName: "Diego Castillo",          opNum: "OP 664", station: "EST-05", value: 84 },
      { opName: "Valeria Mendoza",         opNum: "OP 058", station: "EST-06", value: 72 },
      { opName: "Carlos Jiménez",          opNum: "OP 471", station: "EST-07", value: 90 },
      { opName: "Ana Lucía Rivas",         opNum: "OP 326", station: "EST-08", value: 65 },
      { opName: "Roberto Salazar",         opNum: "OP 592", station: "EST-02", value: 78 },
      { opName: "Fernanda Ortiz",          opNum: "OP 143", station: "EST-05", value: 83 },
    ].map(function (o) {
      return Object.assign({}, o, { isLeader: !!o.leader, role: o.leader ? "TEAM LEADER" : "COLABORADOR" });
    });
  }

  function clone(id) { return document.getElementById(id).content.firstElementChild.cloneNode(true); }

  window.initAcceso = function (root) {
    var ops = operators();
    var grid = root.querySelector(".acc-grid");
    var panel = root.querySelector(".acc-panel");
    root.querySelector(".count-n").textContent = ops.length;

    ops.forEach(function (o) {
      var cell = clone("tpl-acc-cell");
      cell.appendChild(window.buildTacometro({
        isLeader: o.isLeader, opName: o.opName, opNum: o.opNum,
        role: o.role, station: o.station, value: o.value,
      }));
      cell.addEventListener("click", function () { openDetail(o); });
      grid.appendChild(cell);
    });

    function openDetail(o) {
      closeDetail();
      var overlay = clone("tpl-acc-overlay");
      overlay.addEventListener("click", closeDetail);
      var sheet = overlay.querySelector(".sheet");
      sheet.addEventListener("click", function (e) { e.stopPropagation(); });
      overlay.querySelector(".close").addEventListener("click", closeDetail);
      sheet.appendChild(window.buildTacometro({
        variant: "detail", isLeader: o.isLeader, opName: o.opName, opNum: o.opNum,
        role: o.role, station: o.station, value: o.value,
      }));
      panel.appendChild(overlay);
      root._overlay = overlay;
    }
    function closeDetail() {
      if (root._overlay) { root._overlay.remove(); root._overlay = null; }
    }
  };
})();
