#!/usr/bin/env node
// Builds the static recipe site into site/dist from the recipe notes in the repo root.
//   S-01 read the notes (skipping unreadable ones, naming them in the log)
//   S-13 copy the photo files; S-02 write the list page, one page per recipe, robots.txt
//   S-03 fail (non-zero exit, nothing in dist) when no recipe is readable or anything else goes wrong
// RECIPE_ROOT overrides where the notes are (default: the repo root, the parent of site/).
const fs = require("fs");
const path = require("path");
const { readRecipes } = require("./lib/read");
const { loadRenderer, renderAll } = require("./lib/scale");
const { listPage, recipePage } = require("./lib/render");

const siteDir = __dirname;
const root = path.resolve(process.env.RECIPE_ROOT || path.join(siteDir, ".."));
const dist = path.join(siteDir, "dist");
const tmp = path.join(siteDir, "dist.tmp");

function slugify(name, used) {
  let base = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "recipe";
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  used.add(slug);
  return slug;
}

async function main() {
  // Nothing from an earlier run may be mistaken for this build's output.
  fs.rmSync(dist, { recursive: true, force: true });
  fs.rmSync(tmp, { recursive: true, force: true });

  console.log(`Reading recipe notes from ${root}`);
  const { recipes: read, skipped, warnings } = await readRecipes(root);
  for (const w of warnings) console.log(`NOTE   ${w.note}: ${w.message}`);

  const render = loadRenderer(root);
  const recipes = [];
  for (const r of read) {
    try {
      r.variants = renderAll(render, r);
      recipes.push(r);
    } catch (e) {
      skipped.push({ note: `${r.name}.md`, reason: `the scaler failed on it (${e.message})` });
    }
  }
  for (const s of skipped) console.log(`SKIPPED ${s.note}: ${s.reason}`);

  if (!recipes.length) {
    throw new Error(`No readable recipes were found in ${root} (${skipped.length} note(s) skipped, listed above).`);
  }

  recipes.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || (a.name < b.name ? -1 : 1));
  const used = new Set();
  for (const r of recipes) r.slug = slugify(r.name, used);

  fs.mkdirSync(path.join(tmp, "recipes"), { recursive: true });
  const staticDir = path.join(siteDir, "static");
  fs.cpSync(staticDir, tmp, { recursive: true });
  // S-13: copy each recipe's photo file, unchanged, into dist/images/ (the repo's images/ is only read).
  for (const r of recipes) {
    if (!r.photo) continue;
    const to = path.join(tmp, ...r.photo.split("/"));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(root, ...r.photo.split("/")), to);
  }
  fs.writeFileSync(path.join(tmp, "robots.txt"), "User-agent: *\nDisallow: /\n");
  fs.writeFileSync(path.join(tmp, "index.html"), listPage(recipes.map((r) => ({ name: r.name, site: r.site, tags: r.tags, course: r.course, photo: r.photo, href: `recipes/${r.slug}.html` }))));
  for (const r of recipes) fs.writeFileSync(path.join(tmp, "recipes", `${r.slug}.html`), recipePage(r, r.variants));

  fs.renameSync(tmp, dist);
  console.log(`Built ${recipes.length} recipe page(s) and the list into ${dist}; skipped ${skipped.length} note(s).`);
}

main().catch((e) => {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(dist, { recursive: true, force: true });
  console.error(`BUILD FAILED: ${e.message}`);
  process.exit(1);
});
