// Dataview view: renders the scaled ingredient tables and instructions for a recipe note.
// Called from the note as: await dv.view("scripts/scale", { base, prop, noun, ingredients, steps })
//   base         servings the source makes (1 when it gives no yield)
//   prop         frontmatter property the dropdown writes to (default servings_wanted)
//   noun         label after the number in the column header (default "servings")
//   nounOne      its singular, when dropping the final s isn't enough ("batches" / "batch")
//   ingredients  [{ id, name, text, q, u, group }]
//                  text  the source's line, shown in the "As written" column
//                  q     amount as written: a number, or [low, high] for a range; omit for
//                        "to taste" / "pinch" and set s to the text to show at every size
//                  u     unit, or [singular, plural]
//                  s     fixed text shown at every size
//                  lead  text shown before the scaled amount ("up to")
//                  pre   grams of a "250g / ½ lb" pair, scaled and shown before the amount
//                  group a sub-heading the source itself names
//                  hidden true for a portion of another ingredient ("1 teaspoon of the salt"):
//                         usable in steps, left out of the table
//   steps        strings; {id} is replaced by the scaled amount of that ingredient
const base = input.base || 1;
const prop = input.prop || "servings_wanted";
const noun = input.noun || "servings";
const want = Number(dv.current()[prop]) || base;
const k = want / base;

const glyph = { 0: "", 1: "⅛", 2: "¼", 3: "⅜", 4: "½", 5: "⅝", 6: "¾", 7: "⅞" };
const odd = [[1 / 3, "⅓"], [2 / 3, "⅔"], [1 / 6, "⅙"], [5 / 6, "⅚"]];
const num = (n) => {
  const w3 = Math.floor(n + 0.02), r3 = n - w3;
  for (const [v, g] of odd) {
    if (Math.abs(r3 - v) < 0.02) return (w3 ? w3 + " " : "") + g;
  }
  const e16 = Math.round(n * 16);
  if (e16 % 2 && Math.abs(n * 16 - e16) < 0.05) {
    return (e16 >= 16 ? Math.floor(e16 / 16) + " " : "") + (e16 % 16) + "/16";
  }
  const e = Math.round(n * 8);
  const w = Math.floor(e / 8), f = glyph[e % 8];
  const out = (w ? String(w) : "") + (w && f ? " " : "") + f;
  const approx = Math.abs(n * 8 - e) > 0.2;
  return (approx ? "about " : "") + (out || "0");
};
const unit = (u, plural) => (!u ? "" : " " + (Array.isArray(u) ? (plural ? u[1] : u[0]) : u));
const amount = (ing) => (ing.lead ? ing.lead + " " : "") + amountOf(ing);
const amountOf = (ing) => {
  if (ing.s !== undefined) return ing.s;
  const q = ing.q;
  if (ing.pre) return Math.round(ing.pre * k) + "g / " + num(q * k) + unit(ing.u, q * k > 1);
  if (Array.isArray(q)) {
    const [lo, hi] = q.map((x) => x * k);
    return num(lo).replace("about ", "") + "–" + num(hi) + unit(ing.u, hi > 1);
  }
  const n = q * k;
  return num(n) + unit(ing.u, n > 1);
};

const byId = {};
for (const ing of input.ingredients) byId[ing.id] = amount(ing);

dv.header(2, "Ingredients");
const groups = [];
for (const ing of input.ingredients) {
  if (ing.hidden) continue;
  let g = groups.find((x) => x.name === (ing.group || ""));
  if (!g) groups.push((g = { name: ing.group || "", rows: [] }));
  g.rows.push([ing.name, ing.text, byId[ing.id]]);
}
const nounFor = (n) => (n === 1 ? input.nounOne || noun.replace(/s$/, "") : noun);
const head = ["Ingredient", `As written (${base} ${nounFor(base)})`, `For ${want} ${nounFor(want)}`];
for (const g of groups) {
  if (g.name) dv.header(3, g.name);
  dv.table(head, g.rows);
}

dv.header(2, "Instructions");
const fill = (t) => t.replace(/\{(\w+)\}/g, (m, id) => (id in byId ? byId[id] : m));
dv.paragraph(input.steps.map((t, i) => `${i + 1}. ${fill(t)}`).join("\n"));
