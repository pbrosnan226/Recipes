// S-61: scales a recipe's ingredient amounts in the browser. No requests are made here.
// Browser: window.RecipeScale.scale(...). Node: require("./scale.js").scale(...).
// Same rounding and wording as scripts/scale/view.js (kept as a separate copy on purpose).
(function (root) {
  var glyph = { 0: "", 1: "⅛", 2: "¼", 3: "⅜", 4: "½", 5: "⅝", 6: "¾", 7: "⅞" };
  var odd = [[1 / 3, "⅓"], [2 / 3, "⅔"], [1 / 6, "⅙"], [5 / 6, "⅚"]];

  function num(n) {
    var w3 = Math.floor(n + 0.02), r3 = n - w3;
    for (var i = 0; i < odd.length; i++) {
      if (Math.abs(r3 - odd[i][0]) < 0.02) return (w3 ? w3 + " " : "") + odd[i][1];
    }
    var e16 = Math.round(n * 16);
    if (e16 % 2 && Math.abs(n * 16 - e16) < 0.05) {
      return (e16 >= 16 ? Math.floor(e16 / 16) + " " : "") + (e16 % 16) + "/16";
    }
    var e = Math.round(n * 8);
    var w = Math.floor(e / 8), f = glyph[e % 8];
    var out = (w ? String(w) : "") + (w && f ? " " : "") + f;
    var approx = Math.abs(n * 8 - e) > 0.2;
    return (approx ? "about " : "") + (out || "0");
  }

  function has(v) { return v !== null && v !== undefined; }

  // unit text with a leading space, or "" when the ingredient has no unit
  function unit(row, plural) {
    var s = row.unit_singular, p = row.unit_plural;
    if (!has(s) && !has(p)) return "";
    var u = plural ? p : s;
    return u ? " " + u : "";
  }

  function amountOf(row, k) {
    if (has(row.fixed_text) && row.fixed_text !== "") return row.fixed_text;
    if (!has(row.quantity)) return "";
    var q = Number(row.quantity);
    if (row.grams_before) {
      return Math.round(Number(row.grams_before) * k) + "g / " + num(q * k) + unit(row, q * k > 1);
    }
    if (has(row.quantity_high)) {
      var lo = q * k, hi = Number(row.quantity_high) * k;
      return num(lo).replace("about ", "") + "–" + num(hi) + unit(row, hi > 1);
    }
    var n = q * k;
    return num(n) + unit(row, n > 1);
  }

  function amount(row, k) {
    return (row.lead_text ? row.lead_text + " " : "") + amountOf(row, k);
  }

  // ingredients: recipe_ingredient rows in position order; steps: step texts in order
  // baseAmount: recipe.base_amount; servings: the chosen servings
  // Returns { groups: [{ name, rows: [{ key, name, text, amount }] }], steps: [text] }
  function scale(ingredients, steps, baseAmount, servings) {
    var base = Number(baseAmount) || 1;
    var k = (Number(servings) || base) / base;
    var byKey = {}, groups = [];
    ingredients.forEach(function (row) {
      var a = amount(row, k);
      byKey[row.ingredient_key] = a;
      if (row.hidden) return;
      var name = row.group_name || "";
      var g = null;
      for (var i = 0; i < groups.length; i++) if (groups[i].name === name) g = groups[i];
      if (!g) { g = { name: name, rows: [] }; groups.push(g); }
      g.rows.push({ key: row.ingredient_key, name: row.name, text: row.text_as_written, amount: a });
    });
    var filled = steps.map(function (t) {
      return t.replace(/\{(\w+)\}/g, function (m, key) {
        return Object.prototype.hasOwnProperty.call(byKey, key) ? byKey[key] : m;
      });
    });
    return { groups: groups, steps: filled };
  }

  var api = { scale: scale, num: num };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RecipeScale = api;
})(typeof window !== "undefined" ? window : this);
