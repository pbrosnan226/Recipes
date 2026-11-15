// Create account page (S-77). Wording from Workout's ux-copy.md, Create account.
(function () {
  var form = document.getElementById("ca-form");
  if (!form || !window.RecipesAuth) return;
  var $ = function (id) { return document.getElementById(id); };
  var email = $("ca-email"), pw = $("ca-password"), conf = $("ca-confirm");
  var emailErr = $("ca-email-err"), pwErr = $("ca-password-err"), pwHelp = $("ca-password-help");
  var confErr = $("ca-confirm-err"), formErr = $("ca-form-err"), btn = $("ca-submit");
  var busy = false;

  function setErr(input, el, text) {
    el.textContent = text;
    el.hidden = false;
    input.setAttribute("aria-invalid", "true");
  }
  function clearErr(input, el) {
    el.hidden = true;
    el.textContent = "";
    input.removeAttribute("aria-invalid");
  }
  function showPwErr() { pwHelp.hidden = true; setErr(pw, pwErr, "Use 8+ characters."); }
  function clearPwErr() { clearErr(pw, pwErr); pwHelp.hidden = false; }
  function emailTaken() {
    emailErr.textContent = "Email already has an account. ";
    var a = document.createElement("a");
    a.href = "/sign-in";
    a.textContent = "Sign in";
    emailErr.appendChild(a);
    emailErr.hidden = false;
    email.setAttribute("aria-invalid", "true");
  }
  function formError(text) { formErr.textContent = text; formErr.hidden = false; }
  function busyOn(on) {
    busy = on;
    btn.disabled = on;
    btn.textContent = on ? "Creating..." : "Create account";
  }

  email.addEventListener("input", function () { clearErr(email, emailErr); });
  pw.addEventListener("input", clearPwErr);
  conf.addEventListener("input", function () { clearErr(conf, confErr); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    formErr.hidden = true;
    clearErr(email, emailErr); clearPwErr(); clearErr(conf, confErr);
    var address = email.value.trim(), p = pw.value, valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { setErr(email, emailErr, "Enter a valid email."); valid = false; }
    if (p.length < 8) { showPwErr(); valid = false; }
    if (conf.value !== p) { setErr(conf, confErr, "Passwords don't match."); valid = false; }
    if (!valid) return;
    if (navigator.onLine === false) { formError("No connection."); return; }
    busyOn(true);
    window.RecipesAuth.signUp(address, p).then(function (res) {
      if (res.ok) { window.location.replace("/"); return; }
      busyOn(false);
      if (res.kind === "noconnection") formError("No connection.");
      else if (res.kind === "exists") emailTaken();
      else if (res.kind === "weak") showPwErr();
      else if (res.kind === "email") setErr(email, emailErr, "Enter a valid email.");
      else formError("Couldn't create account. Try again.");
    });
  });
})();
