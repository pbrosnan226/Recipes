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

function page(title, bodyMain, scripts = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="/style.css">
<noscript><style>main>:not(noscript){display:none!important}</style></noscript>
</head>
<body>
<header class="hdr">
<a class="logo" href="/">Recipes</a>
<nav class="main"><a class="on" href="/">Browse</a></nav>
</header>
<main>
<noscript><p class="nojs empty">Turn on JavaScript to see recipes.</p></noscript>
${bodyMain}
</main>
<script src="/config.js"></script>
<script src="/scale.js"></script>
<script src="/auth.js"></script>
${scripts}
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
  for (const f of ["style.css", "scale.js", "auth.js", "home.js", "recipe-page.js", "create-account.js"]) fs.copyFileSync(path.join(staticDir, f), path.join(tmp, f));
  fs.cpSync(path.join(staticDir, "fonts"), path.join(tmp, "fonts"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, "config.js"),
    `window.RECIPES_CONFIG = ${JSON.stringify({ supabaseUrl: url[1].replace(/\/+$/, ""), supabaseKey: key[1] })};\n`
  );
  fs.writeFileSync(path.join(tmp, "robots.txt"), "User-agent: *\nDisallow: /\n");
  fs.writeFileSync(path.join(tmp, "index.html"), page("Recipes", `<div class="top"><h1>Everything we cook.</h1><div id="tools" style="display:contents"></div></div>\n<div id="home"></div>`, '<script src="/home.js"></script>'));
  fs.writeFileSync(path.join(tmp, "create-account.html"), page("Create account", `<section class="auth">
<h1>Create account</h1>
<form id="ca-form" novalidate>
<div class="field"><label for="ca-email">Email</label>
<input id="ca-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" aria-describedby="ca-email-err">
<p class="err" id="ca-email-err" role="alert" hidden></p></div>
<div class="field"><label for="ca-password">Password</label>
<input id="ca-password" name="password" type="password" autocomplete="new-password" aria-describedby="ca-password-help ca-password-err">
<p class="help" id="ca-password-help">8+ characters</p>
<p class="err" id="ca-password-err" role="alert" hidden></p></div>
<div class="field"><label for="ca-confirm">Confirm password</label>
<input id="ca-confirm" name="confirm" type="password" autocomplete="new-password" aria-describedby="ca-confirm-err">
<p class="err" id="ca-confirm-err" role="alert" hidden></p></div>
<p class="err form-err" id="ca-form-err" role="alert" hidden></p>
<button class="pill on-sage" id="ca-submit" type="submit">Create account</button>
</form>
<p class="alt">Have an account? <a href="/sign-in">Sign in</a></p>
</section>`, '<script src="/create-account.js"></script>'));
  // The Sign in page is only a stand-in until S-78: the title and the Create account link.
  fs.writeFileSync(path.join(tmp, "sign-in.html"), page("Sign in", `<section class="auth">
<h1>Recipes</h1>
<p class="alt"><a href="/create-account">Create account</a></p>
</section>`));
  fs.writeFileSync(path.join(tmp, "recipe.html"), page("Recipe", `<article id="recipe"></article>`, '<script src="/recipe-page.js"></script>'));
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
