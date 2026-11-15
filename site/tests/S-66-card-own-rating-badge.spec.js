// S-66: own rating or Want to try badge on a card. Supabase is stubbed; no live calls.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s66.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s66-"));
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
const mk = (id, name) => ({ id, slug: name.toLowerCase().replace(/ /g, "-"), name, site: "", photo_path: null, course: { name: "Main" }, recipe_tag: [], recipe_ingredient: [] });
const recipes = [mk("r1", "Apple Pie"), mk("r2", "Chickpea Curry"), mk("r3", "French Toast"), mk("r4", "Gnocchi")];
async function stub(page, opts = {}) {
  const seen = { paths: [], methods: [], auth: [] };
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    seen.paths.push(u); seen.methods.push(route.request().method());
    if (u.includes("/rest/v1/rating?")) { seen.auth.push(route.request().headers()["authorization"]); return route.fulfill({ status: opts.ratingStatus || 200, json: [{ recipe_id: "r1", stars: 4.5 }, { recipe_id: "r2", stars: 3 }], headers: cors }); }
    if (u.includes("/rest/v1/want_to_try")) { seen.auth.push(route.request().headers()["authorization"]); return route.fulfill({ status: opts.wantStatus || 200, json: [{ recipe_id: "r2" }, { recipe_id: "r3" }], headers: cors }); }
    if (u.includes("/rest/v1/recipe_rating_summary")) return route.fulfill({ status: 200, json: [{ recipe_id: "r1", average: 4.5, rating_count: 3 }], headers: cors });
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Main", position: 1 }], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}
async function signIn(page) {
  await page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
}
const card = (page, n) => page.locator("#grid .card", { hasText: n });

test("S-66.1-.5: own rating, Want to try badge (rating wins), neither, and the average stays", async ({ page }) => {
  await signIn(page);
  const seen = await stub(page);
  await page.goto(base + "/");
  await expect(card(page, "Apple Pie").locator(".mine")).toHaveText("Your rating: 4.5");
  await expect(card(page, "Apple Pie").locator(".rating").first()).toHaveText("4.5 (3)");
  await expect(card(page, "Chickpea Curry").locator(".mine")).toHaveText("Your rating: 3.0");
  await expect(card(page, "Chickpea Curry").locator(".badge")).toHaveCount(0);
  await expect(card(page, "French Toast").locator(".badge")).toHaveText("Want to try");
  await expect(card(page, "French Toast").locator(".mine")).toHaveCount(0);
  await expect(card(page, "French Toast").locator(".rating")).toHaveText("No ratings yet");
  await expect(card(page, "Gnocchi").locator(".mine, .badge")).toHaveCount(0);
  expect(seen.auth.length).toBe(2);
  expect(seen.auth.every((a) => a === "Bearer tok")).toBe(true);
  expect(seen.methods.every((m) => m === "GET")).toBe(true);
});

test("S-66.6: signed out requests nothing personal and shows nothing personal", async ({ page }) => {
  const seen = await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#grid .card")).toHaveCount(4);
  expect(seen.paths.some((u) => /\/rest\/v1\/(rating\?|want_to_try)/.test(u))).toBe(false);
  await expect(page.locator(".mine, .badge")).toHaveCount(0);
});

test("S-66: if the personal requests fail, Home still loads with no personal parts", async ({ page }) => {
  await signIn(page);
  await stub(page, { ratingStatus: 500, wantStatus: 500 });
  await page.goto(base + "/");
  await expect(page.locator("#grid .card:not([hidden]) .name")).toHaveCount(4);
  await expect(page.locator(".mine, .badge")).toHaveCount(0);
  await expect(card(page, "Apple Pie").locator(".rating")).toHaveText("4.5 (3)");
});
