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
        clear();
        window.location.reload();
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

  window.RecipesAuth = { signUp: signUp, signIn: signIn, resetPassword: resetPassword, setPassword: setPassword, signedIn: function () { return !!read(); }, header: header };
  header();
})();
