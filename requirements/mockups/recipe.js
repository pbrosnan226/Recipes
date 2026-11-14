/* Shared by recipe.html and recipe-phone.html: servings scaling, ingredient ticks, Favorite, Cook mode.
   Example data: French Toast, from the vault note. */
(function () {
  var NAME = "French Toast", BASE = 4;
  function f(n) { var w = Math.floor(n + 1e-9), r = n - w, m = { 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" }, s = m[Math.round(r * 100) / 100];
    if (r < 1e-9) return "" + w; if (!s) return "" + Math.round(n * 100) / 100; return (w ? w + " " : "") + s; }
  function u(q, a, b) { return f(q) + " " + (q == 1 ? a : b); }
  var I = [
    { id: "bread", q: 8, t: function (q) { return f(q) + " (1/2-inch thick) slices white bread"; }, s: function (q) { return u(q, "slice", "slices"); } },
    { id: "eggs", q: 6, t: function (q) { return u(q, "large egg", "large eggs"); }, s: function (q) { return u(q, "large egg", "large eggs"); } },
    { id: "sugar", q: 4, t: function (q) { return u(q, "tablespoon", "tablespoons") + " sugar, plus more for sprinkling"; }, s: function (q) { return u(q, "tablespoon", "tablespoons"); } },
    { id: "salt", t: function () { return "Pinch kosher salt"; }, s: function () { return "pinch"; } },
    { id: "cinnamon", t: function () { return "Pinch ground cinnamon"; }, s: function () { return "pinch"; } },
    { id: "nutmeg", t: function () { return "Pinch freshly grated nutmeg"; }, s: function () { return "pinch"; } },
    { id: "vanilla", q: .25, t: function (q) { return u(q, "teaspoon", "teaspoons") + " vanilla extract"; }, s: function (q) { return u(q, "teaspoon", "teaspoons"); } },
    { id: "milk", q: 2, t: function (q) { return u(q, "cup", "cups") + " whole milk"; }, s: function (q) { return u(q, "cup", "cups"); } },
    { id: "butter", q: 4, t: function (q) { return u(q, "tablespoon", "tablespoons") + " unsalted butter for the pan, plus more for serving"; }, s: function (q) { return u(q, "tablespoon", "tablespoons"); } },
    { id: "syrup", t: function () { return "Maple syrup, for serving"; }, s: function () { return "for serving"; } }];
  var S = [
    "Put a wire rack on a rimmed baking sheet in the oven and preheat to 200°F (93°C). If the bread is very fresh and moist, lay the slices ({bread}) in a single layer on the rack and toast them in the oven, turning once, until lightly toasted, about 10 minutes.",
    "Meanwhile, whisk the eggs ({eggs}), sugar ({sugar}), salt ({salt}), cinnamon ({cinnamon}), nutmeg ({nutmeg}), and vanilla ({vanilla}) together in a large bowl until thoroughly combined. Add the milk ({milk}) and whisk to blend.",
    "Heat butter (1 tablespoon) in a large non-stick or cast iron skillet over medium heat, swirling, until the foaming subsides, about 5 minutes. Soak 2 slices of bread in the egg mixture, turning, until saturated. Cook in the skillet, swirling occasionally, until browned on the bottom, about 3 minutes. Sprinkle the top with sugar (more, for sprinkling), flip, and cook, swirling occasionally, until browned on the second side, about 3 minutes more. Move the French toast to the rack in the oven in a single layer to keep warm, and repeat with the remaining bread and egg mixture.",
    "Serve with pats of butter (more) and maple syrup."];
  var done = {};
  function sc(i, n) { return i.q ? i.q * n / BASE : 0; }
  function draw() {
    var n = +document.getElementById("sv").value, by = {};
    I.forEach(function (i) { by[i.id] = i; });
    document.getElementById("ing").innerHTML = I.map(function (i) {
      return '<li class="' + (done[i.id] ? 'done' : '') + '"><label><input type="checkbox" data-id="' + i.id + '"' + (done[i.id] ? ' checked' : '') + '><span>' + i.t(sc(i, n)) + '</span></label></li>'; }).join("");
    document.getElementById("steps").innerHTML = S.map(function (s, k) {
      return '<li><span class="n">' + (k + 1) + '</span><p>' + s.replace(/\{(\w+)\}/g, function (_, key) { return by[key].s(sc(by[key], n)); }) + '</p></li>'; }).join("");
  }
  function favBtn() {
    var b = document.getElementById("fav"), on = Mock.favs().indexOf(NAME) > -1;
    b.className = "pill" + (on ? " on-sage" : ""); b.textContent = on ? "♥ Favorited" : "♡ Favorite"; b.setAttribute("aria-pressed", on);
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("sv").onchange = draw;
    document.getElementById("ing").onchange = function (e) { done[e.target.dataset.id] = e.target.checked; draw(); };
    document.getElementById("fav").onclick = function () {
      var a = Mock.favs(), k = a.indexOf(NAME); if (k > -1) a.splice(k, 1); else a.push(NAME); Mock.setFavs(a); favBtn(); };
    var cb = document.getElementById("cook");
    cb.onclick = function () { var on = document.body.classList.toggle("cook"); cb.textContent = on ? "Leave cook mode" : "Cook mode"; cb.className = "pill" + (on ? " on-dark" : ""); };
    draw(); favBtn();
  });
})();
