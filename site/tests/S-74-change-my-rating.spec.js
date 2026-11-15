// S-74: half-star rating on the Recipe page. Shell built into a temp copy; every Supabase call is stubbed (no live calls).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s74.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s74-"));
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
// opts: wtt, stars, postStatus. Every call is stubbed; writes are recorded, never sent.
async function stub(page, opts = {}) {
  const calls = [];
  await page.route("https://stub-s74.supabase.co/**", async (route) => {
    const req = route.request(), u = req.url(), m = req.method();
    calls.push({ m, u, body: req.postData(), prefer: req.headers()["prefer"] });
    const ok = (json, status = 200) => route.fulfill({ status, json, headers: cors });
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (u.includes("/rest/v1/rating?") && m === "POST") return opts.postStatus >= 400 ? ok({ message: "no" }, opts.postStatus) : route.fulfill({ status: 201, headers: cors });
    if (u.includes("/rest/v1/want_to_try")) return ok(opts.wtt ? [{ recipe_id: "r1" }] : []);
    if (u.includes("/rest/v1/rating?")) return ok(opts.stars ? [{ stars: opts.stars }] : []);
    if (u.includes("/rest/v1/favorite")) return ok([]);
    if (u.includes("/rest/v1/recipe_rating_summary")) return ok(opts.after && calls.some((c) => c.m === "POST") ? [{ recipe_id: "r1", average: 4.5, rating_count: 2 }] : []);
    if (u.includes("/rest/v1/recipe?") && u.includes("slug")) return ok([recipe]);
    return ok([]);
  });
  return calls;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
const writes = (calls) => calls.filter((c) => c.m === "POST" && /\/rating/.test(c.u));
// tap the left (0.25) or right (0.75) of star n
async function tapStar(page, n, right) {
  const b = await page.locator("#stars .star").nth(n - 1).boundingBox();
  await page.touchscreen.tap(b.x + b.width * (right ? 0.75 : 0.25), b.y + b.height / 2);
}
const filled = (page) => page.locator("#stars .fill").evaluateAll((els) => els.map((e) => Math.round(parseFloat(e.style.width))));

const summaries = (calls) => calls.filter((c) => c.m === "GET" && c.u.includes("recipe_rating_summary")).length;
async function loaded(page, calls, before) {
  await page.goto(base + "/recipe?name=apple-pie");
  await expect.poll(() => filled(page)).toEqual(before);
  await expect.poll(() => summaries(calls)).toBeGreaterThan(0);
  await page.waitForTimeout(200);
}

test("S-74.1/.2: a different value sends one upsert, the row shows it, still one rating, average refresh requested", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { stars: 3.5, after: true });
  await loaded(page, calls, [100, 100, 100, 50, 0]);
  const s0 = summaries(calls);
  await tapStar(page, 2, true);
  await expect.poll(() => filled(page)).toEqual([100, 100, 0, 0, 0]);
  const w = writes(calls);
  expect(w).toHaveLength(1);
  expect(w[0].u).toContain("on_conflict=user_id,recipe_id");
  expect(w[0].prefer).toContain("resolution=merge-duplicates");
  expect(JSON.parse(w[0].body)).toMatchObject({ user_id: "u1", recipe_id: "r1", stars: 2 });
  expect(calls.filter((c) => /\/rating/.test(c.u) && ["POST", "PUT", "PATCH", "DELETE"].includes(c.m))).toHaveLength(1);
  await expect.poll(() => summaries(calls)).toBeGreaterThan(s0);
  await expect(page.locator("#avg")).toHaveText("4.5 (2)");
});

test("S-74.1: a half-star change (3.5 to 4.5)", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { stars: 3.5 });
  await loaded(page, calls, [100, 100, 100, 50, 0]);
  await tapStar(page, 5, false);
  await expect.poll(() => filled(page)).toEqual([100, 100, 100, 100, 50]);
  expect(JSON.parse(writes(calls)[0].body).stars).toBe(4.5);
});

test("S-74.3: the current value sends nothing and asks for no refresh", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { stars: 3.5 });
  await loaded(page, calls, [100, 100, 100, 50, 0]);
  const s0 = summaries(calls);
  await tapStar(page, 4, false);
  await page.waitForTimeout(400);
  expect(writes(calls)).toHaveLength(0);
  expect(summaries(calls)).toBe(s0);
  expect(await filled(page)).toEqual([100, 100, 100, 50, 0]);
  await expect(page.locator("#rate-msg")).toBeHidden();
});

test("S-74.4: a failed change keeps the old rating, reverts the row, says so, and requests no refresh", async ({ page }) => {
  await signIn(page); const calls = await stub(page, { stars: 3.5, postStatus: 500, after: true });
  await loaded(page, calls, [100, 100, 100, 50, 0]);
  const s0 = summaries(calls);
  await tapStar(page, 1, true);
  await expect(page.locator("#rate-msg")).toHaveText("Couldn't save. Try again.");
  expect(await filled(page)).toEqual([100, 100, 100, 50, 0]);
  expect(writes(calls)).toHaveLength(1);
  await page.waitForTimeout(300);
  expect(summaries(calls)).toBe(s0);
});
