(function () {
  var rows = JSON.parse(document.getElementById("data").textContent);
  var cards = Array.prototype.slice.call(document.querySelectorAll("#grid .card"));
  var grid = document.getElementById("grid");
  var $q = document.getElementById("q");
  var $sort = document.getElementById("sort");
  var $count = document.getElementById("count");
  var $none = document.getElementById("none");
  var chips = Array.prototype.slice.call(document.querySelectorAll("#chips .chip"));
  var course = "All";

  function cmp(x, y) { return x.toLowerCase().localeCompare(y.toLowerCase(), "en"); }

  function draw() {
    var t = $q.value.trim().toLowerCase();
    var key = $sort.value;
    var list = rows.map(function (r, i) { return i; }).filter(function (i) {
      var r = rows[i];
      if (course !== "All" && r.course !== course) return false;
      if (!t) return true;
      return [r.name, r.site].concat(r.tags).some(function (f) { return f && f.toLowerCase().indexOf(t) > -1; });
    });
    list.sort(function (a, b) {
      var A = rows[a], B = rows[b];
      if (key === "site") {
        if (!A.site !== !B.site) return !A.site ? 1 : -1; // no site last
        if (A.site) { var c = cmp(A.site, B.site); if (c) return c; }
      }
      return cmp(A.name, B.name);
    });
    cards.forEach(function (c) { c.hidden = true; });
    list.forEach(function (i) { cards[i].hidden = false; grid.appendChild(cards[i]); });
    $count.textContent = list.length + (list.length === 1 ? " recipe" : " recipes");
    $none.hidden = list.length > 0;
    chips.forEach(function (c) {
      var on = c.dataset.c === course;
      c.classList.toggle("on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  chips.forEach(function (c) { c.addEventListener("click", function () { course = c.dataset.c; draw(); }); });
  $sort.addEventListener("change", draw);
  $q.addEventListener("input", draw);
  grid.addEventListener("click", function (e) {
    var g = e.target.closest && e.target.closest("a[data-tag]");
    if (g) { e.preventDefault(); $q.value = g.dataset.tag; draw(); window.scrollTo(0, 0); }
  });
  function start() {
    course = "All";
    $sort.value = "name";
    $q.value = new URLSearchParams(location.search).get("q") || "";
    draw();
  }
  window.addEventListener("pageshow", function (e) { if (e.persisted) start(); });
  start();
})();
