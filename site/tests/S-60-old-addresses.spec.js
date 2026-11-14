// S-60: old /recipes/<slug>.html addresses. Netlify can't run locally, so site/preview.js EMULATES the netlify.toml rule
// (whole-segment placeholder, 301). These tests check the repo file and, through that emulation, the page behaviour.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://wbeaswhbzkqmxcsweisu.supabase.co";
const KEY = "sb_publishable_mS_LpC99jJUlk8Ljxp-jUw_epJ7l0gt";
const PORT = 8866;
const base = `http://127.0.0.1:${PORT}`;
let proc, dist;

test.beforeAll(async () => {
  const code = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "s60-")), "site");
  fs.mkdirSync(code);
  for (const f of ["build-shell.js", "preview.js"]) fs.copyFileSync(path.join(siteDir, f), path.join(code, f));
  fs.cpSync(path.join(siteDir, "static"), path.join(code, "static"), { recursive: true });
  const r = spawnSync("node", ["build-shell.js"], { cwd: code, encoding: "utf8", env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: KEY } });
  expect(r.status, r.stderr).toBe(0);
  dist = path.join(code, "dist");
  proc = spawn("node", ["preview.js"], { cwd: code, env: { PATH: process.env.PATH, PORT: String(PORT) } });
  await new Promise((ok) => proc.stdout.once("data", ok));
});
test.afterAll(() => proc && proc.kill());

test("S-60.3 the rule is in netlify.toml", () => {
  const t = fs.readFileSync(path.join(siteDir, "..", "netlify.toml"), "utf8");
  expect(t).toMatch(/\[\[redirects\]\]\s+from = "\/recipes\/:slug"\s+to = "\/recipe\?name=:slug"\s+status = 301/);
});
test("S-60.4 no page is published at /recipes/", () => {
  expect(fs.existsSync(path.join(dist, "recipes"))).toBe(false);
});
test("S-60.1 old address ends on /recipe?name=<slug>", async ({ page }) => {
  const res = await fetch(`${base}/recipes/french-toast.html`, { redirect: "manual" });
  expect(res.status).toBe(301);
  await page.goto(`${base}/recipes/french-toast.html`);
  await expect(page.locator("h1").first()).toHaveText("French Toast", { timeout: 15000 });
  expect(page.url()).toBe(`${base}/recipe?name=french-toast`);
});
test("S-60.5 unknown slug ends on 'That recipe isn't here.'", async ({ page }) => {
  await page.goto(`${base}/recipes/no-such-thing.html`);
  await expect(page.getByText("That recipe isn't here.")).toBeVisible({ timeout: 15000 });
});

// S-60.2: every recipe in the live database (read-only, publishable key) is reached through its old address.
test("S-60.2 every recipe's old address leads to that recipe's page", async ({ page }) => {
  test.setTimeout(240000);
  const r = await fetch(`${URL_}/rest/v1/recipe?select=slug,name`, { headers: { apikey: KEY, "Accept-Profile": "recipes" } });
  expect(r.status).toBe(200);
  const rows = await r.json();
  expect(rows.length).toBeGreaterThan(0);
  for (const { slug, name } of rows) {
    await page.goto(`${base}/recipes/${slug}.html`);
    await expect(page.locator("h1").first(), slug).toHaveText(name, { timeout: 15000 });
    expect(page.url(), slug).toBe(`${base}/recipe?name=${slug}`);
  }
});
test("S-60.2 edge cases: .html stripping", async ({ page }) => {
  const nameOf = async (p) => { await page.goto(`${base}${p}`); };
  // without .html the slug still works
  await nameOf("/recipes/french-toast");
  await expect(page.locator("h1").first()).toHaveText("French Toast", { timeout: 15000 });
  // upper-case ending is dropped too
  await nameOf("/recipes/french-toast.HTML");
  await expect(page.locator("h1").first()).toHaveText("French Toast", { timeout: 15000 });
  expect(page.url()).toBe(`${base}/recipe?name=french-toast`);
  // only one ending is dropped: ".html.html" is not a recipe
  await nameOf("/recipes/french-toast.html.html");
  await expect(page.getByText("That recipe isn't here.")).toBeVisible({ timeout: 15000 });
  // ".html" in the middle of a name is not stripped
  await nameOf("/recipes/french.html-toast.html");
  await expect(page.getByText("That recipe isn't here.")).toBeVisible({ timeout: 15000 });
  // a bare ".html" has no slug and does not crash
  await nameOf("/recipes/.html");
  await expect(page.locator("body")).toBeVisible();
  // a deep path is not the old address: no redirect
  const deep = await fetch(`${base}/recipes/a/b.html`, { redirect: "manual" });
  expect(deep.status).toBe(404);
});
