/* ============================================================
   acceso.js — LÓGICA solamente.
   ============================================================ */
(function () {
  var TL_STORE = "tl_google_profile";   // perfil del Team Leader (localStorage)

  function operators() {
    return [
      { opName: "Angel Eduardo Rodriguez", opNum: "OP 482", station: "EST-04", value: 88, leader: true },
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

  function readStoredProfile() {
    try { return JSON.parse(localStorage.getItem(TL_STORE) || "null"); }
    catch (e) { return null; }
  }

  // Fusiona el perfil de Google sobre el operador Team Leader
  function applyProfileToLeader(ops, profile) {
    var idx = ops.findIndex(function (o) { return o.isLeader; });
    if (idx < 0) return;
    if (profile && profile.name) {
      ops[idx].opName = profile.name;
      ops[idx].photo = profile.photo || null;
    }
  }

  function clone(id) { return document.getElementById(id).content.firstElementChild.cloneNode(true); }

  window.initAcceso = function (root) {
    var ops = operators();
    applyProfileToLeader(ops, readStoredProfile());   // aplica perfil guardado al cargar

    var grid = root.querySelector(".acc-grid");
    var panel = root.querySelector(".acc-panel");
    root.querySelector(".count-n").textContent = ops.length;

    var cellEls = [];   // referencia a cada celda para re-renderizar

    // 1. Declarar contenedor en memoria fuera del DOM activo
    var fragment = document.createDocumentFragment();

    ops.forEach(function (o, index) {
      var cell = clone("tpl-acc-cell");

      // 2. Aplicar clases y retrasos escalonados para la animación
      cell.classList.add("animate-entry");
      cell.style.animationDelay = (0.5 + (index * 0.08)) + "s";

      cell.appendChild(window.buildTacometro({
        isLeader: o.isLeader, opName: o.opName, opNum: o.opNum,
        role: o.role, station: o.station, value: o.value, photo: o.photo,
      }));
      cell.addEventListener("click", function () { openDetail(o); });

      // 3. Añadir la celda al fragmento en memoria
      cellEls[index] = cell;
      fragment.appendChild(cell);
    });

    // 4. Modificar el DOM real en una única y final operación
    grid.appendChild(fragment);

    // Reconstruye una sola celda in-place (sin re-animar el resto de la grilla)
    function rebuildCell(index) {
      var o = ops[index];
      var cell = cellEls[index];
      if (!cell) return;
      cell.innerHTML = "";
      cell.appendChild(window.buildTacometro({
        isLeader: o.isLeader, opName: o.opName, opNum: o.opNum,
        role: o.role, station: o.station, value: o.value, photo: o.photo,
      }));
    }

    // API pública: gauth.js llama esto tras iniciar sesión / cerrar sesión
    window.setTeamLeaderProfile = function (profile) {
      applyProfileToLeader(ops, profile);
      var idx = ops.findIndex(function (o) { return o.isLeader; });
      if (idx >= 0) rebuildCell(idx);
    };
    window.resetTeamLeader = function () {
      var idx = ops.findIndex(function (o) { return o.isLeader; });
      if (idx < 0) return;
      ops[idx].opName = "Angel Eduardo Rodriguez";
      ops[idx].photo = null;
      rebuildCell(idx);
    };

    function openDetail(o) {
      closeDetail();
      var overlay = clone("tpl-acc-overlay");
      overlay.addEventListener("click", closeDetail);
      var sheet = overlay.querySelector(".sheet");
      sheet.addEventListener("click", function (e) { e.stopPropagation(); });
      overlay.querySelector(".close").addEventListener("click", closeDetail);
      sheet.appendChild(window.buildTacometro({
        variant: "detail", isLeader: o.isLeader, opName: o.opName, opNum: o.opNum,
        role: o.role, station: o.station, value: o.value, photo: o.photo,
      }));
      panel.appendChild(overlay);
      root._overlay = overlay;
    }

    function closeDetail() {
      if (root._overlay && !root._overlay.classList.contains("is-closing")) {
        root._overlay.classList.add("is-closing");
        setTimeout(function () {
          if (root._overlay) {
            root._overlay.remove();
            root._overlay = null;
          }
        }, 160);
      }
    }
  };
})();
