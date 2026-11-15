// S-65: average rating on a card. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s65.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s65-"));
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
    const f = path.join(dist, p);
    if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    res.end(fs.readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(() => server && server.close());

const cors = { "access-control-allow-origin": "*" };
const mk = (id, name) => ({ id, slug: name.toLowerCase().replace(/ /g, "-"), name, site: "", photo_path: null, course: { name: "Main" }, recipe_tag: [], recipe_ingredient: [] });
const recipes = [mk("r1", "Apple Pie"), mk("r2", "Chickpea Curry"), mk("r3", "French Toast")];
async function stub(page, summaryStatus, summary) {
  const methods = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    methods.push(route.request().method());
    if (u.includes("/rest/v1/recipe_rating_summary")) return route.fulfill({ status: summaryStatus, json: summary, headers: cors });
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Main", position: 1 }], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return methods;
}

test("S-65.1/.2/.3/.4: visitor sees '4.5 (3)', '3.0 (1)' and 'No ratings yet'; nothing about who rated", async ({ page }) => {
  const methods = await stub(page, 200, [
    { recipe_id: "r1", average: 4.5, rating_count: 3 },
    { recipe_id: "r2", average: "3.0000", rating_count: 1 },
  ]);
  await page.goto(base + "/");
  const card = (n) => page.locator("#grid .card", { hasText: n }).locator(".rating");
  await expect(card("Apple Pie")).toHaveText("4.5 (3)");
  await expect(card("Chickpea Curry")).toHaveText("3.0 (1)");
  await expect(card("French Toast")).toHaveText("No ratings yet");
  expect(await page.evaluate(() => window.RecipesRatings.summary.r1.count)).toBe(3);
  expect(methods.every((m) => m === "GET")).toBe(true);
});

test("S-65: if the summary request fails, Home still loads with cards and no rating text", async ({ page }) => {
  await stub(page, 500, { message: "boom" });
  await page.goto(base + "/");
  await expect(page.locator("#grid .card:not([hidden]) .name")).toHaveCount(3);
  await expect(page.locator(".rating")).toHaveCount(0);
  await expect(page.locator("#retry")).toHaveCount(0);
});
