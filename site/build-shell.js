#!/usr/bin/env node
// The build Netlify runs (S-63): publishes the page shell into site/dist. It reads no note, no file in images/,
// and makes no request to Supabase. Recipes are loaded by the pages' scripts when a page is opened.
// Settings come from the build environment (the Netlify settings): the project address and the PUBLIC read-only key.
// The old note-reading build is still here: `npm run build:notes` (build.js).
const fs = require("fs");
const path = require("path");

const siteDir = __dirname;
const dist = path.join(siteDir, "dist");
const tmp = path.join(siteDir, "dist.tmp");
const staticDir = path.join(siteDir, "static");

const first = (...names) => names.map((n) => [n, (process.env[n] || "").trim()]).find(([, v]) => v);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function page(title, bodyMain) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header class="hdr">
<a class="logo" href="/">Recipes</a>
<nav class="main"><a class="on" href="/">Browse</a></nav>
</header>
<main>
${bodyMain}
</main>
<script src="/config.js"></script>
<script src="/scale.js"></script>
</body></html>
`;
}

function main() {
  const url = first("SUPABASE_URL");
  const key = first("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_KEY");
  const missing = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!key) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (missing.length) throw new Error(`Missing Netlify setting(s): ${missing.join(", ")}`);
  // Never publish a secret key by mistake.
  if (/^sb_secret_/.test(key[1]) || /"role"\s*:\s*"service_role"/.test(Buffer.from(key[1].split(".")[1] || "", "base64").toString())) {
    throw new Error("The key is not a public read-only key; refusing to publish it.");
  }

  fs.rmSync(dist, { recursive: true, force: true });
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  for (const f of ["style.css", "scale.js"]) fs.copyFileSync(path.join(staticDir, f), path.join(tmp, f));
  fs.cpSync(path.join(staticDir, "fonts"), path.join(tmp, "fonts"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, "config.js"),
    `window.RECIPES_CONFIG = ${JSON.stringify({ supabaseUrl: url[1].replace(/\/+$/, ""), supabaseKey: key[1] })};\n`
  );
  fs.writeFileSync(path.join(tmp, "robots.txt"), "User-agent: *\nDisallow: /\n");
  fs.writeFileSync(path.join(tmp, "index.html"), page("Recipes", `<div class="top"><h1>Everything we cook.</h1></div>\n<div class="grid" id="grid"></div>`));
  fs.writeFileSync(path.join(tmp, "recipe.html"), page("Recipe", `<article id="recipe"></article>`));
  fs.renameSync(tmp, dist);
  console.log(`Published the page shell into ${dist} (settings read from ${url[0]} and ${key[0]}).`);
}

try {
  main();
} catch (e) {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(dist, { recursive: true, force: true });
  console.error(`BUILD FAILED: ${e.message}`);
  process.exit(1);
}
