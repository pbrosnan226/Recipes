// S-62: search the Home list by ingredient name. Shell built into a temp copy (site/dist untouched).
// Expected sets are computed from live data fetched with a separate query (recipe + recipe_ingredient tables).
// Original header: S-54: the Home page loads its recipes from Supabase. The shell is built into a temp copy (site/dist is never touched),
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
const RECIPES_Q = "recipe?select=name,slug,site,photo_path,course(name),recipe_tag(position,tag(name)),recipe_ingredient(name)&recipe_ingredient.hidden=eq.false&order=name";

let server, base, dist;
let live; // { recipes, courses, ings }

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s62-"));
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
  // independent view of the data: every recipe with its tags, every ingredient row with all its columns
  const full = await get("recipe?select=id,name,site,course(name),recipe_tag(tag(name))&limit=1000");
  const ings = await get("recipe_ingredient?select=recipe_id,name,hidden,text_as_written,group_name,unit_singular,unit_plural&limit=1000");
  expect(ings.length).toBeLessThan(1000);
  live.full = full.map((r) => ({
    name: r.name, site: r.site, course: r.course && r.course.name, tags: r.recipe_tag.map((t) => t.tag.name),
    ings: ings.filter((i) => i.recipe_id === r.id),
  }));
  live.ings = ings;
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


const searchbox = (page) => page.getByRole("searchbox", { name: "Search recipes" });
const matchBase = (r, t) => [r.name, r.site, ...r.tags].some((f) => f && f.toLowerCase().includes(t));
const matchIng = (r, t) => r.ings.some((i) => !i.hidden && (i.name || "").toLowerCase().includes(t));
const expectedNames = (t, extra = () => true) =>
  live.full.filter((r) => extra(r) && (matchBase(r, t) || matchIng(r, t))).map((r) => r.name).sort(cmp);
// a word that is in some ingredient's name but in no recipe's name, site or tags: only ingredient matching can find it
const ingredientOnlyWords = () => {
  const words = new Set();
  for (const i of live.ings) if (!i.hidden) for (const w of (i.name || "").toLowerCase().match(/[a-z]{4,}/g) || []) words.add(w);
  return [...words].filter((w) => live.full.some((r) => !matchBase(r, w) && matchIng(r, w))).sort();
};
const open = async (page) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(live.recipes.length);
};
const dataFor = (url, recipes) => {
  // emulate PostgREST: recipe_ingredient.hidden=eq.false drops hidden embedded rows
  const noHidden = url.includes("recipe_ingredient.hidden=eq.false");
  return recipes.map((r) => ({ ...r, recipe_ingredient: (r.recipe_ingredient || []).filter((i) => !(noHidden && i.hidden)) }));
};
const stubIng = async (page, recipes, courses = []) => {
  await page.route(URL_ + "/rest/v1/**", (route) => {
    const u = route.request().url();
    const body = u.includes("/rest/v1/course") ? courses : dataFor(u, recipes);
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
  });
};
const ing = (name, extra = {}) => ({ name, hidden: false, ...extra });

test("S-62.1 typing an ingredient name shows every recipe with such an ingredient, plus name/site/tag matches", async ({ page }) => {
  const only = ingredientOnlyWords();
  expect(only.length).toBeGreaterThan(3);
  // also real ingredient words that overlap with name/tag matches
  const mixed = ["chicken", "butter", "garlic", "chocolate"].filter((w) => expectedNames(w).length > 0);
  await open(page);
  const q = searchbox(page);
  for (const w of [...only.slice(0, 5), only[only.length - 1], ...mixed]) {
    await q.fill(w);
    const want = expectedNames(w);
    await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(want.length);
    expect(await names(page), w).toEqual(want);
  }
  // as the Visitor types, each keystroke updates the cards
  const w = only[0];
  await q.fill("");
  await q.pressSequentially(w, { delay: 30 });
  expect(await names(page)).toEqual(expectedNames(w));
  // the ingredient-only word shows recipes that name/site/tag matching alone would not
  const base_ = live.full.filter((r) => matchBase(r, w)).length;
  expect((await names(page)).length).toBeGreaterThan(base_);
  // whole ingredient name, and a word from the middle of a name
  const full = live.ings.find((i) => !i.hidden && i.name && i.name.length > 8).name;
  await q.fill(full);
  expect(await names(page)).toEqual(expectedNames(full.toLowerCase().trim()));
  expect((await names(page)).length).toBeGreaterThan(0);
});

test("S-62.2 ingredient match ignores upper and lower case", async ({ page }) => {
  const w = ingredientOnlyWords()[0];
  const want = expectedNames(w);
  expect(want.length).toBeGreaterThan(0);
  await open(page);
  const q = searchbox(page);
  for (const v of [w, w.toUpperCase(), w[0].toUpperCase() + w.slice(1), w.split("").map((c, i) => (i % 2 ? c : c.toUpperCase())).join("")]) {
    await q.fill(v);
    await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(want.length);
    expect(await names(page), v).toEqual(want);
  }
  // an ingredient stored with capitals is found by lower-case text
  await page.unroute(URL_ + "/rest/v1/**").catch(() => {});
  await stubIng(page, [{ ...rec("Plain Dish"), recipe_ingredient: [ing("Saffron THREADS")] }, { ...rec("Other Dish"), recipe_ingredient: [ing("water")] }]);
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(2);
  for (const v of ["saffron threads", "SAFFRON", "sAfFrOn thr"]) {
    await q.fill(v);
    expect(await names(page), v).toEqual(["Plain Dish"]);
  }
});

