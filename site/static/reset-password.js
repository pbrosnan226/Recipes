// Reset password page (S-80). Wording from Workout's ux-copy.md, Reset password.
// The reset email's link opens this page with the recovery token after the # in the address.
(function () {
  var form = document.getElementById("rp-form");
  if (!form || !window.RecipesAuth) return;
  var pw = document.getElementById("rp-password"), confirm = document.getElementById("rp-confirm");
  var help = document.getElementById("rp-password-help"), pwErr = document.getElementById("rp-password-err");
  var confirmErr = document.getElementById("rp-confirm-err"), formErr = document.getElementById("rp-form-err");
  var btn = document.getElementById("rp-submit"), notReset = document.getElementById("rp-not-reset");
  var busy = false;

  // A valid reset link carries type=recovery and an access token; an expired or used one carries an error instead.
  var token = null;
  var hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  if (hash.get("type") === "recovery" && hash.get("access_token") && !hash.get("error")) token = hash.get("access_token");
  // Keep the token only in memory, out of the address bar and history.
  if (window.location.hash && window.history.replaceState) window.history.replaceState(null, "", window.location.pathname);

  function showNotReset() {
    token = null;
    form.remove();
    notReset.textContent = "That link is not a password reset link.";
    notReset.hidden = false;
  }
  if (!token) { showNotReset(); return; }
  form.hidden = false;

  function fieldErr(input, el, text) { el.textContent = text; el.hidden = false; input.setAttribute("aria-invalid", "true"); }
  function clearField(input, el) { el.hidden = true; el.textContent = ""; input.removeAttribute("aria-invalid"); }
  function pwError(text) { help.hidden = true; fieldErr(pw, pwErr, text); }
  function clearPw() { clearField(pw, pwErr); help.hidden = false; }
  function say(text) { formErr.textContent = text; formErr.hidden = false; }
  function busyOn(on) {
    busy = on;
    btn.disabled = on;
    btn.textContent = on ? "Setting..." : "Set password";
  }

  pw.addEventListener("input", clearPw);
  confirm.addEventListener("input", function () { clearField(confirm, confirmErr); });
  pw.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); confirm.focus(); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    formErr.hidden = true;
    clearPw();
    clearField(confirm, confirmErr);
    var p = pw.value, valid = true;
    if (p.length < 8) { pwError("Use 8+ characters."); valid = false; }
    if (confirm.value !== p) { fieldErr(confirm, confirmErr, "Passwords don't match."); valid = false; }
    if (!valid) return;
    if (navigator.onLine === false) { say("No connection."); return; }
    busyOn(true);
    window.RecipesAuth.setPassword(token, p).then(function (res) {
      if (res.ok) {
        try { sessionStorage.setItem("recipes.passwordChanged", "1"); } catch (err) {}
        window.location.replace("/sign-in");
        return;
      }
      busyOn(false);
      if (res.kind === "noconnection") say("No connection.");
      else if (res.kind === "same") pwError("Use a new password.");
      else if (res.kind === "weak") pwError("Use 8+ characters.");
      else if (res.kind === "gone") showNotReset();
      else say("Couldn't set password. Try again.");
    });
  });
})();
