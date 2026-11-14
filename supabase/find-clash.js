#!/usr/bin/env node
// S-50: before saving, find an existing recipe with the same name or the same slug. Read-only:
// one GET on recipes.recipe; it changes nothing in the database or in Storage.
// Usage (from the repo root):  SUPABASE_SERVICE_KEY=... node supabase/find-clash.js recipe.json
// Prints "NO CLASH" (exit 0), or one "CLASH ..." line per existing recipe (exit 2) that the
// Extractor tells the Owner about, then asks for OK before running save-recipe.js. Exit 1 on error.
const { slugify } = require("./save-recipe");

const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";

async function findClashes(recipe, key, fetchFn = fetch) {
  const name = String(recipe.name || "").trim();
  const slug = slugify(name);
  if (!name || !slug) return { ok: false, why: "The recipe has no usable name." };
  const q = (v) => '"' + v.replace(/(["\\])/g, "\\$1") + '"';
  const filter = `(name.eq.${q(name)},slug.eq.${q(slug)})`;
  const url = `${URL_BASE}/rest/v1/recipe?select=id,name,slug,photo_path&or=${encodeURIComponent(filter)}`;
  let res;
  try {
    res = await fetchFn(url, { headers: { apikey: key, Authorization: "Bearer " + key, "Accept-Profile": "recipes" } });
  } catch (e) {
    return { ok: false, why: "could not reach the database: " + e.message };
  }
  const body = await res.text();
  if (!res.ok) return { ok: false, why: `${res.status} ${body}` };
  const rows = JSON.parse(body);
  const clashes = rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, photo_path: r.photo_path || null,
    // S-50.1: same name, or a different name with the same slug.
    reason: r.name === name ? "same name" : "different name, same slug",
  }));
  return { ok: true, clashes };
}

module.exports = { findClashes };

if (require.main === module) {
  const fs = require("fs");
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.log("CLASH CHECK FAILED: SUPABASE_SERVICE_KEY is not set."); process.exit(1); }
  let recipe;
  try { recipe = JSON.parse(fs.readFileSync(process.argv[2] || 0, "utf8")); }
  catch (e) { console.log("CLASH CHECK FAILED: could not read the recipe data: " + e.message); process.exit(1); }
  findClashes(recipe, key).then((out) => {
    if (!out.ok) { console.log("CLASH CHECK FAILED: " + out.why); process.exit(1); }
    if (!out.clashes.length) { console.log("NO CLASH"); return process.exit(0); }
    for (const c of out.clashes) {
      console.log(`CLASH "${c.name}" (slug ${c.slug}): ${c.reason}; photo file: ${c.photo_path || "none"}`);
    }
    process.exit(2);
  });
}