test("S-62.3 an ingredient marked hidden is not matched", async ({ page }) => {
  // live: the hidden rows exist, and the page's request asks the server to leave them out
  const hiddenRows = live.ings.filter((i) => i.hidden);
  expect(hiddenRows.length).toBeGreaterThan(0);
  const reqs = [];
  page.on("request", (r) => { if (r.url().includes("/rest/v1/recipe?")) reqs.push(r.url()); });
  await open(page);
  expect(reqs.length).toBeGreaterThan(0);
  for (const u of reqs) expect(u).toContain("recipe_ingredient.hidden=eq.false");
  // live hidden rows have an empty name: nothing searchable is lost or gained
  for (const w of ingredientOnlyWords().slice(0, 3)) {
    await searchbox(page).fill(w);
    expect(await names(page)).toEqual(expectedNames(w));
  }
  // stub with a hidden ingredient that has a real name (server filter emulated from the request URL)
  await page.unroute(URL_ + "/rest/v1/**").catch(() => {});
  await stubIng(page, [
    { ...rec("Alpha Dish"), recipe_ingredient: [ing("Secret Saffron", { hidden: true }), ing("rice")] },
    { ...rec("Bravo Dish"), recipe_ingredient: [ing("saffron")] },
    { ...rec("Charlie Dish"), recipe_ingredient: [ing("Hidden Truffle", { hidden: true })] },
  ]);
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(3);
  const q = searchbox(page);
  await q.fill("saffron");
  expect(await names(page)).toEqual(["Bravo Dish"]);
  await q.fill("truffle");
  expect(await names(page)).toEqual([]);
  await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
  await q.fill("rice");
  expect(await names(page)).toEqual(["Alpha Dish"]);
});

test("S-62.4 only the ingredient's name is searched", async ({ page }) => {
  // live: words that sit only in an ingredient's text as written, unit or group name find nothing extra
  const cand = new Set();
  for (const i of live.ings) {
    for (const f of [i.text_as_written, i.group_name, i.unit_singular, i.unit_plural])
      for (const w of (f || "").toLowerCase().match(/[a-z]{4,}/g) || []) cand.add(w);
  }
  const onlyElsewhere = [...cand].filter((w) => expectedNames(w).length === 0).sort();
  expect(onlyElsewhere.length).toBeGreaterThan(0);
  const groupOnly = live.ings.map((i) => (i.group_name || "").toLowerCase()).filter(Boolean);
  const unitOnly = live.ings.map((i) => (i.unit_singular || "").toLowerCase()).filter((u) => u && expectedNames(u).length === 0);
  await open(page);
  const q = searchbox(page);
  for (const w of onlyElsewhere.slice(0, 8)) {
    await q.fill(w);
    expect(await names(page), w).toEqual([]);
    await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
  }
  // a whole group name, if it is found only as a group name
  const g = groupOnly.find((x) => expectedNames(x).length === 0);
  if (g) { await q.fill(g); expect(await names(page)).toEqual([]); }
  void unitOnly;
  // stub: words in as-written text, amount, unit, group, step and note, none in any name
  await page.unroute(URL_ + "/rest/v1/**").catch(() => {});
  await stubIng(page, [
    { ...rec("Alpha Dish"), recipe_ingredient: [ing("flour", { text_as_written: "2 zorbcups butterwort flour", quantity: 2.75, unit_singular: "zorbcup", group_name: "Quuxcrust" })],
      steps: [{ text: "Whisk the plinthwort in" }], notes: [{ text: "Notewort keeps a week" }] },
    { ...rec("Bravo Dish"), recipe_ingredient: [ing("sugar", { group_name: "Quuxcrust" })] },
    { ...rec("Charlie Dish"), recipe_ingredient: [ing("zorbwort oil")] },
  ]);
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(3);
  for (const w of ["zorbcup", "butterwort", "2.75", "quuxcrust", "plinthwort", "notewort", "2 zorb"]) {
    await q.fill(w);
    expect(await names(page), w).toEqual([]);
  }
  await q.fill("zorbwort");
  expect(await names(page)).toEqual(["Charlie Dish"]);
  await q.fill("flour");
  expect(await names(page)).toEqual(["Alpha Dish"]);
});

