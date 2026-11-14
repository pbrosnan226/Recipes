// S-54: the Home page loads its recipes from Supabase. The shell is built into a temp copy (site/dist is never touched),
// served on a random port. Live data (26 recipes) is used where it can give the case; page.route stubs the rest.
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s54-"));
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

test("S-54.1 asks Supabase with the project address and public key from the settings", async ({ page }) => {
  const reqs = [];
  page.on("request", (r) => { if (isRest(r.url())) reqs.push(r); });
  await page.goto(base);
  await expect(page.locator("#grid .card").first()).toBeVisible();
  expect(reqs.length).toBeGreaterThanOrEqual(1);
  expect(reqs.some((r) => r.url().includes("/rest/v1/recipe?"))).toBe(true);
  for (const r of reqs) {
    const h = await r.allHeaders();
    expect(h.apikey).toBe(KEY);
    expect(h["accept-profile"]).toBe("recipes");
  }
});

test("S-54.2 one card per database recipe, A to Z, All, Name, empty search", async ({ page }) => {
  expect(live.recipes.length).toBe(26);
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(26);
  const n = await names(page);
  expect(n.length).toBe(26);
  expect(n).toEqual([...n].sort(cmp));
  expect([...n].sort()).toEqual(live.recipes.map((r) => r.name).sort());
  await expect(page.locator("#chips .chip.on")).toHaveText("All");
  await expect(page.locator("#chips .chip", { hasText: /^All$/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Sort by")).toHaveValue("name");
  await expect(page.getByRole("searchbox", { name: "Search recipes" })).toHaveValue("");
  await expect(page.locator("#count")).toHaveText("26 recipes");
});

test("S-54.3 each card shows course, name, tags and photo from the database", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(26);
  let withPhoto = 0;
  for (const r of live.recipes) {
    const card = page.locator("#grid .card", { has: page.locator("a.name", { hasText: new RegExp(`^${r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }) });
    await expect(card).toHaveCount(1);
    await expect(card.locator("a.name")).toHaveAttribute("href", "/recipe?name=" + encodeURIComponent(r.slug));
    if (r.course) await expect(card.locator(".eyebrow")).toHaveText(r.course.name);
    else await expect(card.locator(".eyebrow")).toHaveCount(0);
    const tags = [...r.recipe_tag].sort((a, b) => a.position - b.position).map((t) => t.tag.name);
    expect(await card.locator("a.tag").allInnerTexts()).toEqual(tags);
    if (r.photo_path) {
      withPhoto++;
      await expect(card.locator("img")).toHaveAttribute("src", new RegExp("^" + URL_.replace(/\./g, "\\.") + "/storage/v1/object/public/recipe-photos/"));
    }
  }
  expect(withPhoto).toBeGreaterThan(0);
  // a photo actually loads
  const img = page.locator("#grid .card img").first();
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0), { timeout: 15000 }).toBe(true);
});

test("S-54.4 no write request, no key other than the public one", async ({ page }) => {
  const all = [];
  page.on("request", (r) => all.push(r));
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(26);
  await page.locator("#chips .chip").nth(1).tap();
  const sup = all.filter((r) => r.url().startsWith(URL_));
  expect(sup.length).toBeGreaterThan(0);
  for (const r of sup) expect(r.method(), r.url()).toBe("GET");
  for (const r of all) {
    const h = await r.allHeaders();
    const blob = r.url() + JSON.stringify(h) + (r.postData() || "");
    expect(blob).not.toMatch(/sb_secret_|service_role/);
    expect(blob).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\./);
    for (const k of ["apikey", "authorization"]) if (h[k]) expect(h[k].replace("Bearer ", "")).toBe(KEY);
  }
  const html = await page.content();
  expect(html).not.toMatch(/sb_secret_|service_role/);
  const cfg = await page.evaluate(() => JSON.stringify(window.RECIPES_CONFIG));
  expect(JSON.parse(cfg)).toEqual({ supabaseUrl: URL_, supabaseKey: KEY });
});

test("S-54.5 a recipe added to the database shows on the next load, no rebuild", async ({ page }) => {
  await stub(page, { recipes: [rec("Alpha"), rec("Charlie")] });
  await page.goto(base);
  expect(await names(page)).toEqual(["Alpha", "Charlie"]);
  await page.unroute(URL_ + "/rest/v1/**");
  await stub(page, { recipes: [rec("Alpha"), rec("Bravo New"), rec("Charlie")] });
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(3);
  expect(await names(page)).toEqual(["Alpha", "Bravo New", "Charlie"]);
});

test("S-54.6 a recipe deleted from the database is gone on the next load", async ({ page }) => {
  await stub(page, { recipes: [rec("Alpha"), rec("Bravo"), rec("Charlie")] });
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(3);
  await page.unroute(URL_ + "/rest/v1/**");
  await stub(page, { recipes: [rec("Alpha"), rec("Charlie")] });
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(2);
  expect(await names(page)).toEqual(["Alpha", "Charlie"]);
});

test("S-54.7a chips filter the loaded recipes with no further request", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(26);
  await page.waitForLoadState("networkidle");
  const after = [];
  page.on("request", (r) => { if (!r.url().includes("/storage/v1/object/public/")) after.push(r.url()); });
  // course chip
  const withCourse = { course: { name: "Main" } };
  const chip = page.locator("#chips .chip", { hasText: new RegExp(`^${withCourse.course.name}$`) });
  await chip.tap();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  const expected = live.recipes.filter((r) => r.course && r.course.name === withCourse.course.name).length;
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(expected);
  await page.locator("#chips .chip", { hasText: /^All$/ }).tap();
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(26);
  expect(after).toEqual([]);
});

test("S-54.7b sort, search and tag selection need no further request", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(26);
  await page.waitForLoadState("networkidle");
  const after = [];
  page.on("request", (r) => { if (!r.url().includes("/storage/v1/object/public/")) after.push(r.url()); });

  // sort
  await page.getByLabel("Sort by").selectOption("site");
  await expect(page.getByLabel("Sort by")).toHaveValue("site");
  await page.getByLabel("Sort by").selectOption("name");
  // search
  const q = page.getByRole("searchbox", { name: "Search recipes" });
  const word = live.recipes[0].name.split(" ")[0];
  await q.fill(word);
  const hits = live.recipes.filter((r) => [r.name, r.site, ...r.recipe_tag.map((t) => t.tag.name)].some((f) => f && f.toLowerCase().includes(word.toLowerCase()))).length;
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(hits);
  await q.fill("zzzqqq");
  await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
  await q.fill("");
  // tag
  const tag = page.locator("#grid .card a.tag").first();
  const tagName = (await tag.innerText()).trim();
  await tag.tap();
  await expect(q).toHaveValue(tagName);
  await expect(page.locator("#grid .card:not([hidden])").first()).toBeVisible();
  expect(after).toEqual([]);
});

test("S-54.8 while loading, nothing extra shows", async ({ page }) => {
  await stub(page, { delay: 2500 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await expect(page.locator("header .logo")).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.getByText("Nothing matches")).toHaveCount(0);
  await expect(page.locator("#count")).toHaveCount(0);
  await expect(page.locator("[role=progressbar], [aria-busy=true], .spinner, .loading, .skeleton")).toHaveCount(0);
  const mainText = (await page.locator("main").innerText()).trim();
  expect(mainText).toBe("Everything we cook.");
  await expect(page.locator("#grid .card")).toHaveCount(live.recipes.length, { timeout: 15000 });
});

test("S-54.9 no recipes: no cards and the nothing-matches message", async ({ page }) => {
  await stub(page, { recipes: [] });
  await page.goto(base);
  await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
  await expect(page.locator("#grid .card")).toHaveCount(0);
});

test("S-54.10 header shows while loading, once loaded, and when loading fails", async ({ page }) => {
  const header = async () => {
    await expect(page.locator("header .logo")).toHaveText("Recipes");
    await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
  };
  await stub(page, { delay: 2000 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await header();
  await expect(page.locator("#grid .card").first()).toBeVisible({ timeout: 15000 });
  await header();
  await page.unroute(URL_ + "/rest/v1/**");
  await stub(page, { fail: true });
  await page.reload();
  await page.waitForTimeout(800);
  await header();
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.getByText("Nothing matches")).toHaveCount(0);
  // HTTP error too
  await page.unroute(URL_ + "/rest/v1/**");
  await page.route(URL_ + "/rest/v1/**", (r) => r.fulfill({ status: 500, headers: { "access-control-allow-origin": "*" }, body: "x" }));
  await page.reload();
  await page.waitForTimeout(800);
  await header();
  await expect(page.locator(".card")).toHaveCount(0);
});

test("S-54.11 course chips are All then the COURSE table in position order", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#chips .chip").first()).toBeVisible();
  const expected = ["All", ...[...live.courses].sort((a, b) => a.position - b.position).map((c) => c.name)];
  expect(await page.locator("#chips .chip").allInnerTexts()).toEqual(expected);
  // stubbed order and names drive the chips
  await page.unroute(URL_ + "/rest/v1/**").catch(() => {});
  await stub(page, { courses: [{ name: "Zeta", position: 1 }, { name: "Alpha", position: 2 }], recipes: [rec("X", { course: { name: "Zeta" } })] });
  await page.reload();
  await expect(page.locator("#chips .chip")).toHaveText(["All", "Zeta", "Alpha"]);
});
