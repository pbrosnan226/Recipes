#!/usr/bin/env node
// S-44: import the Owner-confirmed recipe notes into Supabase and upload their photos.
// Usage (from the repo root):  SUPABASE_SERVICE_KEY=... node supabase/import-notes.js
// The key is read from the environment only; it is never printed or written anywhere.
// Needs: supabase/save-recipe.sql applied, and `recipes` listed under Exposed schemas.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const { readRecipes } = require(path.join(root, "site", "lib", "read"));

const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "recipe-photos";
if (!KEY) {
  console.error("Set SUPABASE_SERVICE_KEY in your environment first.");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const nn = (v) => (v === undefined || v === null || v === "" ? null : v);

function payload(r, photoPath) {
  const notes = [];
  (r.notes || []).forEach((n) => {
    notes.push({ level: 0, text: n.text });
    (n.children || []).forEach((c) => notes.push({ level: 1, text: typeof c === "string" ? c : c.text }));
  });
  return {
    name: r.name,
    slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    course: nn(r.course),
    source_url: r.source,
    archived_url: nn(r.archived),
    site: nn(r.site),
    author: nn(r.author),
    description: nn(r.description),
    photo_path: photoPath,
    created: r.created,
    base_amount: r.base,
    amount_noun: r.noun,
    amount_noun_singular: nn(r.nounOne),
    servings_label: nn(r.dropdownLabel),
    prep_time: nn(r.times.prep),
    cook_time: nn(r.times.cook),
    total_time: nn(r.times.total),
    total_minutes: r.totalMinutes ?? null,
    nutrition_basis: nn(r.nutrition && r.nutrition.basis),
    aliases: r.aliases || [],
    tags: r.tags || [],
    serving_options: (r.options || []).map((o) => ({ amount: o.amount, label: nn(o.label) })),
    ingredients: r.scaleInput.ingredients.map((i) => ({
      key: i.id,
      name: i.name ?? "",
      text_as_written: i.text ?? "",
      group_name: nn(i.group),
      quantity: Array.isArray(i.q) ? i.q[0] : i.q ?? null,
      quantity_high: Array.isArray(i.q) ? i.q[1] : null,
      unit_singular: Array.isArray(i.u) ? i.u[0] : i.u ?? null,
      unit_plural: Array.isArray(i.u) ? i.u[1] : i.u ?? null,
      fixed_text: i.s ?? null,
      lead_text: nn(i.lead),
      grams_before: i.pre ?? null,
      hidden: !!i.hidden,
    })),
    steps: r.scaleInput.steps,
    notes,
    nutrients: ((r.nutrition && r.nutrition.nutrients) || []).map((x) => ({ name: x.name, amount: x.amount })),
  };
}

async function existingNames() {
  const res = await fetch(`${URL_BASE}/rest/v1/recipe?select=name`, { headers: { ...H, "Accept-Profile": "recipes" } });
  if (!res.ok) throw new Error("Could not list existing recipes: " + res.status + " " + (await res.text()));
  return new Set((await res.json()).map((x) => x.name));
}

async function upload(file) {
  const bytes = fs.readFileSync(path.join(root, "images", file));
  const type = /\.png$/i.test(file) ? "image/png" : /\.webp$/i.test(file) ? "image/webp" : "image/jpeg";
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { ...H, "Content-Type": type, "x-upsert": "true" },
    body: bytes,
  });
  if (!res.ok) throw new Error("photo upload failed: " + res.status + " " + (await res.text()));
}

async function removePhoto(file) {
  await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${encodeURIComponent(file)}`, { method: "DELETE", headers: H });
}

async function save(p) {
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/save_recipe`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json", "Content-Profile": "recipes" },
    body: JSON.stringify({ j: p }),
  });
  if (!res.ok) throw new Error("save failed: " + res.status + " " + (await res.text()));
}

(async () => {
  const confirmed = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, "confirmed-import.json"), "utf8")));
  const { recipes, skipped } = await readRecipes(root);
  const existing = await existingNames();
  const report = { imported: [], replaced: [], failed: [], missingPhoto: [], notConfirmed: [], unreadable: skipped };

  for (const r of recipes) {
    if (!confirmed.has(r.name)) { report.notConfirmed.push(r.name); continue; }
    try {
      let photoPath = null;
      if (r.photo) {
        const file = path.basename(r.photo);
        if (fs.existsSync(path.join(root, "images", file))) photoPath = file;
        else report.missingPhoto.push(`${r.name}: ${r.photo}`);
      }
      // Upload first, then save. If the save fails, a photo this run newly added is removed again,
      // so nothing of the recipe is left part-saved (S-44.16, S-44.17).
      if (photoPath) await upload(photoPath);
      try { await save(payload(r, photoPath)); }
      catch (e) {
        if (photoPath && !existing.has(r.name)) await removePhoto(photoPath).catch(() => {});
        throw e;
      }
      (existing.has(r.name) ? report.replaced : report.imported).push(r.name);
      console.log("ok  " + r.name);
    } catch (e) {
      report.failed.push(`${r.name}: ${e.message}`);
      console.log("FAIL " + r.name);
    }
  }
  console.log("\nImported:", report.imported.length, " Replaced:", report.replaced.length, " Failed:", report.failed.length);
  if (report.failed.length) console.log("Failed:\n  " + report.failed.join("\n  "));
  if (report.missingPhoto.length) console.log("Photo file missing in images/:\n  " + report.missingPhoto.join("\n  "));
  if (report.unreadable.length) console.log("Unreadable notes (not imported):", JSON.stringify(report.unreadable));
  if (report.notConfirmed.length) console.log("Not on the confirmed list (left alone):", report.notConfirmed.join(", "));
  process.exit(report.failed.length ? 1 : 0);
})().catch((e) => { console.error(e.message); process.exit(1); });
