// S-71: Want to try button on the Recipe page. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s71.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s71-"));
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
// opts: wtt (row exists), stars (rating or null), postStatus, readFail. Every call is stubbed; writes are recorded, never sent.
async function stub(page, opts = {}) {
  const calls = [];
  await page.route("https://stub-s71.supabase.co/**", async (route) => {
    const req = route.request(), u = req.url(), m = req.method();
    calls.push({ m, u, body: req.postData() });
    const ok = (json, status = 200) => route.fulfill({ status, json, headers: cors });
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (u.includes("/rest/v1/want_to_try")) {
      if (m === "POST") return opts.postStatus && opts.postStatus >= 400 ? ok({ message: "no" }, opts.postStatus) : route.fulfill({ status: 201, headers: cors });
      return opts.readFail ? ok({}, 500) : ok(opts.wtt ? [{ recipe_id: "r1" }] : []);
    }
    if (u.includes("/rest/v1/rating?")) return ok(opts.stars ? [{ stars: opts.stars }] : []);
    if (u.includes("/rest/v1/favorite")) return ok([]);
    if (u.includes("/rest/v1/recipe_rating_summary")) return ok([]);
    if (u.includes("/rest/v1/recipe?") && u.includes("slug")) return ok([recipe]);
    return ok([]);
  });
  return calls;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
const btn = (page) => page.locator("#want");
const writes = (calls) => calls.filter((c) => c.m !== "GET" && c.m !== "OPTIONS" && /want_to_try/.test(c.u));

test("S-71.1: a Member with no rating and no mark sees Want to try", async ({ page }) => {
  await signIn(page); await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(btn(page)).toHaveText("Want to try");
  await expect(page.locator("h1")).toHaveText("Apple Pie");
});

test("S-71.2: selecting it saves the Member's row and the button reads On your list", async ({ page }) => {
  await signIn(page); const calls = await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await btn(page).tap();
  await expect(btn(page)).toHaveText("On your list");
  await expect(page.locator("#want-msg")).toBeHidden();
  const w = writes(calls);
  expect(w).toHaveLength(1);
  expect(w[0].m).toBe("POST");
  expect(JSON.parse(w[0].body)).toEqual({ user_id: "u1", recipe_id: "r1" });
});

test("S-71.4: a failed save keeps no mark, the button returns and the page says so", async ({ page }) => {
  await signIn(page); await stub(page, { postStatus: 500 });
  await page.goto(base + "/recipe?name=apple-pie");
  await btn(page).tap();
  await expect(page.locator("#want-msg")).toHaveText("Couldn't save. Try again.");
  await expect(btn(page)).toHaveText("Want to try");
  await expect(btn(page)).toHaveAttribute("aria-pressed", "false");
});

test("S-72.1 (display): an already marked recipe reads On your list and sends no write", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { wtt: true });
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(btn(page)).toHaveText("On your list");
  expect(writes(calls)).toEqual([]);
});

test("S-71.6: a rated recipe shows no Want to try button", async ({ page }) => {
  await signIn(page); await stub(page, { stars: 4 });
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("h1")).toHaveText("Apple Pie");
  await expect(page.locator("#actions")).toBeVisible();
  await expect(btn(page)).toBeHidden();
  await expect(page.getByRole("button", { name: /want to try/i })).toHaveCount(0);
});

test("unreadable marks: no button, page still works", async ({ page }) => {
  await signIn(page); await stub(page, { readFail: true });
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("h1")).toHaveText("Apple Pie");
  await expect(btn(page)).toBeHidden();
});

test("signed-out Visitor gets no button and no personal request", async ({ page }) => {
  const calls = await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("h1")).toHaveText("Apple Pie");
  await expect(page.locator("#actions, #want")).toHaveCount(0);
  expect(calls.filter((c) => /want_to_try|rating\?/.test(c.u))).toEqual([]);
});

test("shared state: window.RecipesRecipe.state follows the page", async ({ page }) => {
  await signIn(page); await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(btn(page)).toHaveText("Want to try");
  expect(await page.evaluate(() => ({ ...window.RecipesRecipe.state }))).toEqual({ recipeId: "r1", loaded: true, wantToTry: false, rating: null });
  await page.evaluate(() => { window.RecipesRecipe.state.rating = 3; window.RecipesRecipe.renderControls(); });
  await expect(btn(page)).toBeHidden();
});

// S-71.3 (badge on the card / chip) is S-66/S-68 reading the row; S-71.5 (another Member doesn't see it) is the database's
// row-level security. Both are for the tester to check by hand against the real database.
