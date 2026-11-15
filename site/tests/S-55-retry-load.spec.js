// S-55: the Home page loads its recipes from Supabase. The shell is built into a temp copy (site/dist is never touched),
// served on a random port. Live data (however many recipes are in the database) is used where it can give the case; page.route stubs the rest.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://wbeaswhbzkqmxcsweisu.supabase.co";
const KEY = "sb_publishable_mS_LpC99jJUlk8Ljxp-jUw_epJ7l0gt";
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Accept-Profile": "recipes" };
const RECIPES_Q = "recipe?select=name,slug,site,photo_path,course(name),recipe_tag(position,tag(name))&order=name";

let server, base, dist;
let live; // { recipes, courses }

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s55-"));
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
  base = `http://127.0.0.1:${server.address().port}/`;
  const get = async (q) => (await fetch(`${URL_}/rest/v1/${q}`, { headers: H })).json();
  live = { recipes: await get(RECIPES_Q), courses: await get("course?select=name,position&order=position") };
});
test.afterAll(() => server && server.close());

const isRest = (u) => u.startsWith(URL_ + "/rest/v1/");
const names = (page) => page.locator("#grid .card:not([hidden]) .name").allInnerTexts();
const cmp = (x, y) => x.toLowerCase().localeCompare(y.toLowerCase(), "en");
const stub = async (page, { recipes = live.recipes, courses = live.courses, delay = 0, fail = false } = {}) => {
  await page.route(URL_ + "/rest/v1/**", async (route) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    if (fail) return route.abort();
    const body = route.request().url().includes("/rest/v1/course") ? courses : recipes;
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
  });
};
const rec = (name, extra = {}) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), site: null, photo_path: null, course: null, recipe_tag: [], ...extra });


const failMsg = (page) => page.getByText("Couldn't load recipes.");
const tryBtn = (page) => page.getByRole("button", { name: "Try again" });
const header = async (page) => {
  await expect(page.locator("header .logo")).toHaveText("Recipes");
  await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
};
// a stub whose behaviour can be switched between failing and working; counts recipe requests
const switchable = async (page, state) => {
  await page.route(URL_ + "/rest/v1/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/rest/v1/recipe?")) state.recipeReqs++;
    if (state.mode === "abort") return route.abort();
    if (state.mode === "500") return route.fulfill({ status: 500, headers: { "access-control-allow-origin": "*" }, body: "x" });
    const body = u.includes("/rest/v1/course") ? live.courses : live.recipes;
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
  });
};

test("S-55.1 failed load shows the message and a Try again button (network and HTTP error)", async ({ page }) => {
  const state = { mode: "abort", recipeReqs: 0 };
  await switchable(page, state);
  await page.goto(base);
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
  state.mode = "500";
  await page.reload();
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
});

test("S-55.2 no recipe cards while the message shows", async ({ page }) => {
  await switchable(page, { mode: "abort", recipeReqs: 0 });
  await page.goto(base);
  await expect(failMsg(page)).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.getByRole("searchbox", { name: "Search recipes" })).toHaveCount(0);
});

test("S-55.3 Try again asks for the recipes again", async ({ page }) => {
  const state = { mode: "abort", recipeReqs: 0 };
  await switchable(page, state);
  await page.goto(base);
  await expect(tryBtn(page)).toBeVisible();
  const before = state.recipeReqs;
  expect(before).toBeGreaterThanOrEqual(1);
  await tryBtn(page).tap();
  await expect.poll(() => state.recipeReqs).toBeGreaterThan(before);
});

test("S-55.4 recipes load after Try again: Home as S-54.2, message gone", async ({ page }) => {
  const state = { mode: "abort", recipeReqs: 0 };
  await switchable(page, state);
  await page.goto(base);
  await expect(tryBtn(page)).toBeVisible();
  state.mode = "ok";
  await tryBtn(page).tap();
  await expect(page.locator("#grid .card")).toHaveCount(live.recipes.length);
  await expect(failMsg(page)).toHaveCount(0);
  await expect(tryBtn(page)).toHaveCount(0);
  const n = await names(page);
  expect(n).toEqual([...n].sort(cmp));
  await expect(page.locator("#chips .chip.on")).toHaveText("All");
  await expect(page.getByLabel("Sort by")).toHaveValue("name");
  await expect(page.getByRole("searchbox", { name: "Search recipes" })).toHaveValue("");
  await expect(page.locator("#count")).toHaveText(`${live.recipes.length} recipes`);
});

test("S-55.5 still failing after Try again: message and button remain, and can be retried again", async ({ page }) => {
  const state = { mode: "500", recipeReqs: 0 };
  await switchable(page, state);
  await page.goto(base);
  await expect(tryBtn(page)).toBeVisible();
  const before = state.recipeReqs;
  await tryBtn(page).tap();
  await expect.poll(() => state.recipeReqs).toBeGreaterThan(before);
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(0);
  state.mode = "ok";
  await tryBtn(page).tap();
  await expect(page.locator("#grid .card")).toHaveCount(live.recipes.length);
});

test("S-55.6 header still shows while the message shows, and after Try again", async ({ page }) => {
  const state = { mode: "abort", recipeReqs: 0 };
  await switchable(page, state);
  await page.goto(base);
  await expect(failMsg(page)).toBeVisible();
  await header(page);
  await tryBtn(page).tap();
  await expect(failMsg(page)).toBeVisible();
  await header(page);
});