test("S-62.5 ingredient search combines with the course chip and Sort by", async ({ page }) => {
  const only = ingredientOnlyWords();
  // pick a word whose matches span more than one course
  const w = only.find((x) => new Set(live.full.filter((r) => matchIng(r, x)).map((r) => r.course)).size > 1) || only[0];
  const courses = [...new Set(live.full.filter((r) => matchIng(r, w) || matchBase(r, w)).map((r) => r.course))].filter(Boolean);
  expect(courses.length).toBeGreaterThan(0);
  await open(page);
  const q = searchbox(page);
  await q.fill(w);
  expect(await names(page)).toEqual(expectedNames(w));
  for (const c of courses) {
    await page.locator("#chips .chip", { hasText: new RegExp(`^${c}$`) }).tap();
    const want = expectedNames(w, (r) => r.course === c);
    await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(want.length);
    expect(await names(page), c).toEqual(want);
    // typing after choosing the chip keeps the chip
    await q.fill(w.toUpperCase());
    expect(await names(page), c + " upper").toEqual(want);
    await q.fill(w);
  }
  // a course with no ingredient match shows nothing
  const empty = live.courses.map((c) => c.name).find((c) => expectedNames(w, (r) => r.course === c).length === 0);
  if (empty) {
    await page.locator("#chips .chip", { hasText: new RegExp(`^${empty}$`) }).tap();
    expect(await names(page)).toEqual([]);
    await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
  }
  // All again, then Sort by Site: recipes with no site last, then site A to Z, then name
  await page.locator("#chips .chip", { hasText: /^All$/ }).tap();
  await page.getByLabel("Sort by").selectOption("site");
  const sites = live.full.filter((r) => matchBase(r, w) || matchIng(r, w));
  sites.sort((a, b) => {
    if (!a.site !== !b.site) return !a.site ? 1 : -1;
    if (a.site) { const c = cmp(a.site, b.site); if (c) return c; }
    return cmp(a.name, b.name);
  });
  expect(await names(page)).toEqual(sites.map((r) => r.name));
  // chip + sort + search together
  const c0 = courses[0];
  await page.locator("#chips .chip", { hasText: new RegExp(`^${c0}$`) }).tap();
  expect(await names(page)).toEqual(sites.filter((r) => r.course === c0).map((r) => r.name));
  // back to Name
  await page.getByLabel("Sort by").selectOption("name");
  expect(await names(page)).toEqual(expectedNames(w, (r) => r.course === c0));
});

test("S-62.6 count and the nothing-matches message follow the cards", async ({ page }) => {
  const only = ingredientOnlyWords();
  const one = only.find((x) => expectedNames(x).length === 1);
  const many = only.find((x) => expectedNames(x).length > 1);
  await open(page);
  const q = searchbox(page);
  const none = page.getByText("Nothing matches that. Try another word.");
  await expect(none).toBeHidden();
  if (one) {
    await q.fill(one);
    await expect(page.locator("#count")).toHaveText("1 recipe");
    await expect(none).toBeHidden();
  }
  expect(many, "a live ingredient word with several recipes").toBeTruthy();
  const n = expectedNames(many).length;
  await q.fill(many);
  await expect(page.locator("#count")).toHaveText(`${n} recipes`);
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(n);
  await expect(none).toBeHidden();
  await q.fill("zzzqqq");
  await expect(page.locator("#count")).toHaveText("0 recipes");
  await expect(none).toBeVisible();
  await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(0);
  await q.fill(many.toUpperCase());
  await expect(page.locator("#count")).toHaveText(`${n} recipes`);
  await expect(none).toBeHidden();
  await q.fill("");
  await expect(page.locator("#count")).toHaveText(`${live.recipes.length} recipes`);
  await expect(none).toBeHidden();
  // stub: a word only in an ingredient's unit gives the message, a word in an ingredient name gives one card
  await page.unroute(URL_ + "/rest/v1/**").catch(() => {});
  await stubIng(page, [{ ...rec("Alpha Dish"), recipe_ingredient: [ing("kale", { unit_singular: "bunchwort" })] }, rec("Bravo Dish")]);
  await page.reload();
  await expect(page.locator("#grid .card")).toHaveCount(2);
  await q.fill("kale");
  await expect(page.locator("#count")).toHaveText("1 recipe");
  await q.fill("bunchwort");
  await expect(page.locator("#count")).toHaveText("0 recipes");
  await expect(none).toBeVisible();
});

test("S-62.7 searching by ingredient needs no further request after loading", async ({ page }) => {
  const only = ingredientOnlyWords();
  await open(page);
  await page.waitForLoadState("networkidle");
  const after = [];
  page.on("request", (r) => { if (!r.url().includes("/storage/v1/object/public/")) after.push(r.method() + " " + r.url()); });
  const q = searchbox(page);
  for (const w of [...only.slice(0, 4), only[0].toUpperCase(), "zzzqqq"]) {
    await q.fill(w);
    await expect(page.locator("#count")).toBeVisible();
  }
  await q.pressSequentially(only[1], { delay: 20 });
  await page.locator("#chips .chip").nth(2).tap();
  await page.getByLabel("Sort by").selectOption("site");
  await q.fill("");
  await page.waitForLoadState("networkidle");
  expect(after).toEqual([]);
});
