// S-28: no favorites yet. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s28.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s28-"));
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
    if (["/recipe", "/create-account", "/sign-in", "/forgot-password"].includes(p)) p += ".html";
    const f = path.join(dist, p);
    if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    res.end(fs.readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});
const cors = { "access-control-allow-origin": "*" };
const nav = (page) => page.locator("header nav");
const session = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, user: { id: "u1", email: "sam@example.com", name: "Sam" } };
async function quiet(page) {
  await page.route(URL_ + "/**", (route) => route.fulfill({ status: 200, json: [], headers: cors }));
}
async function signedIn(page) {
  await page.addInitScript((s) => { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("recipes.session", JSON.stringify(s)); } }, session);
}



const mk = (id, name, course, site) => ({ id, slug: name.toLowerCase().replace(/ /g, "-"), name, site, photo_path: null, course: { name: course }, recipe_tag: [], recipe_ingredient: [] });
const recipes = [mk("r1", "Apple Pie", "Dessert", "Zed"), mk("r2", "Chickpea Curry", "Main", "Alpha"), mk("r3", "French Toast", "Breakfast", "Mid")];
async function stub(page, favs, favStatus = 200) {
  const seen = { auth: [] };
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Breakfast", position: 1 }, { name: "Main", position: 2 }, { name: "Dessert", position: 3 }], headers: cors });
    if (u.includes("/rest/v1/favorite")) { seen.auth.push(route.request().headers()["authorization"]); return route.fulfill({ status: favStatus, json: favs.map((recipe_id) => ({ recipe_id })), headers: cors }); }
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}
const names = (page) => page.locator("#grid .card:not([hidden]) .name").allTextContents();

const empty = (page) => page.locator("#none");

test("S-28.1: no favorites shows the title, 'No favorites yet.' and no cards (no flash of the old title)", async ({ page }) => {
  await signedIn(page);
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/rest/v1/recipe?")) { await new Promise((r) => setTimeout(r, 600)); return route.fulfill({ status: 200, json: recipes, headers: cors }); }
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Main", position: 1 }], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  await page.goto(base + "/");
  await nav(page).getByText("Favorites").tap();
  await expect(page.locator("h1")).toHaveText("Your favorites."); // while still loading
  await expect(empty(page)).toBeVisible();
  await expect(empty(page)).toHaveText("No favorites yet.");
  await expect(page.locator("h1")).toHaveText("Your favorites.");
  expect((await names(page)).length).toBe(0);
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(0);
});

test("S-28.2: after a recipe is favorited, opening Favorites again shows the cards", async ({ page }) => {
  await signedIn(page);
  const favs = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Dessert", position: 1 }], headers: cors });
    if (u.includes("/rest/v1/favorite")) return route.fulfill({ status: 200, json: favs.map((recipe_id) => ({ recipe_id })), headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  await page.goto(base + "/?favorites=1");
  await expect(empty(page)).toHaveText("No favorites yet.");
  favs.push("r1");
  await page.goto(base + "/");
  await nav(page).getByText("Favorites").tap();
  await expect(page.locator("#grid .card:not([hidden]) .name")).toHaveText(["Apple Pie"]);
  await expect(empty(page)).toBeHidden();
});

test("S-28.3: a favorite whose recipe is gone doesn't count", async ({ page }) => {
  await signedIn(page);
  await stub(page, ["gone"]);
  await page.goto(base + "/?favorites=1");
  await expect(empty(page)).toHaveText("No favorites yet.");
  expect((await names(page)).length).toBe(0);
});

test("S-28.4: 'No favorites yet.' only with no favorites; otherwise 'Nothing matches that.'", async ({ page }) => {
  await signedIn(page);
  await stub(page, ["r1", "r2"]);
  await page.goto(base + "/?favorites=1");
  await expect(empty(page)).toBeHidden();
  await page.locator("#chips .chip", { hasText: "Breakfast" }).tap(); // r3 is not a favorite
  await expect(empty(page)).toHaveText("Nothing matches that. Try another word.");
  await page.locator("#chips .chip", { hasText: "All" }).tap();
  await page.locator("#q").fill("zzzz");
  await expect(empty(page)).toHaveText("Nothing matches that. Try another word.");
});
