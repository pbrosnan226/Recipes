// S-69: average rating on the Recipe page. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s69.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s69-"));
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
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(() => server && server.close());

const cors = { "access-control-allow-origin": "*" };
const recipe = { id: "r1", slug: "apple-pie", name: "Apple Pie", site: "", author: "", source_url: "x", photo_path: null, base_amount: 4, amount_noun: "servings", servings_label: "Servings", description: "", prep_time: "", cook_time: "", total_time: "", course: { name: "Main" }, recipe_tag: [], serving_option: [{ position: 1, amount: 4, label: "4" }], recipe_ingredient: [], step: [], recipe_note: [], nutrient: [] };
async function stub(page, status, rows) {
  const calls = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    calls.push({ m: route.request().method(), u });
    if (u.includes("/rest/v1/recipe_rating_summary")) return route.fulfill({ status, json: rows, headers: cors });
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: [recipe], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return calls;
}

test("S-69.1/.3/.4: signed-out visitor sees '4.5 (3)'; GET only; no who-rated", async ({ page }) => {
  const calls = await stub(page, 200, [{ recipe_id: "r1", average: "4.5000", rating_count: 3 }]);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("#avg")).toHaveText("4.5 (3)");
  expect(calls.every((c) => c.m === "GET")).toBe(true);
  expect(calls.some((c) => /user_id/.test(c.u) && c.u.includes("rating"))).toBe(false);
});

test("S-69.2: no ratings shows 'No ratings yet'", async ({ page }) => {
  await stub(page, 200, []);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("#avg")).toHaveText("No ratings yet");
});

test("S-69: setAverage / refreshAverage update the line; a failed read leaves the page without it", async ({ page }) => {
  await stub(page, 200, [{ recipe_id: "r1", average: 4, rating_count: 2 }]);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("#avg")).toHaveText("4.0 (2)");
  await page.evaluate(() => window.RecipesRecipe.setAverage(2.25, 4));
  await expect(page.locator("#avg")).toHaveText("2.3 (4)");
  const p2 = await page.context().newPage();
  await stub(p2, 500, { message: "boom" });
  await p2.goto(base + "/recipe?name=apple-pie");
  await expect(p2.locator("h1")).toHaveText("Apple Pie");
  await expect(p2.locator("#avg")).toBeHidden();
});
