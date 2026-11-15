// Accounts (S-77): talks to Supabase Auth with the public key, keeps the session on this device, and draws the
// header's account links (signed out: Sign in; signed in: Favorites and Sign out).
(function () {
  var cfg = window.RECIPES_CONFIG || {};
  var base = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  var KEY = "recipes.session";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  // Result: { ok: true } | { ok: false, kind: "noconnection" | "exists" | "weak" | "email" | "other" }
  function signUp(email, password) {
    return fetch(base + "/auth/v1/signup", {
      method: "POST",
      headers: { apikey: cfg.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (r.ok && b.access_token) {
          save({ access_token: b.access_token, refresh_token: b.refresh_token, expires_at: b.expires_at, user: b.user });
          return { ok: true };
        }
        var code = b.error_code || b.code;
        if (r.ok) return { ok: false, kind: "other" }; // no session: the project wants a confirmation email
        if (code === "user_already_exists" || code === "email_exists") return { ok: false, kind: "exists" };
        if (code === "weak_password") return { ok: false, kind: "weak" };
        if (code === "email_address_invalid" || code === "validation_failed") return { ok: false, kind: "email" };
        return { ok: false, kind: "other" };
      });
    }, function () { return { ok: false, kind: "noconnection" }; });
  }

  // Result: { ok: true } | { ok: false, kind: "noconnection" | "wrong" | "other" }
  function signIn(email, password) {
    return fetch(base + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: cfg.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (r.ok && b.access_token) {
          save({ access_token: b.access_token, refresh_token: b.refresh_token, expires_at: b.expires_at, user: b.user });
          return { ok: true };
        }
        var code = b.error_code || b.code;
        if (code === "invalid_credentials" || code === "validation_failed" || code === "email_address_invalid") return { ok: false, kind: "wrong" };
        return { ok: false, kind: "other" };
      });
    }, function () { return { ok: false, kind: "noconnection" }; });
  }

  // Result: { ok: true } | { ok: false, kind: "noconnection" | "toomany" | "email" | "other" }
  // Supabase answers the same whether or not the email has an account, and only sends to one that has.
  function resetPassword(email) {
    var back = encodeURIComponent(window.location.origin + "/reset-password");
    return fetch(base + "/auth/v1/recover?redirect_to=" + back, {
      method: "POST",
      headers: { apikey: cfg.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    }).then(function (r) {
      if (r.ok) return { ok: true };
      return r.json().catch(function () { return {}; }).then(function (b) {
        var code = b.error_code || b.code;
        if (code === "over_email_send_rate_limit" || r.status === 429) return { ok: false, kind: "toomany" };
        if (code === "email_address_invalid" || code === "validation_failed") return { ok: false, kind: "email" };
        return { ok: false, kind: "other" };
      });
    }, function () { return { ok: false, kind: "noconnection" }; });
  }

  // Sets the new password with the token from the reset link. The link's sign-in is never saved on this device.
  // Result: { ok: true } | { ok: false, kind: "noconnection" | "same" | "weak" | "gone" | "other" }
  function setPassword(token, password) {
    return fetch(base + "/auth/v1/user", {
      method: "PUT",
      headers: { apikey: cfg.supabaseKey, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ password: password })
    }).then(function (r) {
      if (r.ok) return { ok: true };
      return r.json().catch(function () { return {}; }).then(function (b) {
        var code = b.error_code || b.code;
        if (code === "same_password") return { ok: false, kind: "same" };
        if (code === "weak_password") return { ok: false, kind: "weak" };
        if (r.status === 401 || r.status === 403 || code === "bad_jwt" || code === "session_not_found" || code === "session_expired" || code === "user_not_found" || code === "no_authorization") return { ok: false, kind: "gone" };
        return { ok: false, kind: "other" };
      });
    }, function () { return { ok: false, kind: "noconnection" }; });
  }

  // Signs out at once, no confirm. The page stays at the same address in its signed-out view; the Favorites view
  // (/?favorites=1) falls back to the normal Home page. The session is cleared on this device first; telling Supabase
  // to end it (this device only) is best effort and never holds anything up.
  function signOut() {
    var s = read();
    clear();
    if (s && s.access_token && base) {
      try {
        fetch(base + "/auth/v1/logout?scope=local", {
          method: "POST",
          keepalive: true,
          headers: { apikey: cfg.supabaseKey, Authorization: "Bearer " + s.access_token }
        }).catch(function () {});
      } catch (e) {}
    }
    var loc = window.location;
    if (loc.pathname === "/" && new URLSearchParams(loc.search).has("favorites")) loc.replace("/");
    else loc.reload();
  }

  // Keeps a device signed in: when the saved access token has expired (or is about to), trades the refresh token for a
  // new one. A lost connection keeps the session; only Supabase refusing the refresh token ends it.
  // One refresh at a time: a second caller gets the one already under way, so no second request is sent.
  var inflight = null;
  function refresh() {
    if (inflight) return inflight;
    var s = read();
    if (!s || !s.refresh_token || !base) return Promise.resolve();
    if (s.expires_at && s.expires_at * 1000 - Date.now() > 60000) return Promise.resolve();
    inflight = fetch(base + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: cfg.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function (r) {
      if (r.ok) {
        return r.json().then(function (b) {
          if (b.access_token) save({ access_token: b.access_token, refresh_token: b.refresh_token, expires_at: b.expires_at, user: b.user || s.user });
        });
      }
      if (r.status === 400 || r.status === 401 || r.status === 403) { clear(); header(); }
    }).catch(function () {}).then(function () { inflight = null; });
    return inflight;
  }

  // Calls the database as the signed-in Member (S-25; reused by the other personal stories). Waits for the refresh
  // that runs when the page loads, so the token it sends is the fresh one and no second refresh request is made.
  // path is below /rest/v1, e.g. "favorite?select=recipe_id". opts: { method, body (an object), prefer }.
  // Returns the fetch Response (check .ok; a missing table or a refusal is a not-ok Response). Rejects when nobody is
  // signed in or the connection is lost.
  var loadRefresh = null;
  function api(path, opts) {
    opts = opts || {};
    if (!loadRefresh) loadRefresh = Promise.resolve();
    return Promise.all([loadRefresh, refresh()]).then(function () {
      var s = read();
      if (!s || !s.access_token) throw new Error("signed out");
      var h = { apikey: cfg.supabaseKey, Authorization: "Bearer " + s.access_token, "Accept-Profile": "recipes", "Content-Profile": "recipes" };
      if (opts.body !== undefined) h["Content-Type"] = "application/json";
      if (opts.prefer) h.Prefer = opts.prefer;
      return fetch(base + "/rest/v1/" + path, { method: opts.method || "GET", headers: h, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined });
    });
  }
  function userId() { var s = read(); return s && s.user ? s.user.id : null; }

  function header() {
    var nav = document.querySelector("nav.main");
    if (!nav) return;
    var old = nav.querySelectorAll("[data-auth]");
    for (var i = 0; i < old.length; i++) old[i].remove();
    function add(el) { el.setAttribute("data-auth", ""); nav.appendChild(el); }
    if (read()) {
      var fav = document.createElement("a");
      fav.href = "/?favorites=1";
      fav.textContent = "Favorites";
      add(fav);
      var out = document.createElement("a");
      out.href = "#";
      out.textContent = "Sign out";
      out.addEventListener("click", function (e) {
        e.preventDefault();
        signOut();
      });
      add(out);
    } else {
      var inn = document.createElement("a");
      inn.className = "signin";
      inn.href = "/sign-in";
      inn.textContent = "Sign in";
      add(inn);
    }
  }

  window.RecipesAuth = { signUp: signUp, signIn: signIn, resetPassword: resetPassword, setPassword: setPassword, signedIn: function () { return !!read(); }, header: header, signOut: signOut, refresh: refresh, api: api, userId: userId };
  header();
  loadRefresh = refresh();
})();
