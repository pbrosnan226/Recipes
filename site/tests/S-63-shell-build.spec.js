// S-63: the page-shell build (build-shell.js). Builds into a temp copy of the code, so site/dist is never touched.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const root = path.resolve(siteDir, "..");
const URL_ = "https://wbeaswhbzkqmxcsweisu.supabase.co";
const KEY = "sb_publishable_mS_LpC99jJUlk8Ljxp-jUw_epJ7l0gt";

function build(env, { withNotes = false } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s63-"));
  const code = path.join(tmp, "site");
  fs.mkdirSync(code);
  fs.copyFileSync(path.join(siteDir, "build-shell.js"), path.join(code, "build-shell.js"));
  fs.cpSync(path.join(siteDir, "static"), path.join(code, "static"), { recursive: true });
  if (withNotes) {
    // a note that is unreadable-looking and an image: the build must not touch them (they are placed beside the code)
    fs.writeFileSync(path.join(tmp, "Some Dish.md"), "---\nname: Some Dish\n---\nSECRET-NOTE-TEXT\n");
    fs.mkdirSync(path.join(tmp, "images"));
  }
  const clean = { PATH: process.env.PATH, HOME: process.env.HOME };
  const r = spawnSync("node", ["build-shell.js"], { cwd: code, env: { ...clean, ...env }, encoding: "utf8" });
  const dist = path.join(code, "dist");
  return { r, dist, tmp, code };
}
const code = (f) => fs.readFileSync(path.join(siteDir, f), "utf8").replace(/^\s*\/\/.*$/gm, ""); // source without comment lines
const good = { SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: KEY };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const html = (dist) => walk(dist).filter((f) => f.endsWith(".html"));

