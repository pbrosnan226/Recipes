#!/usr/bin/env node
// S-83: before saving, list the names of the tags that recipes use, so the Extractor can reuse one.
// Read-only: one GET on recipes.tag; it changes nothing in the database or in Storage.
// Names only (answer 112); a tag no recipe uses is left out.
// Usage (from the repo root):  supabase/with-key.sh node supabase/list-tags.js
// Prints "TAGS: a, b, c" (exit 0), or "NO TAGS" when none are used. If the list can't be read it
// prints "TAG LIST FAILED: <why>" (exit 1) and the Extractor saves nothing and tells the Owner.
const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";

async function listTags(key, fetchFn = fetch) {
  // recipe_tag!inner keeps only tags that have at least one recipe_tag row (S-83.3).
  const url = `${URL_BASE}/rest/v1/tag?select=name,recipe_tag!inner(recipe_id)&order=name.asc&limit=10000`;
  let res;
  try {
    res = await fetchFn(url, { headers: { apikey: key, Authorization: "Bearer " + key, "Accept-Profile": "recipes" } });
  } catch (e) {
    return { ok: false, why: "could not reach the database: " + e.message };
  }
  const body = await res.text();
  if (!res.ok) return { ok: false, why: `${res.status} ${body}` };
  let rows;
  try { rows = JSON.parse(body); } catch (e) { return { ok: false, why: "unreadable answer from the database" }; }
  if (!Array.isArray(rows)) return { ok: false, why: "unexpected answer from the database" };
  const tags = [...new Set(rows.map((r) => r.name))].sort();
  return { ok: true, tags };
}

module.exports = { listTags };

if (require.main === module) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.log("TAG LIST FAILED: SUPABASE_SERVICE_KEY is not set."); process.exit(1); }
  listTags(key).then((out) => {
    if (!out.ok) { console.log("TAG LIST FAILED: " + out.why); process.exit(1); }
    console.log(out.tags.length ? "TAGS: " + out.tags.join(", ") : "NO TAGS");
  });
}
