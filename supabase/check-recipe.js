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
  // S-82 tags (plan: Data and rules, Tags; answers 107, 109, 110)
  fails.push(...checkTags(r));
  return fails;
}

// Words of a text, lowercase, a hyphen counting as a space.
const words = (t) => String(t).toLowerCase().split(/[\s-]+/).filter(Boolean);
const hasRun = (hay, needle) => {
  for (let i = 0; i + needle.length <= hay.length; i++) if (needle.every((w, k) => hay[i + k] === w)) return true;
  return false;
};

function checkTags(r) {
  const fails = [];
  const tags = Array.isArray(r.tags) ? r.tags : [];
  const courseWords = COURSES.map((c) => c.toLowerCase());
  const courseWord = COURSES.includes(r.course) ? r.course.toLowerCase() : null;
  const nameWords = words(r.name || "");
  const seen = new Set();
  tags.forEach((raw, n) => {
    const tag = String(raw);
    const q = JSON.stringify(tag);
    if (tag !== tag.toLowerCase()) fails.push(`Tag ${q} is not lowercase (tags must be lowercase).`);
    if (["recipe", "recipes"].includes(tag.trim().toLowerCase())) fails.push(`Tag ${q} is not allowed: "recipe" and "recipes" are never tags.`);
    const tw = words(tag);
    const isCourseTag = courseWords.includes(tw.join(" "));
    if (!isCourseTag && tw.length && nameWords.length && hasRun(nameWords, tw) && (tw.length >= 2 || nameWords.length === 1)) {
      fails.push(`Tag ${q} repeats the recipe's name or two or more consecutive words of it.`);
    }
    const key = tag.trim().toLowerCase();
    if (seen.has(key) || tags.findIndex((t) => t === raw) !== n) fails.push(`Tag ${q} appears more than once.`);
    seen.add(key);
  });
  const lower = tags.map((t) => String(t).trim().toLowerCase());
  if (courseWord) {
    const at = lower.reduce((a, t, i) => (t === courseWord ? a.concat(i) : a), []);
    if (!at.length) fails.push(`Missing course tag: a ${r.course} recipe must have "${courseWord}" as its first tag.`);
    else if (at.length > 1) fails.push(`Tag ${JSON.stringify(courseWord)} (the course word) appears more than once; it must appear once, first.`);
    else if (at[0] !== 0) fails.push(`Tag ${JSON.stringify(courseWord)} (the course word) must be the first tag, not number ${at[0] + 1}.`);
  } else if (blank(r.course)) {
    lower.forEach((t, i) => {
      if (courseWords.includes(t)) fails.push(`Tag ${JSON.stringify(tags[i])} is a course tag, but the recipe has no course.`);
    });
  }
  return fails;
}

module.exports = { checkRecipe, checkTags, COURSES };

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
