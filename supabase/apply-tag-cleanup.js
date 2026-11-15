#!/usr/bin/env node
// S-85: apply the Owner-confirmed old-to-new tag table (W-15 steps 3-4) in one all-or-nothing change, then report.
// Usage (from the repo root), only after the Owner confirmed the table shown by tag-cleanup.js:
//   supabase/with-key.sh node supabase/apply-tag-cleanup.js table.json
// It reads the recipes again, builds the result with tag-cleanup.js buildTable (same checks as the S-84 table),
// and sends every changed recipe's full new tag list to recipes.apply_tag_cleanup (supabase/apply-tag-cleanup.sql),
// which runs in one transaction. Exit 0 and "TAG CLEANUP APPLIED" plus the report, or exit 1 and
// "TAG CLEANUP FAILED: <why>" with "Nothing was changed." (the Extractor tells the Owner, S-85.10).
const { readRecipes, buildTable } = require("./tag-cleanup");
const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";

// What changes, from a built table: the recipes whose tag list changes, and the report lists (S-85.9).
function plan(table, recipes) {
  const built = buildTable(table, recipes);
  if (built.fails.length) return { ok: false, fails: built.fails };
  const same = (a, b) => a.length === b.length && a.every((t, i) => t === b[i]);
  const changes = built.result.filter((r) => !same(r.before, r.tags)).map((r) => ({ name: r.name, tags: r.tags }));
  const dropped = built.rows.filter((x) => x.action === "drop").map((x) => x.tag);
  // A new name that two or more old tags map to is a merge; a rename onto a name nobody else maps to is a plain rename.
  const groups = new Map();
  for (const x of built.rows) if (x.to !== null) groups.set(x.to, [...(groups.get(x.to) || []), x.tag]);
  const merged = [], renamed = [];
  for (const [to, olds] of groups) {
    if (olds.length > 1) merged.push({ from: olds, to });
    else if (olds[0] !== to) renamed.push({ from: olds[0], to });
  }
  return { ok: true, changes, report: { renamed, merged, dropped, added: built.additions, recipesChanged: changes.length } };
}

function renderReport(rp) {
  const list = (a, f) => (a.length ? a.map(f).join("; ") : "none");
  return [
    "RENAMED: " + list(rp.renamed, (x) => `${x.from} -> ${x.to}`),
    "MERGED: " + list(rp.merged, (x) => `${x.from.join(" + ")} -> ${x.to}`),
    "DROPPED: " + list(rp.dropped, (x) => x),
    "ADDED: " + list(rp.added, (x) => `${x.tag} on ${x.recipe}`),
    "RECIPES CHANGED: " + rp.recipesChanged,
  ].join("\n");
}

async function applyCleanup(table, key, fetchFn = fetch) {
  const data = await readRecipes(key, fetchFn);
  if (!data.ok) return { ok: false, why: data.why };
  const p = plan(table, data.recipes);
  if (!p.ok) return { ok: false, why: p.fails.join(" ") };
  if (p.changes.length) {
    let res;
    try {
      res = await fetchFn(`${URL_BASE}/rest/v1/rpc/apply_tag_cleanup`, {
        method: "POST",
        headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", "Content-Profile": "recipes" },
        body: JSON.stringify({ j: { recipes: p.changes } }),
      });
    } catch (e) { return { ok: false, why: "could not reach the database: " + e.message }; }
    const body = await res.text();
    if (!res.ok) {
      let msg = body;
      try { msg = JSON.parse(body).message || body; } catch {}
      return { ok: false, why: `${res.status} ${msg}` };
    }
  }
  return { ok: true, report: p.report };
}

module.exports = { plan, renderReport, applyCleanup };

if (require.main === module) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.log("TAG CLEANUP FAILED: SUPABASE_SERVICE_KEY is not set.\nNothing was changed."); process.exit(1); }
  let table;
  try { table = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8")); }
  catch (e) { console.log("TAG CLEANUP FAILED: could not read the table file: " + e.message + "\nNothing was changed."); process.exit(1); }
  applyCleanup(table, key).then((out) => {
    if (!out.ok) { console.log("TAG CLEANUP FAILED: " + out.why + "\nNothing was changed."); process.exit(1); }
    console.log("TAG CLEANUP APPLIED\n" + renderReport(out.report));
  });
}
