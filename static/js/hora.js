/* ============================================================
   hora.js — LÓGICA
   Simulación ajustada al tiempo ciclo (78.0s) de BMW BEV y 
   fórmula de eficiencia exacta (Max 100%).
   ============================================================ */
(function () {
  // CONFIGURACIÓN DE PRODUCCIÓN
  var CYCLE_TIME_SEC = 78.0; // Tiempo de ciclo en segundos
  var REFRESH_MS = 5000;

  function toMin(s) { var p = s.split(":").map(Number); return p[0] * 60 + p[1]; }
  function durMin(s, e) { return ((toMin(e) - toMin(s)) + 1440) % 1440; }

  // PRNG determinista para mantener valores estables
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // FÓRMULA DE EFICIENCIA EXACTA
  function calcularEficiencia(producidas, esperadas) {
    if (esperadas > 0) {
      var eficiencia = (parseFloat(producidas) / parseFloat(esperadas)) * 100;
      return Math.min(Math.round(eficiencia), 100); // Límite estricto de 100%
    }
    return 0;
  }

  function shifts() {
    return {
      1: { name: "TURNO 1", blocks: [
        ["07:20","08:00",false],["08:00","09:00",false],["09:00","10:00",false],["10:00","11:00",false],
        ["11:00","12:00",true],["12:00","13:00",false],["13:00","14:00",false],["14:00","14:50",false] ] },
      2: { name: "TURNO 2", blocks: [
        ["15:20","16:00",false],["16:00","17:00",false],["17:00","18:00",false],["18:00","19:00",false],
        ["19:00","20:00",true],["20:00","21:00",false],["21:00","22:00",false],["22:00","22:20",false] ] },
      3: { name: "TURNO 3", blocks: [
        ["22:50","23:00",false],["23:00","00:00",false],["00:00","01:00",false],["01:00","02:00",false],
        ["02:00","03:00",true],["03:00","04:00",false],["04:00","05:00",false],["05:00","06:00",false],
        ["06:00","06:50",false] ] },
    };
  }

  function effColor(p) {
    if (p >= 95) return { c: "#22E62C", g: "rgba(31,230,40,.5)" };
    if (p >= 85) return { c: "#F5A623", g: "rgba(245,166,35,.5)" };
    return { c: "#FF5347", g: "rgba(255,83,71,.5)" };
  }

  function compute() {
    var now = Date.now();
    var SHIFTS = shifts();
    var d = new Date(now);
    var M0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var realMin = d.getHours() * 60 + d.getMinutes();

    var shiftId, startAbs, waiting = false;
    if (realMin >= 440 && realMin < 890) { shiftId = 1; startAbs = M0 + 440 * 6e4; }
    else if (realMin >= 920 && realMin < 1340) { shiftId = 2; startAbs = M0 + 920 * 6e4; }
    else if (realMin >= 1370) { shiftId = 3; startAbs = M0 + 1370 * 6e4; }
    else if (realMin < 410) { shiftId = 3; startAbs = M0 + (1370 - 1440) * 6e4; }
    else if (realMin >= 890 && realMin < 920) { shiftId = 1; startAbs = M0 + 440 * 6e4; waiting = true; }
    else if (realMin >= 1340 && realMin < 1370) { shiftId = 2; startAbs = M0 + 920 * 6e4; waiting = true; }
    else { shiftId = 3; startAbs = M0 + (1370 - 1440) * 6e4; waiting = true; }

    var shift = SHIFTS[shiftId];
    var cursor = startAbs, totalDur = 0;
    
    var blocks = shift.blocks.map(function (b) {
      var dur = durMin(b[0], b[1]);
      var st = cursor, en = cursor + dur * 6e4;
      cursor = en; totalDur += dur;
      
      var durSeg = dur * 60;
      var tiempoEfectivo = b[2] ? (durSeg * 0.5) : durSeg; 
      var expected = Math.floor(tiempoEfectivo / CYCLE_TIME_SEC);
      
      return { s: b[0], e: b[1], brk: b[2], st: st, en: en, expected: expected };
    });
    
    var shiftEnd = startAbs + totalDur * 6e4;
    var simNow = waiting ? (shiftEnd + 1) : now;

    var sumExp = 0, sumExpElapsed = 0, sumProd = 0, sumQL = 0;
    var rows = blocks.map(function (b, i) {
      var rnd = rng(shiftId * 1000 + i * 7 + 3);
      var effF = 0.86 + rnd() * 0.13;
      var prodFinal = Math.round(b.expected * effF);
      var qlFinal = Math.round(rnd() * rnd() * b.expected * 0.045);
      
      var status, produced, ql, expElapsed;
      if (simNow >= b.en) { 
        status = "done"; produced = prodFinal; ql = qlFinal; expElapsed = b.expected; 
      }
      else if (simNow < b.st) { 
        status = "pending"; produced = 0; ql = 0; expElapsed = 0; 
      }
      else {
        status = "active";
        if (b.brk) { 
          produced = prodFinal; ql = qlFinal; expElapsed = b.expected; 
        }
        else {
          var f = (simNow - b.st) / (b.en - b.st);
          produced = Math.round(prodFinal * f); ql = Math.round(qlFinal * f); expElapsed = b.expected * f;
        }
      }
      
      sumExp += b.expected; sumExpElapsed += expElapsed; sumProd += produced; sumQL += ql;
      
      // La fila actual se sigue calculando contra su objetivo fijo de hora (ej: 13 / 46 = 28%)
      var effP = calcularEficiencia(produced, b.expected);
      
      var ec = effColor(effP);
      var qlP = produced > 0 ? (ql / produced) * 100 : 0;
      var isActive = status === "active", brk = b.brk;
      
      return {
        label: b.s + " – " + b.e, status: status, isActive: isActive, brk: brk,
        tagText: brk ? "DESCANSO" : "EN CURSO",
        tagColor: brk ? "#F5D488" : "#BFF3CE",
        tagBg: brk ? "rgba(245,166,35,.16)" : "rgba(34,230,44,.14)",
        tagBorder: brk ? "rgba(245,166,35,.5)" : "rgba(34,230,44,.42)",
        dot: isActive ? (brk ? "#F5A623" : "#22E62C") : status === "done" ? "#FF5347" : "#5a514f",
        dotGlow: isActive ? (brk ? "0 0 9px rgba(245,166,35,.85)" : "0 0 9px rgba(34,230,44,.85)") : status === "done" ? "0 0 8px rgba(255,83,71,.55)" : "none",
        dotAnim: isActive ? "pulse 1.7s infinite" : "none",
        expected: b.expected,
        produced: status === "pending" ? "0" : String(produced),
        prodColor: status === "pending" ? "#5f5854" : "#F4ECEC",
        prodShadow: isActive ? "0 0 12px rgba(255,255,255,.18)" : "none",
        effText: status === "pending" ? "—" : (effP + "%"),
        effColor: status === "pending" ? "#5f5854" : ec.c,
        effGlow: status === "pending" ? "transparent" : ec.g,
        barPct: status === "pending" ? 0 : effP,
        ql: status === "pending" ? "—" : (qlP.toFixed(1) + "%"),
        qlColor: (status !== "pending" && qlP > 0.05) ? (qlP > 3 ? "#FF5347" : "#F5A623") : "#6E5754",
        qlShadow: (status !== "pending" && qlP > 3) ? "0 0 10px rgba(255,83,71,.4)" : "none",
        opacity: status === "pending" ? 0.42 : 1,
      };
    });

    // TOTAL TURNO: La eficiencia global y las esperadas globales AHORA usan la sumatoria dinámica (sumExpElapsed)
    var totEffP = calcularEficiencia(sumProd, Math.round(sumExpElapsed));
    var tec = effColor(totEffP);
    var startedAny = sumExpElapsed > 0;
    var totQLP = sumProd > 0 ? (sumQL / sumProd) * 100 : 0;

    return {
      shiftId: shiftId, shiftName: shift.name, waiting: waiting, rows: rows,
      
      // FIX: Mostrar piezas esperadas hasta este minuto, NO las del turno completo.
      totalExpected: String(Math.round(sumExpElapsed)), 
      
      totalProduced: String(Math.round(sumProd)),
      totalEffText: startedAny ? (totEffP + "%") : "—",
      totalEffColor: startedAny ? tec.c : "#5f5854",
      totalEffGlow: startedAny ? tec.g : "transparent",
      totalBarPct: startedAny ? totEffP : 0,
      totalQL: startedAny ? (totQLP.toFixed(1) + "%") : "—",
      totalQLColor: (startedAny && totQLP > 0.05) ? (totQLP > 3 ? "#FF5347" : "#F5A623") : "#6E5754",
    };
  }

  function fillRow(el, r) {
    el.className = "hrow data" + (r.isActive ? (r.brk ? " active-brk" : " active-ok") : "");
    el.style.opacity = r.opacity;
    var dot = el.querySelector(".hcell-hora .dot");
    dot.style.background = r.dot; dot.style.boxShadow = r.dotGlow; dot.style.animation = r.dotAnim;
    el.querySelector(".hcell-hora .label").textContent = r.label;
    var tag = el.querySelector(".hcell-hora .tag");
    if (r.isActive) {
      tag.style.display = ""; tag.textContent = r.tagText;
      tag.style.color = r.tagColor; tag.style.background = r.tagBg; tag.style.border = "1px solid " + r.tagBorder;
    } else { tag.style.display = "none"; }
    var exp = el.querySelector(".expected"); exp.textContent = r.expected; exp.style.color = "#C9BBB8";
    var prod = el.querySelector(".produced"); prod.textContent = r.produced; prod.style.color = r.prodColor; prod.style.textShadow = r.prodShadow;
    var ev = el.querySelector(".hcell-eff .val"); ev.textContent = r.effText; ev.style.color = r.effColor; ev.style.textShadow = "0 0 12px " + r.effGlow;
    var fill = el.querySelector(".hcell-eff .bar-fill"); fill.style.width = r.barPct + "%"; fill.style.background = r.effColor; fill.style.boxShadow = "0 0 8px " + r.effGlow;
    var ql = el.querySelector(".ql"); ql.textContent = r.ql; ql.style.color = r.qlColor; ql.style.textShadow = r.qlShadow;
  }

  window.initHora = function (root) {
    var rowsBox = root.querySelector(".hora-rows");
    var tpl = document.getElementById("tpl-hora-row");

    function render() {
      var d = compute(); 
      root.querySelector(".shift-name").textContent = d.shiftName;

      root.querySelectorAll(".turno").forEach(function (t) {
        var id = +t.getAttribute("data-shift");
        t.classList.remove("on", "paused");
        if (id === d.shiftId) t.classList.add(d.waiting ? "paused" : "on");
      });

      root.querySelector(".waiting-banner").style.display = d.waiting ? "" : "none";

      while (rowsBox.children.length > d.rows.length) rowsBox.removeChild(rowsBox.lastChild);
      while (rowsBox.children.length < d.rows.length) rowsBox.appendChild(tpl.content.firstElementChild.cloneNode(true));
      
      d.rows.forEach(function (r, i) { 
        var rowEl = rowsBox.children[i];
        fillRow(rowEl, r); 
        
        if (!rowEl.classList.contains("animate-entry")) {
          rowEl.classList.add("animate-entry");
          rowEl.style.animationDelay = (0.4 + (i * 0.06)) + "s";
        }
      });

      var te = root.querySelector(".t-expected"); te.textContent = d.totalExpected;
      root.querySelector(".t-produced").textContent = d.totalProduced;
      var tev = root.querySelector(".t-eff-val"); tev.textContent = d.totalEffText; tev.style.color = d.totalEffColor; tev.style.textShadow = "0 0 14px " + d.totalEffGlow;
      var tef = root.querySelector(".t-eff-fill"); tef.style.width = d.totalBarPct + "%"; tef.style.background = d.totalEffColor; tef.style.boxShadow = "0 0 8px " + d.totalEffGlow;
      var tql = root.querySelector(".t-ql"); tql.textContent = d.totalQL; tql.style.color = d.totalQLColor;
    }

    render();
    setInterval(render, REFRESH_MS);
  };
})();