#!/usr/bin/env node
// S-84: read every tag with the recipes that use it, and check/show a proposed cleanup table (W-15 steps 1-2).
// Read-only: only GETs on the recipes schema; it never writes to the database or Storage (S-84.1, S-84.11).
// Usage (from the repo root):
//   supabase/with-key.sh node supabase/tag-cleanup.js read             -> every tag and its recipes (S-84.1)
//   supabase/with-key.sh node supabase/tag-cleanup.js table table.json -> check the proposed table and show it
// table.json is the Extractor's proposal: [{"tag":"Side Dish","action":"rename","to":"side"}, {"tag":"x","action":"drop"}, {"tag":"y","action":"keep"}]
// "table" prints the whole old-to-new table plus the course tags to add (exit 0), or, when a new name or a
// resulting tag list fails the same checks as a new recipe (S-82), "TABLE FAILED" lines naming the tag (exit 1).
const { checkTags, COURSES } = require("./check-recipe");
const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";

// Every recipe with its course and its tags in order. Returns {ok, recipes:[{name, course, tags:[...]}]}.
async function readRecipes(key, fetchFn = fetch) {
  const url = `${URL_BASE}/rest/v1/recipe?select=name,course(name),recipe_tag(position,tag(name))&order=name.asc&limit=10000`;
  let res;
  try {
    res = await fetchFn(url, { headers: { apikey: key, Authorization: "Bearer " + key, "Accept-Profile": "recipes" } });
  } catch (e) { return { ok: false, why: "could not reach the database: " + e.message }; }
  const body = await res.text();
  if (!res.ok) return { ok: false, why: `${res.status} ${body}` };
  let rows;
  try { rows = JSON.parse(body); } catch (e) { return { ok: false, why: "unreadable answer from the database" }; }
  if (!Array.isArray(rows)) return { ok: false, why: "unexpected answer from the database" };
  const recipes = rows.map((r) => ({
    name: r.name,
    course: r.course ? r.course.name : null,
    tags: (r.recipe_tag || []).slice().sort((a, b) => a.position - b.position).map((x) => x.tag.name),
  }));
  return { ok: true, recipes };
}

// Every tag in use -> the recipes using it.
function tagUsage(recipes) {
  const usage = new Map();
  for (const r of recipes) for (const t of r.tags) {
    if (!usage.has(t)) usage.set(t, []);
    usage.get(t).push(r.name);
  }
  return new Map([...usage].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
}

// Apply a table to the recipes in memory. Returns {fails, rows, additions, result}.
function buildTable(table, recipes) {
  const fails = [];
  const usage = tagUsage(recipes);
  const entries = new Map();
  for (const e of Array.isArray(table) ? table : []) {
    if (!e || typeof e.tag !== "string") { fails.push("A table row has no tag."); continue; }
    if (!["keep", "rename", "drop"].includes(e.action)) fails.push(`Tag ${JSON.stringify(e.tag)}: action must be keep, rename or drop.`);
    else if (e.action === "rename" && (typeof e.to !== "string" || !e.to.trim())) fails.push(`Tag ${JSON.stringify(e.tag)}: a rename needs the new name.`);
    else if (!usage.has(e.tag)) fails.push(`Tag ${JSON.stringify(e.tag)} is not used by any recipe.`);
    else if (entries.has(e.tag)) fails.push(`Tag ${JSON.stringify(e.tag)} is in the table twice.`);
    else entries.set(e.tag, e);
  }
  for (const t of usage.keys()) if (!entries.has(t)) fails.push(`Tag ${JSON.stringify(t)} is missing from the table: mark it keep, rename or drop.`);
  if (fails.length) return { fails, rows: [], additions: [], result: [] };

  const newName = (t) => { const e = entries.get(t); return e.action === "drop" ? null : e.action === "rename" ? e.to : t; };
  const rows = [...usage].map(([t, rs]) => ({ tag: t, action: entries.get(t).action, to: newName(t), recipes: rs }));

  const additions = [];
  const result = recipes.map((r) => {
    // old order; a merge (two tags to one name) keeps the first position; dropped tags go
    let tags = [];
    for (const t of r.tags) { const n = newName(t); if (n !== null && !tags.includes(n)) tags.push(n); }
    // the recipe's course tag first (added when missing); nothing else is ever added
    if (COURSES.includes(r.course)) {
      const cw = r.course.toLowerCase();
      if (!tags.includes(cw)) additions.push({ recipe: r.name, tag: cw });
      tags = [cw, ...tags.filter((t) => t !== cw)];
    }
    return { name: r.name, course: r.course, before: r.tags, tags };
  });
  // S-84.7/S-84.8: the same code checks as a new recipe (S-82)
  for (const r of result) {
    for (const f of checkTags({ name: r.name, course: r.course, tags: r.tags })) {
      fails.push(`${f} (recipe ${JSON.stringify(r.name)}; check the table row for the tag involved)`);
    }
  }
  return { fails, rows, additions, result };
}

function render({ rows, additions, result }) {
  const out = ["OLD TAG -> ACTION -> NEW TAG (recipes that use it)"];
  for (const r of rows) {
    out.push(`- ${r.tag} -> ${r.action}${r.action === "rename" ? " -> " + r.to : ""} (${r.recipes.join("; ")})`);
  }
  out.push("", "COURSE TAGS TO ADD (recipes with a course that lacks it)");
  out.push(...(additions.length ? additions.map((a) => `- ${a.recipe}: add ${a.tag}`) : ["- none"]));
  const noCourse = result.filter((r) => !COURSES.includes(r.course)).map((r) => r.name);
  out.push("", "RECIPES WITH NO COURSE (no course tag added): " + (noCourse.length ? noCourse.join("; ") : "none"));
  out.push("", "TAGS AFTER THE CLEANUP");
  for (const r of result) out.push(`- ${r.name}: ${r.tags.join(", ") || "(no tags)"}`);
  return out.join("\n");
}

module.exports = { readRecipes, tagUsage, buildTable, render };

if (require.main === module) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const mode = process.argv[2];
  if (!["read", "table"].includes(mode)) { console.log("Usage: tag-cleanup.js read | table table.json"); process.exit(1); }
  if (!key) { console.log("TAG READ FAILED: SUPABASE_SERVICE_KEY is not set."); process.exit(1); }
  readRecipes(key).then((data) => {
    if (!data.ok) { console.log("TAG READ FAILED: " + data.why + "\nNothing was changed."); process.exit(1); }
    if (mode === "read") {
      const usage = tagUsage(data.recipes);
      console.log("TAGS AND THE RECIPES THAT USE THEM");
      for (const [t, rs] of usage) console.log(`- ${t} (${rs.length}): ${rs.join("; ")}`);
      console.log("\nRECIPES (course | tags in order)");
      for (const r of data.recipes) console.log(`- ${r.name} | ${r.course || "no course"} | ${r.tags.join(", ")}`);
      return;
    }
    let table;
    try { table = JSON.parse(require("fs").readFileSync(process.argv[3], "utf8")); }
    catch (e) { console.log("TABLE FAILED: could not read the table file: " + e.message + "\nNothing was changed."); process.exit(1); }
    const built = buildTable(table, data.recipes);
    if (built.fails.length) { console.log(built.fails.map((f) => "TABLE FAILED: " + f).join("\n") + "\nNothing was changed."); process.exit(1); }
    console.log(render(built));
  });
}
