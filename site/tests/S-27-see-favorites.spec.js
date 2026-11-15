// S-27: see my favorites. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s27.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s27-"));
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

test("S-27.1-2, 7, 8: titled page, only my favorites, a gone recipe is skipped, own sign-in sent", async ({ page }) => {
  await signedIn(page);
  const seen = await stub(page, ["r1", "r3", "gone"]);
  await page.goto(base + "/");
  await page.locator("header nav").getByText("Favorites").tap();
  await expect(page.locator("h1")).toHaveText("Your favorites.");
  expect(await names(page)).toEqual(["Apple Pie", "French Toast"]);
  expect(seen.auth.every((a) => a === "Bearer tok")).toBe(true);
});

test("S-27.3-6, 10: chips, sort, search work on favorites; nothing-matches wording", async ({ page }) => {
  await signedIn(page);
  await stub(page, ["r1", "r2", "r3"]);
  await page.goto(base + "/?favorites=1");
  await expect(page.locator("#chips .chip")).toHaveCount(4);
  await page.locator("#chips .chip", { hasText: "Main" }).tap();
  expect(await names(page)).toEqual(["Chickpea Curry"]);
  await page.locator("#chips .chip", { hasText: "All" }).tap();
  await page.locator("#sort").selectOption("site");
  expect(await names(page)).toEqual(["Chickpea Curry", "French Toast", "Apple Pie"]);
  await page.locator("#q").fill("toast");
  expect(await names(page)).toEqual(["French Toast"]);
  await page.locator("#q").fill("zzzz");
  await expect(page.locator("#none")).toHaveText("Nothing matches that. Try another word.");
  await expect(page.locator("#none")).toBeVisible();
});

test("S-27.9: signed out, /?favorites=1 is the normal Home", async ({ page }) => {
  await stub(page, ["r1"]);
  await page.goto(base + "/?favorites=1");
  await expect(page.locator("h1")).toHaveText("Everything we cook.");
  expect((await names(page)).length).toBe(3);
});
