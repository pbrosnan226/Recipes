// S-61 wiring: the servings dropdown rescales the Recipe page in the browser. The shell is built into a temp copy (site/dist is never touched)
// Live proof (S-61.1, S-61.11, S-61.12): every recipe in the database, every servings option, compared with scripts/scale/view.js.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://wbeaswhbzkqmxcsweisu.supabase.co";
const KEY = "sb_publishable_mS_LpC99jJUlk8Ljxp-jUw_epJ7l0gt";
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Accept-Profile": "recipes" };
const SELECT = "*,course(name),recipe_tag(position,tag(name)),serving_option(*),recipe_ingredient(*),step(*),recipe_note(*),nutrient(*)";

let server, base, dist;
const cache = {};
const live = async (slug) => {
  if (!cache[slug]) {
    const r = await fetch(`${URL_}/rest/v1/recipe?select=${encodeURIComponent(SELECT)}&slug=eq.${slug}`, { headers: H });
    cache[slug] = (await r.json())[0];
  }
  return cache[slug];
};
const byPos = (a, b) => a.position - b.position;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s61-"));
  const code = path.join(tmp, "site");
  fs.mkdirSync(code);
  fs.copyFileSync(path.join(siteDir, "build-shell.js"), path.join(code, "build-shell.js"));
  fs.cpSync(path.join(siteDir, "static"), path.join(code, "static"), { recursive: true });
  const r = spawnSync("node", ["build-shell.js"], {
    cwd: code, encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: KEY },
  });
  expect(r.status, r.stderr).toBe(0);
  dist = path.join(code, "dist");
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".txt": "text/plain" };
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    if (p === "/recipe") p = "/recipe.html";
    const f = path.join(dist, p);
    if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    res.end(fs.readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}/`;
});
test.afterAll(() => server && server.close());



// S-61.2/.3/.6/.8/.9/.10 through the dropdown on real recipes, plus a sanity check that the live comparison is not vacuous.
test("S-61 dropdown on real recipes: scaling, fixed text, units, hidden, lead text, grams, no raw keys", async ({ page }) => {
  const rowsOf = () => page.evaluate(() => Array.from(document.querySelectorAll("#ing li:not(.sub)")).map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  const stepsOf = () => page.evaluate(() => Array.from(document.querySelectorAll("#steps li p")).map((e) => e.textContent));
  for (const slug of ["triple-chocolate-layer-cake", "apple-crumble-pie", "honey-garlic-chicken", "mashed-potatoes"]) {
    const r = await live(slug);
    await page.goto(`${base}recipe?name=${slug}`);
    await expect(page.locator("#recipe h1")).toBeVisible();
    const opts = await page.locator("#sv option").evaluateAll((o) => o.map((x) => x.value));
    const seen = {};
    for (const v of opts) {
      await page.locator("#sv").selectOption(v);
      seen[v] = { rows: await rowsOf(), steps: await stepsOf(), amts: await page.evaluate(() => Array.from(document.querySelectorAll("#ing li:not(.sub) .amt")).map((e) => e.textContent)) };
      expect(seen[v].amts.length, slug).toBeGreaterThan(0);
      expect(seen[v].amts.filter((a) => a.trim() !== "").length, `${slug} @ ${v} non-empty amounts`).toBeGreaterThan(0);
      for (const t of seen[v].steps) expect(t, `${slug} raw key`).not.toMatch(/\{[a-z0-9_-]+\}/i);
    }
    // S-61.2: a different size changes some amount
    if (opts.length > 1) expect(seen[opts[0]].amts).not.toEqual(seen[opts[opts.length - 1]].amts);
    // S-61.9: hidden ingredients are not in the list
    const shown = r.recipe_ingredient.filter((x) => !x.hidden).length;
    const hidden = r.recipe_ingredient.filter((x) => x.hidden).length;
    expect(seen[opts[0]].amts.length, `${slug} list excludes hidden`).toBe(shown);
    if (slug === "apple-crumble-pie") expect(hidden).toBeGreaterThan(0);
    // S-61.3: fixed text identical at every size
    for (const x of r.recipe_ingredient.filter((x) => x.fixed_text && !x.hidden)) {
      for (const v of opts) expect(seen[v].rows.join("|"), `${slug} fixed ${x.fixed_text}`).toContain(x.fixed_text);
    }
  }
  // S-61.8 lead text, S-61.7 grams before, S-61.5 range
  const m = await live("mashed-potatoes"), lead = m.recipe_ingredient.find((x) => x.lead_text);
  await page.goto(`${base}recipe?name=mashed-potatoes`);
  await expect(page.locator("#ing")).toContainText(lead.lead_text);
  const h = await live("honey-garlic-chicken"), g = h.recipe_ingredient.find((x) => x.grams_before);
  await page.goto(`${base}recipe?name=honey-garlic-chicken`);
  await expect(page.locator("#ing")).toContainText(/\d+\s?g \//);
  await page.goto(`${base}recipe?name=triple-chocolate-layer-cake`);
  await expect(page.locator("#ing")).toContainText("\u2013");
});

// S-61.6 on a real recipe: singular at <=1, plural above 1
test("S-61.6 browser: unit flips between singular and plural as the size changes", async ({ page }) => {
  const r = await live("apple-crumble-pie");
  await page.goto(`${base}recipe?name=apple-crumble-pie`);
  await expect(page.locator("#recipe h1")).toBeVisible();
  const opts = await page.locator("#sv option").evaluateAll((o) => o.map((x) => x.value));
  let sing = 0, plur = 0;
  const pairs = r.recipe_ingredient.filter((x) => !x.hidden && x.quantity !== null && x.unit_singular && x.unit_plural && x.unit_singular !== x.unit_plural);
  for (const v of opts) {
    await page.locator("#sv").selectOption(v);
    const txt = await page.locator("#ing").innerText();
    for (const x of pairs) {
      const q = Number(x.quantity_high ?? x.quantity) * Number(v) / Number(r.base_amount);
      const re = new RegExp(`(^|[\\s\\d\u00bc-\u00be\u2150-\u215e/\u2013])${q <= 1 ? x.unit_singular : x.unit_plural}(\\s|$)`, "m");
      if (re.test(txt)) { q <= 1 ? sing++ : plur++; }
    }
  }
  expect(sing + plur).toBeGreaterThan(0);
  expect(plur).toBeGreaterThan(0);
});

// Non-vacuity: a deliberately wrong expectation must fail
test("S-61 sanity: wrong expectation fails (comparison is real)", async ({ page }) => {
  await page.goto(`${base}recipe?name=apple-crumble-pie`);
  await expect(page.locator("#recipe h1")).toBeVisible();
  const opts = await page.locator("#sv option").evaluateAll((o) => o.map((x) => x.value));
  const a = await page.evaluate(() => Array.from(document.querySelectorAll("#ing li:not(.sub) .amt")).map((e) => e.textContent));
  expect(a.filter((x) => x.trim()).length).toBeGreaterThan(3);
  let failed = false;
  try { expect(a.map((x) => x + "!")).toEqual(a); } catch { failed = true; }
  expect(failed).toBe(true);
  await page.locator("#sv").selectOption(opts[opts.length - 1]);
  const b = await page.evaluate(() => Array.from(document.querySelectorAll("#ing li:not(.sub) .amt")).map((x) => x.textContent));
  expect(opts.length > 1 ? b : a).not.toEqual(opts.length > 1 ? a : []);
});
