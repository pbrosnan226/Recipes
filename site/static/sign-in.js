// Sign in page (S-78). Wording from Workout's ux-copy.md, Sign in.
(function () {
  var form = document.getElementById("si-form");
  if (!form || !window.RecipesAuth) return;
  var email = document.getElementById("si-email"), pw = document.getElementById("si-password");
  var formErr = document.getElementById("si-form-err"), btn = document.getElementById("si-submit");
  var busy = false;

  // S-80.8: after a reset, "Password changed. Sign in with it." shows until the Visitor signs in or leaves this page.
  var notice = document.getElementById("si-notice");
  try {
    if (notice && sessionStorage.getItem("recipes.passwordChanged")) {
      sessionStorage.removeItem("recipes.passwordChanged");
      notice.textContent = "Password changed. Sign in with it.";
      notice.hidden = false;
    }
  } catch (e) {}

  function say(text) { formErr.textContent = text; formErr.hidden = false; }
  function busyOn(on) {
    busy = on;
    btn.disabled = on;
    btn.textContent = on ? "Signing in..." : "Sign in";
  }

  email.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); pw.focus(); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    formErr.hidden = true;
    var address = email.value.trim(), p = pw.value;
    if (!address || !p) { say("Wrong email or password."); return; }
    if (navigator.onLine === false) { say("No connection."); return; }
    busyOn(true);
    window.RecipesAuth.signIn(address, p).then(function (res) {
      if (res.ok) { window.location.replace("/"); return; }
      busyOn(false);
      if (res.kind === "noconnection") say("No connection.");
      else if (res.kind === "wrong") say("Wrong email or password.");
      else say("Couldn't sign in. Try again.");
    });
  });
})();
