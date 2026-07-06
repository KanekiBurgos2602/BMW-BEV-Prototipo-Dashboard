/* ============================================================
   tacometro.js — LÓGICA solamente. El HTML vive en
   template/partials/tacometro.html (#tpl-taco).
   window.buildTacometro(props) -> HTMLElement (.taco)
   ============================================================ */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";

  function pt(r, a) {
    return [ +(100 + r * Math.sin(a)).toFixed(2), +(100 - r * Math.cos(a)).toFixed(2) ];
  }
  function svg(tag, attrs, style, text) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (style) el.setAttribute("style", style);
    if (text != null) el.textContent = text;
    return el;
  }

  // Generación de marcas con volcado único al DOM (optimizado)
  function fillTicks(g, value) {
    var ACC = "#22E62C";
    var majors = 8, steps = majors * 4;
    var activeIdx = Math.round((value / 100) * majors);

    var fragment = document.createDocumentFragment();

    for (var k = 0; k <= steps; k++) {
      if (k % 4 === 0) continue;
      var a = (-130 + (k / steps) * 260) * Math.PI / 180;
      var p1 = pt(87, a), p2 = pt(93, a);
      fragment.appendChild(svg("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: "rgba(255,255,255,.15)", "stroke-width": 1, "stroke-linecap": "round" }));
    }
    for (var i = 0; i <= majors; i++) {
      var na = (i / majors * 260 - 130) * Math.PI / 180;
      var on = i === activeIdx;
      var t1 = pt(on ? 78 : 82, na), t2 = pt(93, na);
      fragment.appendChild(svg("line", { x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1], stroke: on ? ACC : "rgba(255,200,190,.55)", "stroke-width": on ? 3.4 : 2.2, "stroke-linecap": "round" }));
      var np = pt(69, na);
      var glow = on ? "drop-shadow(0 0 5px " + ACC + ") drop-shadow(0 1px 2px rgba(0,0,0,.95))" : "drop-shadow(0 1px 2px rgba(0,0,0,.95))";
      fragment.appendChild(svg("text", { x: np[0], y: np[1], "text-anchor": "middle", "dominant-baseline": "central", fill: on ? "#FFFFFF" : "#E9DAD6" },
        "font:" + (on ? "800" : "700") + " 12px 'Saira Condensed';letter-spacing:.5px;filter:" + glow, String(i)));
    }
    for (var m = 0; m < majors; m++) {
      var mf = (m + 0.5) / majors;
      var ma = (-130 + mf * 260) * Math.PI / 180;
      var mp = pt(61.5, ma);
      fragment.appendChild(svg("text", { x: mp[0], y: mp[1], "text-anchor": "middle", "dominant-baseline": "central", fill: ACC + "99" },
        "font:400 5px 'Share Tech Mono';letter-spacing:.2px", String(Math.round(mf * 100)).padStart(2, "0")));
    }
    for (var o = 1; o <= 8; o++) {
      var of = o / 9;
      var oa = (-130 + of * 260) * Math.PI / 180;
      var op = pt(84.5, oa);
      fragment.appendChild(svg("text", { x: op[0], y: op[1], "text-anchor": "middle", "dominant-baseline": "central", fill: "rgba(255,235,232,.5)" },
        "font:400 4px 'Share Tech Mono';letter-spacing:.2px", String(o * 5).padStart(2, "0")));
    }

    g.appendChild(fragment);
  }

  window.buildTacometro = function (props) {
    props = props || {};
    var tpl = document.getElementById("tpl-taco");
    var el = tpl.content.firstElementChild.cloneNode(true);

    var isLeader = !!props.isLeader;
    var detail = (props.variant || "card") === "detail";
    var value = Math.max(0, Math.min(100, props.value == null ? 72 : props.value));
    var frac = value / 100;
    var deg = -130 + frac * 260;
    var rad = deg * Math.PI / 180;
    var arc = +(frac * 399.33).toFixed(2);

    if (isLeader) el.classList.add("leader");
    if (detail) el.classList.add("detail");

    // Geometría del medidor
    fillTicks(el.querySelector(".ticks"), value);
    el.querySelector(".arc-glow").setAttribute("stroke-dasharray", arc + " 552.92");
    el.querySelector(".arc-white").setAttribute("stroke-dasharray", arc + " 552.92");
    var tip = el.querySelector(".tip");
    tip.setAttribute("cx", +(100 + 88 * Math.sin(rad)).toFixed(2));
    tip.setAttribute("cy", +(100 - 88 * Math.cos(rad)).toFixed(2));
    
    // Animación fluida de la aguja: comienza en 0 (-130deg) y transiciona al valor real
    var needle = el.querySelector(".needle");
    needle.style.transform = "rotate(-130deg)";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        needle.style.transform = "rotate(" + deg.toFixed(2) + "deg)";
      });
    });

    // Identidad
    var nm = String(props.opName || "Operador").trim();
    var initials = nm.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("");
    el.querySelector(".initials").textContent = initials;
    el.querySelector(".role").textContent = props.role || (isLeader ? "TEAM LEADER" : "COLABORADOR");
    el.querySelector(".name").textContent = nm;
    el.querySelector(".opnum").textContent = props.opNum || "OP 000";
    el.querySelector(".station").textContent = "ESTACIÓN " + (props.station || "EST-01");

    return el;
  };
})();