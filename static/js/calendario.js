/* ============================================================
   calendario.js — LÓGICA
   Genera letras basadas en bitmaps. Días pasados/actuales (verde), 
   incidentes (rojo solo si ya pasaron), y días futuros (gris).
   ============================================================ */
(function () {
  var R = "#FF4133", B = "#38BDF8", A = "#F5A623", N = "#C9CDD4";

  function styleFor(status) {
    var polished = "conic-gradient(from 140deg,#3a3a3f 0deg,#909498 40deg,#2c2c31 95deg,#74747b 150deg,#2a2a2f 205deg,#a0a0a8 270deg,#34343a 320deg,#3a3a3f 360deg)";
    var dull = "conic-gradient(from 140deg,#1d1d21 0deg,#33333a 50deg,#18181c 110deg,#2b2b32 180deg,#17171a 250deg,#303038 320deg,#1d1d21 360deg)";
    var faceLit = "linear-gradient(165deg,#26262b,#17171b 60%,#101013 100%)";
    var faceDim = "linear-gradient(165deg,#141417,#0d0d10 60%,#09090b 100%)";
    
    if (status === "ok") return { bezel: polished, face: faceLit, led: "inset 0 0 0 1.5px rgba(31,230,40,.96), inset 0 0 17px rgba(31,230,40,.6), inset 0 -6px 12px rgba(0,0,0,.5)", num: "#F4F1F0", numShadow: "0 1px 2px rgba(0,0,0,.85)" };
    if (status === "incident") return { bezel: polished, face: faceLit, led: "inset 0 0 0 1.5px rgba(255,99,88,.92), inset 0 0 16px rgba(255,99,88,.5), inset 0 -6px 12px rgba(0,0,0,.5)", num: "#F4F1F0", numShadow: "0 1px 2px rgba(0,0,0,.85)" };
    return { bezel: dull, face: faceDim, led: "inset 0 0 0 1px rgba(150,140,138,.16), inset 0 -6px 12px rgba(0,0,0,.55)", num: "#6A625E", numShadow: "none" };
  }

  function buildLetter(bitmap, incidents, today, daysInMonth) {
    var rows = [], day = 1;
    var nearIncident = incidents.some(function (d) { return d > daysInMonth - 3 && d <= today; });
    var fillStatus = nearIncident ? "incident" : "ok";
    
    bitmap.forEach(function (line) {
      var cells = [];
      for (var c = 0; c < line.length; c++) {
        if (line[c] !== "1") continue;
        var d = day; day++;
        var status, text;
        
        if (d > daysInMonth) { 
          status = fillStatus; text = ""; 
        } else { 
          text = String(d); 
          // CORRECCIÓN: Prioridad absoluta al futuro. Si d > today, es gris.
          status = (d > today) ? "future" : (incidents.indexOf(d) !== -1 ? "incident" : "ok"); 
        }
        cells.push(Object.assign({ col: c + 1, text: text, isToday: (text !== "" && d === today), clickable: status === "incident" }, styleFor(status)));
      }
      if (cells.length) rows.push(cells);
    });
    return rows;
  }

  // CORRECCIÓN: Se recibe 'todayDate' para filtrar incidentes futuros
  function cats(daysInMonth, todayDate) {
    var S = ["1111111","1100000","1100000","1111111","0000011","0000011","0000011","1111111"];
    var Q = ["0111110","1100011","1100011","1100011","1100011","1101011","0111110","0000111"];
    var C = ["0111110","1111111","1100000","1100000","1100000","1100000","1111111","0111110"];
    var M = ["1100011","1110111","1111111","1101011","1100011","1100011","1100011","1100011"];
    var AL = ["0011100","0110110","1100011","1100011","1111111","1100011","1100011","1100011"];
    var T = ["1111111","1111111","0011100","0011100","0011100","0011100","0011100","0011100"];
    var F = ["1111111","1100000","1100000","1111110","0000011","1000011","1100011","0111110"];

    var list = [
      { label:"SEGURIDAD", glyph:"S", shape:S, detailTitle:"SEGURIDAD · DETALLE DE ACCIDENTES", metricTitle:"DÍAS SIN ACCIDENTE", goodLabel:"Día sin accidente", goodStatLabel:"SIN ACC.", badStatLabel:"ACC.",
        types:{ incapacitante:{color:R,label:"Accidente Incapacitante"}, primeros:{color:A,label:"Primeros Auxilios / No incapacitante"}, propiedad:{color:B,label:"Daño a la Propiedad"} },
        events:[ {day:4,type:"primeros",area:"Sub Assembly",shift:"A",desc:"Corte menor en mano izquierda al manejar material."},{day:11,type:"propiedad",area:"Logística",shift:"B",desc:"Impacto de montacargas contra rack ST-07."},{day:20,type:"incapacitante",area:"Main Assembly",shift:"B",desc:"Atrapamiento de dedo en prensa ST-12."},{day:26,type:"primeros",area:"Welding",shift:"C",desc:"Quemadura leve por contacto con superficie caliente."} ] },
      { label:"CALIDAD", glyph:"Q", shape:Q, detailTitle:"CALIDAD · DETALLE DE ALERTAS", metricTitle:"DÍAS SIN ALERTA", goodLabel:"Día sin alerta", goodStatLabel:"SIN ALERTA", badStatLabel:"ALERTAS",
        types:{ rof:{color:R,label:"Alerta ROF (cliente)"}, of:{color:N,label:"Alerta OF"}, interna:{color:B,label:"Alerta Interna"} },
        events:[ {day:6,type:"interna",area:"Final Line",shift:"A",desc:"Rebaba detectada en componente ST-03."},{day:15,type:"rof",area:"Cliente",shift:"B",desc:"Marca de manejo en superficie clase A."},{day:23,type:"of",area:"Auditoría",shift:"B",desc:"Documento de control de proceso incompleto."} ] },
      { label:"ENTREGAS", glyph:"T", shape:T, detailTitle:"ENTREGAS · DETALLE DE CUMPLIMIENTO", metricTitle:"DÍAS SIN INCUMPLIMIENTO", goodLabel:"Día entregado a tiempo", goodStatLabel:"A TIEMPO", badStatLabel:"FALLAS",
        types:{ tarde:{color:R,label:"Entrega tardía"}, incompleta:{color:A,label:"Entrega incompleta"}, transporte:{color:B,label:"Falla de transporte"} },
        events:[ {day:7,type:"transporte",area:"Embarques",shift:"A",desc:"Retraso de transportista en ventana de carga."},{day:16,type:"incompleta",area:"Almacén PT",shift:"B",desc:"Faltante de 40 piezas en pedido de cliente."},{day:27,type:"tarde",area:"Línea 04",shift:"C",desc:"Entrega fuera de ventana por paro de línea."} ] },
      { label:"COSTOS", glyph:"C", shape:C, detailTitle:"COSTOS · DETALLE DE DESVIACIONES", metricTitle:"DÍAS DENTRO DE PRESUPUESTO", goodLabel:"Día dentro de presupuesto", goodStatLabel:"EN META", badStatLabel:"DESV.",
        types:{ scrap:{color:R,label:"Sobrecosto por scrap"}, extra:{color:A,label:"Horas extra no planeadas"}, material:{color:B,label:"Desviación de material"} },
        events:[ {day:5,type:"scrap",val:"0.58%",area:"Inyección",shift:"A",desc:"Sobrecosto por scrap en arranque de molde."},{day:14,type:"extra",val:"12 h",area:"Ensamble",shift:"C",desc:"Horas extra no planeadas para recuperar plan."},{day:22,type:"material",val:"+3.2%",area:"Almacén",shift:"B",desc:"Desviación en consumo de material directo."} ] },
      { label:"MOTIV.", glyph:"M", shape:M, detailTitle:"MOTIVACIÓN · DETALLE", metricTitle:"DÍAS EN OBJETIVO", goodLabel:"Día en objetivo", goodStatLabel:"EN OBJ.", badStatLabel:"BAJO OBJ.",
        types:{ low:{color:R,label:"Participación bajo objetivo"} },
        events:[ {day:9,type:"low",val:"4/12",area:"Equipo B",shift:"B",desc:"Baja participación en dinámica de reconocimiento."},{day:18,type:"low",val:"5/12",area:"Equipo A",shift:"A",desc:"Ausencias en junta motivacional semanal."} ] },
      { label:"ASIST.", glyph:"A", shape:AL, detailTitle:"ASISTENCIA · DETALLE", metricTitle:"DÍAS EQUIPO COMPLETO", goodLabel:"Día equipo completo", goodStatLabel:"COMPLETO", badStatLabel:"INCID.",
        types:{ falta:{color:R,label:"Falta injustificada / Incapacidad"}, permiso:{color:N,label:"Permiso"}, vacaciones:{color:B,label:"Vacaciones"} },
        events:[ {day:3,type:"falta",area:"Célula 2",shift:"A",desc:"Falta injustificada de 1 operador."},{day:8,type:"permiso",area:"Célula 4",shift:"B",desc:"Permiso por cita médica."},{day:16,type:"vacaciones",area:"Célula 1",shift:"C",desc:"2 operadores en vacaciones programadas."},{day:24,type:"falta",area:"Célula 3",shift:"B",desc:"Incapacidad por enfermedad general."} ] },
      { label:"T. EST.", glyph:"T", shape:T, detailTitle:"TRABAJO ESTÁNDAR · DETALLE", metricTitle:"DÍAS SIN HALLAZGO", goodLabel:"Día sin hallazgo", goodStatLabel:"SIN HALL.", badStatLabel:"HALL.",
        types:{ seguridad:{color:R,label:"Hallazgo de seguridad"}, calidad:{color:N,label:"Hallazgo de calidad"}, operacion:{color:B,label:"Hallazgo de la operación"} },
        events:[ {day:7,type:"seguridad",area:"Estación 5",shift:"A",desc:"Operador sin seguir secuencia de bloqueo."},{day:17,type:"operacion",area:"Estación 9",shift:"B",desc:"Desviación en tiempo de ciclo estándar."},{day:29,type:"calidad",area:"Estación 2",shift:"C",desc:"Hoja de trabajo estándar desactualizada."} ] },
      { label:"5S", glyph:"5", shape:F, detailTitle:"5S · DETALLE DE AUDITORÍA", metricTitle:"DÍAS SIN HALLAZGO", goodLabel:"Día sin hallazgo", goodStatLabel:"SIN HALL.", badStatLabel:"HALL.",
        types:{ con:{color:R,label:"Con hallazgos"} },
        events:[ {day:10,type:"con",area:"Zona A",shift:"A",desc:"Herramienta fuera de silueta en tablero."},{day:21,type:"con",area:"Zona C",shift:"B",desc:"Material sin identificación en piso."} ] },
    ];
    return list.map(function (cat) {
      // CORRECCIÓN: Filtramos usando todayDate para asegurar que ningún incidente futuro se muestre o calcule
      return Object.assign({}, cat, { events: cat.events.filter(function (e) { return e.day <= todayDate; }) });
    });
  }

  function clone(id) { return document.getElementById(id).content.firstElementChild.cloneNode(true); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  window.initCalendario = function (root) {
    var today = new Date();
    var year = today.getFullYear(), month = today.getMonth(), td = today.getDate();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var monthLabel = today.toLocaleString("en-US", { month: "long" }).toUpperCase() + " " + year;
    var monthName = today.toLocaleString("es-ES", { month: "long" }).toUpperCase() + " " + year;
    
    // Pasamos el día actual 'td' para hacer el corte
    var CATS = cats(daysInMonth, td); 
    var grid = root.querySelector(".cal-grid");

    var fragment = document.createDocumentFragment();

    CATS.forEach(function (cat, idx) {
      var col = clone("tpl-cal-col");
      
      col.classList.add("animate-entry");
      col.style.animationDelay = (0.3 + (idx * 0.05)) + "s";

      col.querySelector(".glyph").textContent = cat.glyph;
      col.querySelector(".col-label").textContent = cat.label;
      col.querySelector(".month").textContent = monthLabel;
      var letter = col.querySelector(".letter");
      
      var rows = buildLetter(cat.shape, cat.events.map(function (e) { return e.day; }), td, daysInMonth);
      
      rows.forEach(function (cells) {
        var lrow = el("div", "lrow");
        cells.forEach(function (d) {
          var day = clone("tpl-cal-day");
          day.style.gridColumn = d.col;
          day.style.background = d.bezel;
          day.style.cursor = d.clickable ? "pointer" : "default";
          
          var face = day.querySelector(".face");
          face.style.background = d.face;
          face.style.boxShadow = d.led;
          
          var num = day.querySelector(".num");
          num.style.color = d.num;
          num.style.textShadow = d.numShadow;
          num.textContent = d.text;
          
          if (d.isToday) day.appendChild(el("div", "today-ring"));
          if (d.clickable) day.addEventListener("click", function () { openModal(idx); });
          lrow.appendChild(day);
        });
        letter.appendChild(lrow);
      });
      fragment.appendChild(col);
    });

    grid.appendChild(fragment);

    function openModal(selIdx) {
      closeModal();
      var sel = CATS[selIdx] || CATS[0];
      var typeColor = function (t) { return (sel.types[t] && sel.types[t].color) || "#FF4133"; };
      var typeLabel = function (t) { return (sel.types[t] && sel.types[t].label) || t; };
      var heightFor = function (c) { return c === "#FF4133" ? 92 : c === "#38BDF8" ? 74 : c === "#F5A623" ? 62 : c === "#C9CDD4" ? 52 : 70; };

      var eventsByDay = {};
      sel.events.forEach(function (e) { (eventsByDay[e.day] = eventsByDay[e.day] || []).push(e); });

      var streak = 0, best = 0, rawRows = [];
      for (var dd = 1; dd <= daysInMonth; dd++) {
        var evs = eventsByDay[dd];
        if (evs) streak = 0; else { streak += 1; if (streak > best) best = streak; }
        // CORRECCIÓN PARA MODAL: Evitamos que el xAxis renderice datos después del día actual
        if (dd <= td) {
          rawRows.push({ day: dd, events: evs || [] });
        }
      }

      var m = clone("tpl-cal-modal");
      m.querySelector(".m-title").textContent = sel.detailTitle;
      m.querySelector(".m-sub").textContent = "Plant North · Line 04 · " + monthLabel;
      m.querySelector(".metric-title").textContent = sel.metricTitle;
      // Ajustamos el "Días sin incidente" solo al total de días que ya ocurrieron
      m.querySelector(".stat-good .v").textContent = td - sel.events.length;
      m.querySelector(".stat-good .k").textContent = sel.goodStatLabel;
      m.querySelector(".streak").textContent = best;
      m.querySelector(".stat-bad .v").textContent = sel.events.length;
      m.querySelector(".stat-bad .k").textContent = sel.badStatLabel;
      m.querySelector(".month-lbl").textContent = monthName;

      var legBox = m.querySelector(".m-legend");
      var legendItems = [{ color: "#22E62C", label: sel.goodLabel }].concat(Object.keys(sel.types).map(function (k) { return { color: sel.types[k].color, label: sel.types[k].label }; }));
      legendItems.forEach(function (l) {
        var it = clone("tpl-cal-legitem");
        var sw = it.querySelector(".sw");
        sw.style.background = l.color; sw.style.boxShadow = "0 0 8px " + l.color;
        it.querySelector(".lb").textContent = l.label;
        legBox.appendChild(it);
      });

      var plot = m.querySelector(".plot");
      var xaxis = m.querySelector(".xaxis");
      rawRows.forEach(function (rr) {
        var evs = rr.events.slice(0, 3);
        var has = evs.length > 0;
        if (!has) { plot.appendChild(el("div", "col")); }
        else {
          var col = clone("tpl-cal-plotcol");
          var bars = col.querySelector(".bars");
          evs.forEach(function (e) {
            var c = typeColor(e.type);
            var bar = el("div", "bar");
            bar.style.height = heightFor(c) + "%";
            bar.style.background = c;
            bar.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.35),0 0 8px " + c;
            bars.appendChild(bar);
          });
          var tip = col.querySelector(".tip");
          tip.style.borderTop = "2px solid " + typeColor(evs[0].type);
          tip.querySelector(".tday span").textContent = "DÍA " + rr.day;
          var arrow = tip.querySelector(".arrow");
          evs.forEach(function (e) {
            var ev = clone("tpl-cal-tipev");
            var short = ev.querySelector(".short");
            short.style.color = typeColor(e.type);
            short.textContent = typeLabel(e.type).toUpperCase();
            ev.querySelector(".desc").textContent = e.desc + (e.val ? " (" + e.val + ")" : "");
            ev.querySelector(".meta").textContent = e.area + " · Turno " + e.shift;
            tip.insertBefore(ev, arrow);
          });
          plot.appendChild(col);
        }
        var x = el("div", "x");
        x.style.color = has ? typeColor(rr.events[0].type) : "#7A6B68";
        x.textContent = rr.day;
        xaxis.appendChild(x);
      });

      var evlist = m.querySelector(".evlist");
      sel.events.slice().sort(function (a, b) { return a.day - b.day; }).forEach(function (a) {
        var c = typeColor(a.type);
        var row = clone("tpl-cal-evrow");
        row.style.borderLeft = "3px solid " + c;
        row.querySelector(".day-lbl").textContent = String(a.day).padStart(2, "0") + " " + new Date(year, month, a.day).toLocaleString("en-US", { month: "short" }).toUpperCase();
        var type = row.querySelector(".type"); type.style.color = c; type.textContent = typeLabel(a.type);
        row.querySelector(".desc").textContent = a.desc + (a.val ? " — " + a.val : "");
        row.querySelector(".meta").textContent = a.area + " · Turno " + a.shift;
        evlist.appendChild(row);
      });

      m.addEventListener("click", closeModal);
      m.querySelector(".sheet").addEventListener("click", function (e) { e.stopPropagation(); });
      m.querySelector(".m-close").addEventListener("click", closeModal);
      document.body.appendChild(m);
      root._modal = m;
    }

    function closeModal() { 
      if (root._modal && !root._modal.classList.contains("is-closing")) { 
        root._modal.classList.add("is-closing"); 
        setTimeout(function () {
          if (root._modal) { 
            root._modal.remove(); 
            root._modal = null; 
          }
        }, 180);
      } 
    }
  };
})();