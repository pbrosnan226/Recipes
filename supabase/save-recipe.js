#!/usr/bin/env node
// S-49: save a checked recipe and all its parts with recipes.save_recipe (one transaction:
// all of it is saved, or none of it). Saves the recipe only: no note, no file in images/, no photo.
// The photo is downloaded and uploaded afterwards, and only when this prints "SAVED" (S-49.9).
// Usage (from the repo root):  SUPABASE_SERVICE_KEY=... node supabase/save-recipe.js recipe.json
// Input: the recipe in the shape supabase/import-notes.js builds (see payload() there).
// Exit 0 and "SAVED <id>" on success. Exit 1 and "SAVE FAILED: <why>" otherwise; the caller tells
// the Owner and downloads and uploads no photo (S-49.8). The key is read from the environment only.
const { checkRecipe } = require("./check-recipe");

const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";

// S-49.2: lowercase, runs of spaces and punctuation become one hyphen.
const slugify = (name) => String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Fill in what the script owns (slug) and check the shape of what the save function relies on.
function prepare(recipe) {
  const r = { ...recipe };
  const problems = [];
  if (typeof r.name !== "string" || !r.name.trim()) problems.push("The recipe has no name.");
  else r.slug = slugify(r.name);
  if (r.slug === "") problems.push("The name leaves an empty slug.");
  // S-49.6: total_minutes is a whole number, empty when there is no total time.
  const blank = (v) => v === undefined || v === null || String(v).trim() === "";
  if (blank(r.total_time)) r.total_minutes = null;
  else if (r.total_minutes !== null && r.total_minutes !== undefined && !Number.isInteger(r.total_minutes)) {
    problems.push("total_minutes must be a whole number of minutes.");
  }
  // S-49.11: notes are level 0, or level 1 for a sub-note, and the first is level 0.
  const notes = Array.isArray(r.notes) ? r.notes : [];
  notes.forEach((n, i) => {
    if (n.level !== 0 && n.level !== 1) problems.push(`Note ${i + 1} must have level 0 or 1.`);
  });
  if (notes.length && notes[0].level !== 0) problems.push("The first note must be level 0.");
  return { recipe: r, problems };
}

async function saveRecipe(recipe, key, fetchFn = fetch) {
  const { recipe: r, problems } = prepare(recipe);
  const fails = [...problems, ...checkRecipe(r)];
  if (fails.length) return { ok: false, why: fails.join(" ") };
  let res;
  try {
    res = await fetchFn(`${URL_BASE}/rest/v1/rpc/save_recipe`, {
      method: "POST",
      headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", "Content-Profile": "recipes" },
      body: JSON.stringify({ j: r }),
    });
  } catch (e) {
    return { ok: false, why: "could not reach the database: " + e.message };
  }
  const body = await res.text();
  if (!res.ok) {
    let msg = body;
    try { msg = JSON.parse(body).message || body; } catch {}
    return { ok: false, why: `${res.status} ${msg}` };
  }
  let id = body;
  try { id = JSON.parse(body); } catch {}
  return { ok: true, id };
}

module.exports = { slugify, prepare, saveRecipe };

if (require.main === module) {
  const fs = require("fs");
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.log("SAVE FAILED: SUPABASE_SERVICE_KEY is not set."); process.exit(1); }
  let recipe;
  try { recipe = JSON.parse(fs.readFileSync(process.argv[2] || 0, "utf8")); }
  catch (e) { console.log("SAVE FAILED: could not read the recipe data: " + e.message); process.exit(1); }
  saveRecipe(recipe, key).then((out) => {
    console.log(out.ok ? "SAVED " + out.id : "SAVE FAILED: " + out.why);
    process.exit(out.ok ? 0 : 1);
  });
}
