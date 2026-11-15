// S-67: own rating or Want to try badge on a card. Supabase is stubbed; no live calls.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s67.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s67-"));
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
const session = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, user: { id: "u1", email: "sam@example.com", name: "Sam" } };
const mk = (id, name, course) => ({ id, slug: name.toLowerCase().replace(/ /g, "-"), name, site: "", photo_path: null, course: { name: course || "Main" }, recipe_tag: [], recipe_ingredient: [] });
const recipes = [mk("r1", "apple Pie"), mk("r2", "Banana Bread", "Dessert"), mk("r3", "Cake"), mk("r4", "Donut"), mk("r5", "Eggs"), mk("r6", "Flan")];
async function stub(page, opts = {}) {
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    // own: r1 2, r2 5, r3 5, r6 none. average: r1 5, r2 1, r3 1, r4 4, r5 4, r6 none (r5 count 0)
    if (u.includes("/rest/v1/rating?")) return route.fulfill({ status: opts.ratingStatus || 200, json: [{ recipe_id: "r1", stars: 2 }, { recipe_id: "r2", stars: 5 }, { recipe_id: "r3", stars: 5 }], headers: cors });
    if (u.includes("/rest/v1/want_to_try")) return route.fulfill({ status: 200, json: [], headers: cors });
    if (u.includes("/rest/v1/recipe_rating_summary")) return route.fulfill({ status: opts.sumStatus || 200, json: [{ recipe_id: "r1", average: 5, rating_count: 2 }, { recipe_id: "r2", average: 1, rating_count: 1 }, { recipe_id: "r3", average: 1, rating_count: 1 }, { recipe_id: "r4", average: 4, rating_count: 3 }, { recipe_id: "r5", average: 0, rating_count: 0 }], headers: cors });
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Main", position: 1 }, { name: "Dessert", position: 2 }], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
}
const names = (page) => page.locator("#grid .card:not([hidden]) .name").allTextContents();

test("S-67.1/.2/.4/.5: Visitor sorts by average, ties and no-ratings by name", async ({ page }) => {
  await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#sort option")).toHaveText(["Name", "Site", "Rating"]);
  await page.locator("#sort").selectOption("rating");
  expect(await names(page)).toEqual(["apple Pie", "Donut", "Banana Bread", "Cake", "Eggs", "Flan"]);
});

test("S-67.3/.6/.7: Member sorts by own rating, unrated last, kept through search and chips", async ({ page }) => {
  await page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
  await stub(page);
  await page.goto(base + "/");
  await page.locator("#sort").selectOption("rating");
  expect(await names(page)).toEqual(["Banana Bread", "Cake", "apple Pie", "Donut", "Eggs", "Flan"]);
  await page.locator("#q").fill("a");
  await expect(page.locator("#sort")).toHaveValue("rating");
  expect(await names(page)).toEqual(["Banana Bread", "Cake", "apple Pie", "Flan"]);
  await page.locator("#q").fill("");
  await page.locator("#chips .chip", { hasText: "Dessert" }).tap();
  await expect(page.locator("#sort")).toHaveValue("rating");
  expect(await names(page)).toEqual(["Banana Bread"]);
});

test("S-67: if the rating data failed to load, Rating sort still works (all by name)", async ({ page }) => {
  await stub(page, { sumStatus: 500 });
  await page.goto(base + "/");
  await page.locator("#sort").selectOption("rating");
  expect(await names(page)).toEqual(["apple Pie", "Banana Bread", "Cake", "Donut", "Eggs", "Flan"]);
});
