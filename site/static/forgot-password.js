// Forgot password page (S-79). Wording from Workout's ux-copy.md, Forgot password.
(function () {
  var form = document.getElementById("fp-form");
  if (!form || !window.RecipesAuth) return;
  var email = document.getElementById("fp-email"), emailErr = document.getElementById("fp-email-err");
  var sent = document.getElementById("fp-sent"), formErr = document.getElementById("fp-form-err");
  var btn = document.getElementById("fp-submit");
  var busy = false;

  function emailError() {
    emailErr.textContent = "Enter a valid email.";
    emailErr.hidden = false;
    email.setAttribute("aria-invalid", "true");
  }
  function clearEmailError() {
    emailErr.hidden = true;
    emailErr.textContent = "";
    email.removeAttribute("aria-invalid");
  }
  function say(text) { formErr.textContent = text; formErr.hidden = false; }
  function busyOn(on) {
    busy = on;
    btn.disabled = on;
    btn.textContent = on ? "Sending..." : "Send reset link";
  }

  email.addEventListener("input", clearEmailError);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    clearEmailError();
    sent.hidden = true;
    formErr.hidden = true;
    var address = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { emailError(); return; }
    if (navigator.onLine === false) { say("No connection."); return; }
    busyOn(true);
    window.RecipesAuth.resetPassword(address).then(function (res) {
      busyOn(false);
      if (res.ok) { sent.textContent = "If it has an account, a link is on its way."; sent.hidden = false; }
      else if (res.kind === "noconnection") say("No connection.");
      else if (res.kind === "toomany") say("Too many emails. Try again in an hour.");
      else if (res.kind === "email") emailError();
      else say("Couldn't send reset link. Try again.");
    });
  });
})();
