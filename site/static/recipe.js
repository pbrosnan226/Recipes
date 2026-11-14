(function () {
  var data = document.getElementById("variants");
  var variants = JSON.parse(data.textContent);
  var def = Number(data.dataset.default);
  var $sv = document.getElementById("sv");
  var amts = document.querySelectorAll("#ing .amt");
  var steps = document.querySelectorAll("#steps p");
  var $cook = document.getElementById("cook");
  var lock = null;

  // Servings: only the amounts and the steps change, so ticked ingredients stay ticked (S-37.7).
  function draw() {
    var v = variants[Number($sv.value)] || variants[def];
    for (var i = 0; i < amts.length; i++) amts[i].textContent = v.amts[i];
    for (var j = 0; j < steps.length; j++) steps[j].innerHTML = v.steps[j];
  }
  $sv.addEventListener("change", draw);

  // Ticking strikes the ingredient through. Nothing is saved.
  document.getElementById("ing").addEventListener("change", function (e) {
    var li = e.target.closest("li");
    if (li) li.classList.toggle("done", e.target.checked);
  });

  // Cook mode: larger steps, and the screen is kept awake where the browser allows it.
  function cooking() { return document.body.classList.contains("cook"); }
  function acquire() {
    if (!cooking() || (lock && lock.released === false) || !navigator.wakeLock || !navigator.wakeLock.request) return;
    try {
      Promise.resolve(navigator.wakeLock.request("screen")).then(function (s) {
        if (!cooking()) { quiet(s); return; }
        lock = s;
        if (s.addEventListener) s.addEventListener("release", function () { if (lock === s) lock = null; });
      }, function () {});
    } catch (e) { /* the larger steps still apply */ }
  }
  function release() {
    var s = lock;
    lock = null;
    if (s) quiet(s);
  }
  function quiet(s) {
    try { Promise.resolve(s.release()).catch(function () {}); } catch (e) { /* already released */ }
  }
  function setCook(on) {
    document.body.classList.toggle("cook", on);
    $cook.textContent = on ? "Leave cook mode" : "Cook mode";
    $cook.classList.toggle("on-dark", on);
    $cook.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) acquire(); else release();
  }
  $cook.addEventListener("click", function () { setCook(!cooking()); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") acquire(); });
  window.addEventListener("pagehide", release);

  // Always start at what the source makes with Cook mode off and nothing ticked,
  // even when the browser restores the old state.
  function reset() {
    $sv.value = String(def);
    draw();
    setCook(false);
    Array.prototype.forEach.call(document.querySelectorAll("#ing input"), function (c) { c.checked = false; c.closest("li").classList.remove("done"); });
  }
  window.addEventListener("pageshow", reset);
  reset();
})();
