// S-58: the Recipe page when the recipe can't be loaded. The shell is built into a temp copy (site/dist is never touched)
// and served on a random port. Live data (26 recipes) is compared with what the page shows; page.route stubs the rest.
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
const SELECT = "*,course(name),recipe_tag(position,tag(name)),serving_option(*),recipe_ingredient(*),step(*),recipe_note(*),nutrient(*)";

let server, base, dist;
const cache = {};
const live = async (slug) => {
  if (!cache[slug]) {
    const r = await fetch(`${URL_}/rest/v1/recipe?select=${encodeURIComponent(SELECT)}&slug=eq.${slug}`, { headers: H });
    cache[slug] = (await r.json())[0];
  }
  return cache[slug];
};
const byPos = (a, b) => a.position - b.position;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s58-"));
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
});
test.afterAll(() => server && server.close());


const failMsg = (page) => page.getByText("Couldn't load recipes.");
const tryBtn = (page) => page.getByRole("button", { name: "Try again" });
const header = async (page) => {
  await expect(page.locator("header .logo")).toHaveText("Recipes");
  await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
};
const snapshot = (page) =>
  page.evaluate(() => {
    const t = (s) => Array.from(document.querySelectorAll(s)).map((e) => e.textContent.trim());
    return { h1: t("h1"), lead: t(".lead"), facts: t(".fact"), ings: t("#ing li"), steps: t("#steps li"), notes: t(".notes li"), nutr: t("details.nutr"), src: t(".srclink") };
  });
// switchable stub: mode abort | 500 | ok | empty; counts and records recipe requests
const switchable = async (page, state) => {
  await page.route(URL_ + "/rest/v1/recipe?**", async (route) => {
    state.reqs.push(route.request().url());
    if (state.mode === "abort") return route.abort();
    if (state.mode === "500") return route.fulfill({ status: 500, headers: { "access-control-allow-origin": "*" }, body: "x" });
    const body = state.mode === "empty" ? [] : [state.data];
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
  });
};
const mk = async (mode) => ({ mode, reqs: [], data: await live("french-toast") });
const go = (page) => page.goto(`${base}recipe?name=french-toast`);

test("S-58.1 failed load shows the message and a Try again button (network and HTTP error)", async ({ page }) => {
  const state = await mk("abort");
  await switchable(page, state);
  await go(page);
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
  state.mode = "500";
  await page.reload();
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
});

test("S-58.2 no recipe content while the message shows", async ({ page }) => {
  for (const mode of ["abort", "500"]) {
    await switchable(page, await mk(mode));
    await go(page);
    await expect(failMsg(page)).toBeVisible();
    for (const sel of ["h1", "#ing", "#steps", ".notes", "details.nutr", ".photo", ".srclink", ".eyebrow", ".lead", ".fact", "#sv", "input[type=checkbox]"])
      await expect(page.locator(sel), sel).toHaveCount(0);
    await expect(page.getByText("French Toast")).toHaveCount(0);
    await page.unroute(URL_ + "/rest/v1/recipe?**");
  }
});

test("S-58.3 Try again asks for the same recipe again", async ({ page }) => {
  const state = await mk("abort");
  await switchable(page, state);
  await go(page);
  await expect(tryBtn(page)).toBeVisible();
  const before = state.reqs.length;
  expect(before).toBeGreaterThanOrEqual(1);
  await tryBtn(page).tap();
  await expect.poll(() => state.reqs.length).toBeGreaterThan(before);
  for (const u of state.reqs) expect(new URL(u).searchParams.get("slug")).toBe("eq.french-toast");
  await expect(page).toHaveURL(`${base}recipe?name=french-toast`);
});

test("S-58.4 recipe loads after Try again: shown as S-57.3, message gone", async ({ page }) => {
  const d = await live("french-toast");
  const state = await mk("500");
  await switchable(page, state);
  await go(page);
  await expect(tryBtn(page)).toBeVisible();
  state.mode = "ok";
  await tryBtn(page).tap();
  await expect(page.locator("#recipe h1")).toHaveText(d.name);
  await expect(failMsg(page)).toHaveCount(0);
  await expect(tryBtn(page)).toHaveCount(0);
  await expect(page).toHaveTitle(d.name);
  if (d.description) await expect(page.locator(".lead")).toHaveText(d.description);
  const visible = d.recipe_ingredient.filter((i) => !i.hidden);
  await expect(page.locator("#ing li:not(.sub)")).toHaveCount(visible.length);
  await expect(page.locator("#steps li")).toHaveCount(d.step.length);
  await expect(page.getByRole("link", { name: "Back to all recipes" })).toBeVisible();
  // identical to a normal load
  const afterRetry = await snapshot(page);
  state.mode = "ok";
  await page.reload();
  await expect(page.locator("#recipe h1")).toBeVisible();
  expect(await snapshot(page)).toEqual(afterRetry);
});

test("S-58.5 still failing after Try again: message and button remain, and can be tried again", async ({ page }) => {
  const state = await mk("abort");
  await switchable(page, state);
  await go(page);
  await expect(tryBtn(page)).toBeVisible();
  const n1 = state.reqs.length;
  await tryBtn(page).tap();
  await expect.poll(() => state.reqs.length).toBeGreaterThan(n1);
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(0);
  state.mode = "500";
  const n2 = state.reqs.length;
  await tryBtn(page).tap();
  await expect.poll(() => state.reqs.length).toBeGreaterThan(n2);
  await expect(failMsg(page)).toBeVisible();
  await expect(tryBtn(page)).toBeVisible();
  // and it still recovers
  state.mode = "ok";
  await tryBtn(page).tap();
  await expect(page.locator("#recipe h1")).toBeVisible();
});

test("S-58.6 a failed request shows the message; an empty (200, []) answer does not", async ({ page }) => {
  const state = await mk("empty");
  await switchable(page, state);
  await go(page);
  await expect.poll(() => state.reqs.length).toBe(1);
  await page.waitForLoadState("networkidle");
  await expect(failMsg(page)).toHaveCount(0);
  await expect(tryBtn(page)).toHaveCount(0);
  await expect(page.locator("#recipe h1")).toHaveCount(0);
  await header(page);
  // the same page with a failing request does show it
  state.mode = "500";
  await page.reload();
  await expect(failMsg(page)).toBeVisible();
  // live database, a slug that does not exist: a real empty answer, no failure message
  await page.unroute(URL_ + "/rest/v1/recipe?**");
  await page.goto(`${base}recipe?name=no-such-recipe-xyz`);
  await page.waitForLoadState("networkidle");
  await expect(failMsg(page)).toHaveCount(0);
  await expect(tryBtn(page)).toHaveCount(0);
});

test("S-58.7 the site header shows while the message shows", async ({ page }) => {
  const state = await mk("abort");
  await switchable(page, state);
  await go(page);
  await expect(failMsg(page)).toBeVisible();
  await header(page);
  state.mode = "500";
  await tryBtn(page).tap();
  await expect.poll(() => state.reqs.length).toBe(2);
  await expect(failMsg(page)).toBeVisible();
  await header(page);
  await page.locator("header .logo").tap();
  await expect(page).toHaveURL(base);
});
