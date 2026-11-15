// S-76: the average and count update when a rating changes. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s76.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s76-"));
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
// Stateful stub: a table of ratings (user -> stars) that POST/DELETE change and that the summary view is computed from.
// opts: mine (Member's starting stars or undefined), others (array of other Members' stars), fail (writes return 500).
async function stub(page, opts = {}) {
  const ratings = {};
  if (opts.mine) ratings.u1 = opts.mine;
  (opts.others || []).forEach((s, i) => { ratings["o" + i] = s; });
  const calls = [];
  await page.route("https://stub-s76.supabase.co/**", async (route) => {
    const req = route.request(), u = req.url(), m = req.method();
    calls.push({ m, u });
    const ok = (json, status = 200) => route.fulfill({ status, json, headers: cors });
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (u.includes("/rest/v1/recipe_rating_summary")) {
      const v = Object.values(ratings);
      return ok(v.length ? [{ recipe_id: "r1", average: v.reduce((a, b) => a + b, 0) / v.length, rating_count: v.length }] : []);
    }
    if (u.includes("/rest/v1/rating?") && m === "DELETE") {
      if (opts.fail) return ok({ message: "no" }, 500);
      delete ratings.u1; return route.fulfill({ status: 204, headers: cors });
    }
    if (u.includes("/rest/v1/rating") && m === "POST") {
      if (opts.fail) return ok({ message: "no" }, 500);
      ratings.u1 = JSON.parse(req.postData()).stars; return route.fulfill({ status: 201, headers: cors });
    }
    if (u.includes("/rest/v1/rating?")) return ok(ratings.u1 ? [{ stars: ratings.u1 }] : []);
    if (u.includes("/rest/v1/want_to_try") || u.includes("/rest/v1/favorite")) return ok([]);
    if (u.includes("/rest/v1/recipe?") && u.includes("slug")) return ok([recipe]);
    return ok([]);
  });
  return calls;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
async function tapStar(page, n, right) {
  const b = await page.locator("#stars .star").nth(n - 1).boundingBox();
  await page.touchscreen.tap(b.x + b.width * (right ? 0.75 : 0.25), b.y + b.height / 2);
}
async function open(page, avg) {
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(page.locator("#avg")).toHaveText(avg);
  await expect(page.locator("#stars")).toBeVisible();
  await page.waitForTimeout(200);
}

test("S-76.1: a saved rating is included in the average, one decimal, with the new count", async ({ page }) => {
  await signIn(page); await stub(page, { others: [4, 5] });
  await open(page, "4.5 (2)");
  await tapStar(page, 3, true); // 3 stars -> (4+5+3)/3 = 4.0
  await expect(page.locator("#avg")).toHaveText("4.0 (3)");
});

test("S-76.1: the first rating on an unrated recipe replaces No ratings yet", async ({ page }) => {
  await signIn(page); await stub(page, {});
  await open(page, "No ratings yet");
  await tapStar(page, 4, false); // 3.5
  await expect(page.locator("#avg")).toHaveText("3.5 (1)");
});

test("S-76.2: a changed rating updates the average and leaves the count unchanged", async ({ page }) => {
  await signIn(page); await stub(page, { mine: 2, others: [4] });
  await open(page, "3.0 (2)");
  await tapStar(page, 5, true); // 5 -> (4+5)/2 = 4.5
  await expect(page.locator("#avg")).toHaveText("4.5 (2)");
});

test("S-76.3: removing the only rating shows No ratings yet", async ({ page }) => {
  await signIn(page); await stub(page, { mine: 3.5 });
  await open(page, "3.5 (1)");
  await page.locator("#remove-rating").tap();
  await expect(page.locator("#avg")).toHaveText("No ratings yet");
});

test("S-76.3: removing a rating when others exist leaves the average and count without it", async ({ page }) => {
  await signIn(page); await stub(page, { mine: 1, others: [4, 5] });
  await open(page, "3.3 (3)");
  await page.locator("#remove-rating").tap();
  await expect(page.locator("#avg")).toHaveText("4.5 (2)");
});

test("S-76.4: a failed save leaves the average and count as they were", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { mine: 2, others: [4], fail: true });
  await open(page, "3.0 (2)");
  await tapStar(page, 5, true);
  await expect(page.locator("#rate-msg")).toHaveText("Couldn't save. Try again.");
  await page.waitForTimeout(300);
  await expect(page.locator("#avg")).toHaveText("3.0 (2)");
  expect(calls.filter((c) => c.m === "GET" && c.u.includes("recipe_rating_summary"))).toHaveLength(1);
});

test("S-76.4: a failed remove leaves the average and count as they were", async ({ page }) => {
  await signIn(page); await stub(page, { mine: 2, others: [4], fail: true });
  await open(page, "3.0 (2)");
  await page.locator("#remove-rating").tap();
  await expect(page.locator("#rate-msg")).toHaveText("Couldn't save. Try again.");
  await expect(page.locator("#avg")).toHaveText("3.0 (2)");
});
