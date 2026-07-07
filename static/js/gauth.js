/* ============================================================
   gauth.js — Inicio de sesión con Google para el Team Leader.
   100% del lado del cliente (sin backend ni base de datos):
   Google Identity Services devuelve un JWT que se decodifica aquí
   para leer NOMBRE y FOTO, y se guarda en localStorage.

   >>> PARA USAR GOOGLE REAL:
   1. Crea un "OAuth 2.0 Client ID" (tipo Web) en Google Cloud Console.
   2. En "Authorized JavaScript origins" agrega el origen donde corres
      el dashboard (p.ej. http://localhost:5000).
   3. Pega ese ID en CLIENT_ID abajo.
   Si CLIENT_ID queda vacío, el botón abre el MODO PRUEBA (formulario
   con nombre + URL de foto) para ver el reemplazo al instante.
   ============================================================ */
(function () {
  var CLIENT_ID = "831462396810-jm3t0alu77c9ptqnj0crd9lorbht7q7s.apps.googleusercontent.com";                    // <-- pega aquí tu OAuth Client ID de Google
  var STORE = "tl_google_profile";

  function decodeJwt(token) {
    try {
      var payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      var json = decodeURIComponent(atob(payload).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(STORE) || "null"); }
    catch (e) { return null; }
  }
  function saveProfile(p) { localStorage.setItem(STORE, JSON.stringify(p)); }
  function clearProfile() { localStorage.removeItem(STORE); }

  var googleG =
    '<svg width="13" height="13" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>';

  function renderState(mount) {
    var p = readProfile();
    mount.innerHTML = "";
    if (p && p.name) {
      var wrap = document.createElement("div");
      wrap.className = "auth-user";
      var img = document.createElement("img");
      img.src = p.photo || ("https://ui-avatars.com/api/?background=1a1a1f&color=fff&name=" + encodeURIComponent(p.name));
      img.alt = p.name;
      img.referrerPolicy = "no-referrer";
      var nm = document.createElement("span");
      nm.className = "u-name"; nm.textContent = p.name;
      var out = document.createElement("button");
      out.className = "u-out"; out.title = "Cerrar sesión"; out.textContent = "×";
      out.addEventListener("click", function () {
        clearProfile();
        if (window.resetTeamLeader) window.resetTeamLeader();
        renderState(mount);
      });
      wrap.appendChild(img); wrap.appendChild(nm); wrap.appendChild(out);
      mount.appendChild(wrap);
    } else {
      var btn = document.createElement("button");
      btn.className = "auth-btn";
      btn.innerHTML = googleG + "<span>Iniciar sesión</span>";
      btn.addEventListener("click", function () { startSignIn(mount); });
      mount.appendChild(btn);
    }
  }

  function applyProfile(mount, profile) {
    saveProfile(profile);
    if (window.setTeamLeaderProfile) window.setTeamLeaderProfile(profile);
    renderState(mount);
  }

  function startSignIn(mount) {
    if (CLIENT_ID && window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: function (resp) {
          var claims = decodeJwt(resp.credential);
          if (!claims) return;
          applyProfile(mount, { name: claims.name, photo: claims.picture, email: claims.email });
        },
      });
      google.accounts.id.prompt();   // One Tap
    } else {
      openDemo(mount);               // sin Client ID -> modo prueba
    }
  }

  // -------- MODO PRUEBA (sin Google real) --------
  function openDemo(mount) {
    var panel = document.querySelector(".acc-panel");
    if (!panel) return;
    var stored = readProfile() || {};
    var overlay = document.createElement("div");
    overlay.className = "tl-demo-overlay";
    overlay.innerHTML =
      '<div class="tl-demo-sheet">' +
        '<h3>Iniciar sesión (prueba)</h3>' +
        '<p>Sin Client ID de Google configurado. Escribe tu nombre y, opcionalmente, la URL de tu foto para ver cómo se reemplaza al Team Leader.</p>' +
        '<label>Nombre</label>' +
        '<input class="d-name" type="text" placeholder="Tu nombre" value="' + (stored.name || "") + '">' +
        '<label>URL de foto (opcional)</label>' +
        '<input class="d-photo" type="text" placeholder="https://..." value="' + (stored.photo || "") + '">' +
        '<div class="tl-demo-actions">' +
          '<button class="cancel" type="button">Cancelar</button>' +
          '<button class="apply" type="button">Aplicar</button>' +
        '</div>' +
      '</div>';
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener("click", close);
    overlay.querySelector(".tl-demo-sheet").addEventListener("click", function (e) { e.stopPropagation(); });
    overlay.querySelector(".cancel").addEventListener("click", close);
    overlay.querySelector(".apply").addEventListener("click", function () {
      var name = overlay.querySelector(".d-name").value.trim();
      var photo = overlay.querySelector(".d-photo").value.trim();
      if (!name) { overlay.querySelector(".d-name").focus(); return; }
      applyProfile(mount, { name: name, photo: photo || null });
      close();
    });
    panel.appendChild(overlay);
    overlay.querySelector(".d-name").focus();
  }

  window.addEventListener("DOMContentLoaded", function () {
    var mount = document.querySelector(".acc-auth");
    if (mount) renderState(mount);
  });
})();
