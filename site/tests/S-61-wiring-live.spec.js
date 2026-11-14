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


const viewSrc = fs.readFileSync(path.resolve(siteDir, "../scripts/scale/view.js"), "utf8");
// run the Dataview script with a stub dv; returns { amounts: {key: text}, rows: [amount of each shown ingredient], steps: [text] }
function viewOutput(r, servings) {
  const ings = r.recipe_ingredient.slice().sort(byPos).map((x) => {
    const o = { id: x.ingredient_key, name: x.name, text: x.text_as_written };
    if (x.quantity !== null) o.q = x.quantity_high !== null ? [Number(x.quantity), Number(x.quantity_high)] : Number(x.quantity);
    if (x.unit_singular !== null || x.unit_plural !== null) o.u = x.unit_singular !== null && x.unit_plural !== null && x.unit_singular !== x.unit_plural ? [x.unit_singular, x.unit_plural] : (x.unit_singular || x.unit_plural);
    if (x.fixed_text !== null) o.s = x.fixed_text;
    if (x.lead_text) o.lead = x.lead_text;
    if (x.grams_before) o.pre = Number(x.grams_before);
    if (x.group_name) o.group = x.group_name;
    if (x.hidden) o.hidden = true;
    return o;
  });
  const out = { rows: [], steps: [] };
  const dv = {
    current: () => ({ servings_wanted: servings }),
    header: () => {}, table: (h, rows) => rows.forEach((x) => out.rows.push(x[2])),
    paragraph: (t) => (out.steps = t.split("\n").map((l) => l.replace(/^\d+\. /, ""))),
  };
  new Function("input", "dv", viewSrc)({ base: Number(r.base_amount), ingredients: ings, steps: r.step.slice().sort(byPos).map((s) => s.text) }, dv);
  return out;
}

test("S-61.1/S-61.11 every recipe, every servings option: page equals view.js, and no request on change", async ({ page }) => {
  test.setTimeout(300000);
  const list = await (await fetch(`${URL_}/rest/v1/recipe?select=slug`, { headers: H })).json();
  expect(list.length).toBeGreaterThan(20);
  let checked = 0;
  for (const { slug } of list) {
    const r = await live(slug);
    await page.goto(`${base}recipe?name=${slug}`);
    await expect(page.locator("#recipe h1")).toBeVisible();
    const sel = page.locator("#sv");
    const options = await sel.locator("option").evaluateAll((o) => o.map((x) => x.value));
    expect(options.length, slug).toBe(r.serving_option.length);
    const requests = [];
    page.on("request", (q) => requests.push(q.url()));
    for (const v of options) {
      await sel.selectOption(v);
      const exp = viewOutput(r, Number(v));
      const got = await page.evaluate(() => ({
        rows: Array.from(document.querySelectorAll("#ing li:not(.sub) .amt")).map((e) => e.textContent),
        steps: Array.from(document.querySelectorAll("#steps li p")).map((e) => e.textContent),
      }));
      expect(got.rows, `${slug} @ ${v} ingredients`).toEqual(exp.rows);
      expect(got.steps, `${slug} @ ${v} steps`).toEqual(exp.steps);
      checked++;
    }
    expect(requests, `${slug}: requests after changing the dropdown`).toEqual([]);
    page.removeAllListeners("request");
  }
  console.log(`S-61 live: ${list.length} recipes, ${checked} servings options compared`);
});

test("S-61.12 scripts/scale/view.js is not loaded by the shell", async () => {
  for (const f of ["recipe.html", "index.html"]) {
    const html = fs.readFileSync(path.join(dist, f), "utf8");
    expect(html).not.toMatch(/view\.js/);
    expect(html).toMatch(/scale\.js/);
  }
});
