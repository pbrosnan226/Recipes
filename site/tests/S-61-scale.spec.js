// S-61: scale.js is plain code; these tests need no browser and no network.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../..");
const scalePath = path.join(root, "site/static/scale.js");
const { scale } = require(scalePath);

const nn = (v) => (v === undefined || v === null || v === "" ? null : v);
const row = (o) => ({ ingredient_key: "a", name: "x", text_as_written: "x", group_name: null, quantity: null, quantity_high: null,
  unit_singular: null, unit_plural: null, fixed_text: null, lead_text: null, grams_before: null, hidden: false, ...o });
const one = (o, k = 1, base = 1) => scale([row(o)], ["{a}"], base, base * k).steps[0];

test("S-61.2 quantity scaled by servings / base", () => {
  expect(one({ quantity: 2, unit_singular: "cup", unit_plural: "cups" }, 1.5)).toBe("3 cups");
  expect(scale([row({ quantity: 2 })], ["{a}"], 4, 8).steps[0]).toBe("4");
  expect(scale([row({ quantity: 2 })], ["{a}"], 4, 2).steps[0]).toBe("1");
});
test("S-61.3 fixed text unchanged at every size", () => {
  for (const k of [0.5, 1, 3]) expect(one({ fixed_text: "a pinch", quantity: 2, unit_singular: "cup", unit_plural: "cups" }, k)).toBe("a pinch");
});
test("S-61.4 fraction glyphs and rounding", () => {
  expect(one({ quantity: 0.5 })).toBe("½");
  expect(one({ quantity: 1 }, 1 + 1 / 3)).toBe("1 ⅓");
  expect(one({ quantity: 0.0625 })).toBe("1/16");
  expect(one({ quantity: 0.3 })).toBe("about ¼");
});
test("S-61.5 range uses en dash, no about on low", () => {
  expect(one({ quantity: 0.5, quantity_high: 1 })).toBe("½–1");
  expect(one({ quantity: 0.3, quantity_high: 1 })).toBe("¼–1");
  expect(one({ quantity: 1, quantity_high: 2, unit_singular: "cup", unit_plural: "cups" })).toBe("1–2 cups");
});
test("S-61.6 singular at 1 or less, plural above 1", () => {
  const u = { unit_singular: "cup", unit_plural: "cups" };
  expect(one({ quantity: 0.5, ...u })).toBe("½ cup");
  expect(one({ quantity: 1, ...u })).toBe("1 cup");
  expect(one({ quantity: 1.5, ...u })).toBe("1 ½ cups");
  expect(one({ quantity: 0.5, quantity_high: 1, ...u })).toBe("½–1 cup");
  expect(one({ quantity: 1, quantity_high: 2, ...u })).toBe("1–2 cups");
  expect(one({ quantity: 2, unit_singular: "g", unit_plural: "g" })).toBe("2 g");
});
test("S-61.7 grams before, whole number", () => {
  const u = { unit_singular: "cup", unit_plural: "cups" };
  expect(one({ quantity: 1, grams_before: 120, ...u })).toBe("120g / 1 cup");
  expect(one({ quantity: 1, grams_before: 120, ...u }, 1.5)).toBe("180g / 1 ½ cups");
  expect(one({ quantity: 1, grams_before: 100, ...u }, 1 / 3)).toBe("33g / ⅓ cup");
});
test("S-61.8 lead text before amount", () => {
  expect(one({ quantity: 2, lead_text: "up to", unit_singular: "cup", unit_plural: "cups" })).toBe("up to 2 cups");
});
test("S-61.9 hidden left out of list, still used in steps", () => {
  const rows = [row({ ingredient_key: "a", quantity: 2, hidden: true }), row({ ingredient_key: "b", quantity: 1 })];
  const r = scale(rows, ["use {a} and {b}"], 1, 2);
  expect(r.groups.flatMap((g) => g.rows.map((x) => x.key))).toEqual(["b"]);
  expect(r.steps[0]).toBe("use 4 and 2");
});
test("S-61.10 {key} replaced, unknown left as written", () => {
  const r = scale([row({ ingredient_key: "salt", quantity: 1 })], ["add {salt}, {nope} and {salt}"], 1, 2);
  expect(r.steps[0]).toBe("add 2, {nope} and 2");
});
test("S-61.12 browser code separate from view.js, which is unchanged", () => {
  const src = fs.readFileSync(scalePath, "utf8");
  expect(src.replace(/^\s*\/\/.*$/gm, "")).not.toMatch(/require\(|import /);
  expect(src).toContain("window");
  expect(fs.readFileSync(path.join(root, "scripts/scale/view.js"), "utf8")).not.toContain("RecipeScale");
  const { execSync } = require("child_process");
  expect(execSync("git status --porcelain scripts/scale/view.js", { cwd: root }).toString().trim()).toBe("");
  // exposes window.RecipeScale in a browser-like global
  const w = {};
  new Function("window", src.replace(/typeof window !== "undefined" \? window : this/, "window"))(w);
  expect(typeof w.RecipeScale.scale).toBe("function");
});
test("S-61.11 identical to scripts/scale/view.js for every recipe and servings option", async () => {
  test.setTimeout(120000);
  const { readRecipes } = require(path.join(root, "site/lib/read"));
  const src = fs.readFileSync(path.join(root, "scripts/scale/view.js"), "utf8");
  const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
  const { recipes } = await readRecipes(root);
  expect(recipes.length).toBe(26);
  let checks = 0;
  for (const r of recipes) {
    const rows = r.scaleInput.ingredients.map((i) => ({
      ingredient_key: i.id, name: i.name ?? "", text_as_written: i.text ?? "", group_name: nn(i.group),
      quantity: Array.isArray(i.q) ? i.q[0] : i.q ?? null, quantity_high: Array.isArray(i.q) ? i.q[1] : null,
      unit_singular: Array.isArray(i.u) ? i.u[0] : i.u ?? null, unit_plural: Array.isArray(i.u) ? i.u[1] : i.u ?? null,
      fixed_text: i.s ?? null, lead_text: nn(i.lead), grams_before: i.pre ?? null, hidden: !!i.hidden }));
    const opts = (r.options || []).map((o) => o.amount);
    if (!opts.includes(r.base)) opts.push(r.base);
    for (const w of opts) {
      const out = [];
      const dv = { current: () => ({ [r.scaleInput.prop || "servings_wanted"]: w }), header: (l, t) => out.push("H" + l + t),
        table: (h, rs) => rs.forEach((x) => out.push("R" + x[0] + "|" + x[1] + "|" + x[2])), paragraph: (t) => out.push("P" + t) };
      await new AsyncFn("dv", "input", src)(dv, r.scaleInput);
      const m = scale(rows, r.scaleInput.steps, r.base, w);
      const mine = ["H2Ingredients"];
      m.groups.forEach((g) => { if (g.name) mine.push("H3" + g.name); g.rows.forEach((x) => mine.push("R" + x.name + "|" + x.text + "|" + x.amount)); });
      mine.push("H2Instructions", "P" + m.steps.map((t, i) => `${i + 1}. ${t}`).join("\n"));
      expect(mine, `${r.name} @ ${w}`).toEqual(out);
      checks++;
    }
  }
  expect(checks).toBeGreaterThan(26);
});