test("S-63.1 publishes Home, /recipe, styles, scripts and fonts", async () => {
  const { r, dist } = build(good);
  expect(r.status, r.stderr).toBe(0);
  for (const f of ["index.html", "recipe.html", "style.css", "scale.js", "config.js"]) expect(fs.existsSync(path.join(dist, f)), f).toBe(true);
  const fonts = fs.readdirSync(path.join(dist, "fonts")).filter((f) => f.endsWith(".woff2"));
  expect(fonts.length).toBeGreaterThanOrEqual(5);
  // every script/stylesheet a page references is published
  for (const h of html(dist)) {
    const t = fs.readFileSync(h, "utf8");
    for (const m of t.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
      if (m[1] === "/") continue;
      expect(fs.existsSync(path.join(dist, m[1])), `${m[1]} referenced by ${path.basename(h)}`).toBe(true);
    }
  }
  // style.css fonts exist
  const css = fs.readFileSync(path.join(dist, "style.css"), "utf8");
  for (const m of css.matchAll(/url\(["']?\/?(fonts\/[^)"']+)/g)) expect(fs.existsSync(path.join(dist, m[1])), m[1]).toBe(true);
});

test("S-63.2 publishes the project address and public key from the settings, readable by scripts", async () => {
  const { r, dist } = build(good);
  expect(r.status, r.stderr).toBe(0);
  const cfg = fs.readFileSync(path.join(dist, "config.js"), "utf8");
  const win = {};
  new Function("window", cfg)(win);
  expect(win.RECIPES_CONFIG).toEqual({ supabaseUrl: URL_, supabaseKey: KEY });
  // trailing slash trimmed, other values flow through
  const b = build({ SUPABASE_URL: "https://example.supabase.co/", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_other" });
  const w2 = {};
  new Function("window", fs.readFileSync(path.join(b.dist, "config.js"), "utf8"))(w2);
  expect(w2.RECIPES_CONFIG).toEqual({ supabaseUrl: "https://example.supabase.co", supabaseKey: "sb_publishable_other" });
  // a missing setting fails the build and publishes nothing
  const m = build({ SUPABASE_URL: URL_ });
  expect(m.r.status).not.toBe(0);
  expect(m.r.stderr).toContain("SUPABASE_PUBLISHABLE_KEY");
  expect(fs.existsSync(m.dist)).toBe(false);
});

test("S-63.3 the build reads no note or image and makes no Supabase request", async () => {
  const src = code("build-shell.js");
  expect(src).not.toMatch(/fetch\(|https?\.(get|request)|require\(["'](https?|net|node:https?)["']\)|XMLHttp|js-yaml|images/);
  expect(src).not.toMatch(/\.md["'`]/);
  // behaviour: an unreachable network and notes beside the code change nothing
  const { r, dist } = build({ ...good, HTTPS_PROXY: "http://127.0.0.1:1", NODE_OPTIONS: "" }, { withNotes: true });
  expect(r.status, r.stderr).toBe(0);
  for (const f of walk(dist)) expect(fs.readFileSync(f).toString("latin1")).not.toContain("SECRET-NOTE-TEXT");
  expect(fs.existsSync(path.join(dist, "images"))).toBe(false);
});

test("S-63.4 no page for any single recipe", async () => {
  const { r, dist } = build(good, { withNotes: true });
  expect(r.status, r.stderr).toBe(0);
  expect(html(dist).map((f) => path.relative(dist, f)).sort()).toEqual(["index.html", "recipe.html"]);
  expect(fs.existsSync(path.join(dist, "recipes"))).toBe(false);
});

test("S-63.5 netlify.toml holds the redirect for the old recipe addresses", async () => {
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  const block = toml.split("[[redirects]]")[1];
  expect(block).toBeTruthy();
  expect(block).toMatch(/from\s*=\s*"\/recipes\/:slug\.html"/);
  expect(block).toMatch(/to\s*=\s*"\/recipe\?name=:slug"/);
  expect(block).toMatch(/status\s*=\s*301/);
  // the build does not need to write a _redirects file; none must contradict the toml
  const { dist } = build(good);
  expect(fs.existsSync(path.join(dist, "_redirects"))).toBe(false);
});

test("S-63.6 published files hold no key other than the public read-only key", async () => {
  const { r, dist } = build({ ...good, SUPABASE_SERVICE_ROLE_KEY: "sb_secret_SHOULD_NOT_APPEAR", SUPABASE_SECRET_KEY: "sb_secret_NOPE" });
  expect(r.status, r.stderr).toBe(0);
  const all = walk(dist).map((f) => fs.readFileSync(f, "latin1")).join("\n");
  expect(all).toContain(KEY);
  expect(all).not.toMatch(/sb_secret_/);
  expect(all).not.toMatch(/service_role/);
  expect(all).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./); // no JWT-style key
  // a secret in the key setting is refused and nothing is published
  for (const bad of ["sb_secret_abc123", "x." + Buffer.from('{"role":"service_role"}').toString("base64") + ".y"]) {
    const b = build({ SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: bad });
    expect(b.r.status).not.toBe(0);
    expect(fs.existsSync(b.dist)).toBe(false);
  }
});

test("S-63.7 the published site saves nothing", async () => {
  const { dist } = build(good);
  const scripts = walk(dist).filter((f) => f.endsWith(".js"));
  for (const f of scripts) {
    const t = fs.readFileSync(f, "utf8");
    expect(t, f).not.toMatch(/method\s*:\s*["'`](POST|PUT|PATCH|DELETE)/i);
    expect(t, f).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon/);
    expect(t, f).not.toMatch(/\/rpc\/|save_recipe/);
  }
  for (const h of html(dist)) expect(fs.readFileSync(h, "utf8")).not.toMatch(/<form|<input[^>]*type="?(file|password)/i);
});

test("S-63.8 every page has a noindex robots directive", async () => {
  const { dist } = build(good);
  for (const h of html(dist)) expect(fs.readFileSync(h, "utf8"), h).toMatch(/<meta name="robots" content="noindex">/);
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  expect(toml).toMatch(/X-Robots-Tag\s*=\s*"noindex"/);
});

test("S-63.9 robots.txt disallows all crawling", async () => {
  const { dist } = build(good);
  const t = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
  expect(t).toMatch(/User-agent:\s*\*/);
  expect(t).toMatch(/Disallow:\s*\/\s*$/m);
  expect(t).not.toMatch(/Allow:/);
});

test("S-63.10 a recipe added to Supabase needs no push and no build", async () => {
  test.skip(true, "Not testable until the pages load recipes from Supabase (S-54, S-57); the shell pages have no loading script yet.");
});

test("S-63.11 the Netlify build does not run the old note-reading build", async () => {
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  expect(toml).toMatch(/command\s*=\s*"npm run build"/);
  const pkg = JSON.parse(fs.readFileSync(path.join(siteDir, "package.json"), "utf8"));
  expect(pkg.scripts.build).toBe("node build-shell.js");
  expect(pkg.scripts.build).not.toMatch(/build\.js|build:notes/);
  const shell = code("build-shell.js");
  expect(shell).not.toMatch(/require\(["']\.\/(build|lib)/);
  expect(shell).not.toMatch(/build\.js["'`)]|spawn|exec/);
});
