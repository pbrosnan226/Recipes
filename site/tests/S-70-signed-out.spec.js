// S-70: personal parts hidden from signed-out Visitors. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
// NOTE for the tester: S-70.3 and S-70.5 for the Recipe page concern the Want to try button, half-star row and Remove rating
// button, which arrive with S-71 to S-75 and do not exist yet. Here the signed-out Recipe page is checked to have none of them
// (trivially true today). Re-check S-70.3 and S-70.5 (signed-in controls shown) once S-71 to S-75 are built.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s70.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s70-"));
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
const session = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, user: { id: "u1", email: "sam@example.com", name: "Sam" } };
const recipe = { id: "r1", slug: "apple-pie", name: "Apple Pie", site: "", author: "", source_url: "x", photo_path: null, base_amount: 4, amount_noun: "servings", servings_label: "Servings", description: "", prep_time: "", cook_time: "", total_time: "", course: { name: "Main" }, recipe_tag: [], serving_option: [{ position: 1, amount: 4, label: "4" }], recipe_ingredient: [], step: [], recipe_note: [], nutrient: [] };
const card = { id: "r1", slug: "apple-pie", name: "Apple Pie", site: "", photo_path: null, course: { name: "Main" }, recipe_tag: [], recipe_ingredient: [] };
async function stub(page) {
  const reqs = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    reqs.push(u);
    const ok = (json) => route.fulfill({ status: 200, json, headers: cors });
    if (u.includes("/rest/v1/recipe_rating_summary")) return ok([{ recipe_id: "r1", average: "4.5000", rating_count: 3 }]);
    if (u.includes("/rest/v1/rating?")) return ok([{ recipe_id: "r1", stars: 4 }]);
    if (u.includes("/rest/v1/want_to_try")) return ok([{ recipe_id: "r1" }]);
    if (u.includes("/rest/v1/recipe?") && u.includes("slug")) return ok([recipe]);
    if (u.includes("/rest/v1/recipe?")) return ok([card]);
    if (u.includes("/rest/v1/course")) return ok([{ name: "Main", position: 1 }]);
    return ok([]);
  });
  return reqs;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
const personal = (u) => /rating\?|want_to_try/.test(u) && !u.includes("recipe_rating_summary");

test("S-70.1/.2/.4: signed-out Home has no second row, no own rating or badge, no personal requests; average shown", async ({ page }) => {
  const reqs = await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#grid .card").first()).toBeVisible();
  await expect(page.locator("#mine")).toHaveCount(0);
  await expect(page.locator("#grid .rating.mine")).toHaveCount(0);
  await expect(page.locator("#grid .badge")).toHaveCount(0);
  await expect(page.locator("#grid")).not.toContainText("Your rating");
  await expect(page.locator("#grid .card .rating").first()).toHaveText("4.5 (3)");
  expect(reqs.filter(personal)).toEqual([]);
});

test("S-70.3/.4: signed-out Recipe page shows the average and none of the personal controls", async ({ page }) => {
  const reqs = await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("#avg")).toHaveText("4.5 (3)");
  await expect(page.locator("h1")).toHaveText("Apple Pie");
  await expect(page.locator(".want-to-try, #want-to-try, .stars, #stars, .star")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /want to try/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /remove rating/i })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Your rating");
  expect(reqs.filter(personal)).toEqual([]);
});

test("S-70.5 (Home part): a signed-in Member sees the second row, own rating and badge", async ({ page }) => {
  await signIn(page);
  await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#mine .chip")).toHaveText(["All", "Want to try", "Rated"]);
  await expect(page.locator("#grid .rating.mine")).toHaveText("Your rating: 4.0");
  // Recipe page controls for a Member: re-check when S-71 to S-75 are built.
});
