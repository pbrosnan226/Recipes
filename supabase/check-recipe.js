#!/usr/bin/env node
// S-48: check a recipe before it is saved. Pure checks: no network, no database, no files written.
// Input: the recipe in the shape supabase/import-notes.js builds for recipes.save_recipe.
// Usage:  node supabase/check-recipe.js recipe.json     (or JSON on stdin)
// Exit 0 and "OK" when every check passes; exit 1 and one line per failed check otherwise.
// When it fails, the caller saves nothing and uploads nothing (S-48.9) and tells the Owner (S-48.10).
const COURSES = ["Breakfast", "Main", "Side", "Soup", "Dessert", "Sauce"];
const blank = (v) => v === undefined || v === null || String(v).trim() === "";

function checkRecipe(r) {
  const fails = [];
  r = r || {};
  // S-48.2 source
  if (blank(r.source_url)) fails.push("No source: the recipe has no source address.");
  // S-48.3 created date (a real calendar date, YYYY-MM-DD)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(r.created ?? ""));
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!m || d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    fails.push("No created date: the recipe needs a valid date (YYYY-MM-DD).");
  }
  // S-48.4 what the source makes: an amount and servings or batches
  const amount = typeof r.base_amount === "number" ? r.base_amount : NaN;
  if (!(amount > 0) || blank(r.amount_noun)) {
    fails.push("No yield: the recipe must say what the source makes (an amount and servings or batches).");
  }
  // S-48.5 course
  if (!COURSES.includes(r.course)) {
    fails.push(`Invalid course: ${blank(r.course) ? "none given" : JSON.stringify(r.course)}; it must be one of ${COURSES.join(", ")}.`);
  }
  // S-48.6 every ingredient has a quantity or fixed text
  const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
  ings.forEach((i, n) => {
    const hasQty = typeof i.quantity === "number" && Number.isFinite(i.quantity);
    if (!hasQty && blank(i.fixed_text)) {
      fails.push(`Ingredient ${n + 1} (${i.name || i.key || "unnamed"}) has neither a quantity nor fixed text.`);
    }
  });
  // S-48.7 every {key} in a step is an ingredient key of this recipe
  const keys = new Set(ings.map((i) => i.key));
  (Array.isArray(r.steps) ? r.steps : []).forEach((s, n) => {
    for (const mm of String(s).matchAll(/\{([^{}]*)\}/g)) {
      if (!keys.has(mm[1])) fails.push(`Step ${n + 1} uses {${mm[1]}}, which is not an ingredient of this recipe.`);
    }
  });
  return fails;
}

module.exports = { checkRecipe, COURSES };

if (require.main === module) {
  const fs = require("fs");
  let recipe;
  try {
    recipe = JSON.parse(fs.readFileSync(process.argv[2] || 0, "utf8"));
  } catch (e) {
    console.log("Could not read the recipe data: " + e.message);
    process.exit(1);
  }
  const fails = checkRecipe(recipe);
  console.log(fails.length ? fails.join("\n") : "OK");
  process.exit(fails.length ? 1 : 0);
}
