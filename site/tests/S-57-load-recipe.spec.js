// S-57: the Recipe page loads one recipe from Supabase. The shell is built into a temp copy (site/dist is never touched)
// and served on a random port. Live data (however many recipes are in the database) is compared with what the page shows; page.route stubs the rest.
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
let total; // recipes in the database
const byPos = (a, b) => a.position - b.position;

test.beforeAll(async () => {
  total = (await (await fetch(`${URL_}/rest/v1/recipe?select=slug`, { headers: H })).json()).length;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s57-"));
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

const open = async (page, slug) => {
  await page.goto(`${base}recipe?name=${slug}`);
  await expect(page.locator("#recipe h1")).toBeVisible();
};
const header = async (page) => {
  await expect(page.locator("header .logo")).toHaveText("Recipes");
  await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
};
// everything the page shows, in a comparable form
const snapshot = (page) =>
  page.evaluate(() => {
    const t = (s) => Array.from(document.querySelectorAll(s)).map((e) => e.textContent.trim());
    return {
      h1: t("h1"), eyebrow: t(".eyebrow"), lead: t(".lead"), facts: t(".fact"), tags: t(".rtags a"),
      ings: t("#ing li"), steps: t("#steps li"), notes: t(".notes li"), nutr: t("details.nutr"), src: t(".srclink"),
    };
  });

test("S-57.1 selecting a card opens /recipe?name=<slug>", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(total);
  const card = page.locator("#grid .card", { has: page.getByRole("link", { name: "French Toast", exact: true }) });
  await card.locator("a.name").tap();
  await expect(page).toHaveURL(`${base}recipe?name=french-toast`);
  await expect(page.locator("#recipe h1")).toHaveText("French Toast");
});

test("S-57.2 the page asks Supabase (public key, GET) for the recipe by slug with all its parts", async ({ page }) => {
  const reqs = [];
  page.on("request", (r) => { if (r.url().startsWith(URL_)) reqs.push(r); });
  await open(page, "apple-crumble-pie");
  const recipeReqs = reqs.filter((r) => r.url().includes("/rest/v1/recipe?"));
  expect(recipeReqs.length).toBe(1);
  const r = recipeReqs[0];
  const u = new URL(r.url());
  expect(u.searchParams.get("slug")).toBe("eq.apple-crumble-pie");
  const sel = u.searchParams.get("select");
  for (const part of ["course", "recipe_tag", "serving_option", "recipe_ingredient", "step", "recipe_note", "nutrient"]) {
    expect(sel, part).toContain(part);
  }
  const h = await r.allHeaders();
  expect(h["apikey"]).toBe(KEY);
  expect(h["accept-profile"]).toBe("recipes");
  expect(r.method()).toBe("GET");
});

const SLUGS = ["apple-crumble-pie", "french-toast", "honey-garlic-chicken", "corn-fritters", "mac-and-cheese", "kotlet", "west-indian-rice-and-beans"];
for (const slug of SLUGS) {
  test(`S-57.3 ${slug} is shown from the database`, async ({ page }) => {
    const d = await live(slug);
    await open(page, slug);
    await header(page);
    await expect(page.locator("h1")).toHaveText(d.name);
    await expect(page).toHaveTitle(d.name);
    // course above the name
    if (d.course) {
      await expect(page.locator(".eyebrow")).toHaveText(d.course.name);
      const [cy, ny] = await Promise.all([page.locator(".eyebrow").boundingBox(), page.locator("h1").boundingBox()]);
      expect(cy.y).toBeLessThan(ny.y);
    } else await expect(page.locator(".eyebrow")).toHaveCount(0);
    if (d.description) await expect(page.locator(".lead")).toHaveText(d.description);
    // times as written, labelled
    for (const [label, v] of [["Prep", d.prep_time], ["Cook", d.cook_time], ["Total", d.total_time]]) {
      const f = page.locator(".fact", { has: page.locator(".label", { hasText: new RegExp("^" + label + "$") }) });
      if (v) await expect(f.locator(".v")).toHaveText(v);
      else await expect(f).toHaveCount(0);
    }
    // photo
    if (d.photo_path) {
      await expect(page.locator(".photo img")).toHaveAttribute("src", new RegExp("/storage/v1/object/public/recipe-photos/"));
    }
    // ingredients: one row per non-hidden ingredient, sub-headings for groups
    const visible = d.recipe_ingredient.filter((i) => !i.hidden).sort(byPos);
    await expect(page.locator("#ing li:not(.sub)")).toHaveCount(visible.length);
    await expect(page.locator("#ing li:not(.sub) input[type=checkbox]")).toHaveCount(visible.length);
    await expect(page.locator("#ing li.sub input")).toHaveCount(0);
    const groups = [];
    visible.forEach((i) => { if (i.group_name && groups[groups.length - 1] !== i.group_name) groups.push(i.group_name); });
    expect(await page.locator("#ing li.sub").allInnerTexts()).toEqual(groups);
    // method
    const steps = [...d.step].sort(byPos);
    await expect(page.locator("#steps li")).toHaveCount(steps.length);
    await expect(page.locator("#steps")).not.toContainText("{");
    // notes
    if (d.recipe_note.length) await expect(page.locator(".notes li")).toHaveCount(d.recipe_note.length);
    else await expect(page.locator(".notes")).toHaveCount(0);
    // nutrition: closed, opens on tap, name + amount as written
    if (d.nutrient.length) {
      const det = page.locator("details.nutr");
      await expect(det).not.toHaveAttribute("open", /.*/);
      await det.locator("summary").tap();
      await expect(det).toHaveAttribute("open", /.*/);
      if (d.nutrition_basis) await expect(det.locator(".basis")).toHaveText(d.nutrition_basis);
      for (const n of d.nutrient) await expect(det.locator(".vals")).toContainText(`${n.name} ${n.amount}`);
    } else await expect(page.locator("details.nutr")).toHaveCount(0);
    // source link
    const label = d.site || d.source_url;
    await expect(page.locator(".srclink")).toContainText(`Original recipe at ${label}` + (d.author ? `, by ${d.author}` : ""));
    if (!d.author) await expect(page.locator(".srclink")).not.toContainText(", by ");
    await expect(page.getByRole("link", { name: "Back to all recipes" })).toBeVisible();
  });
}

test("S-57.4 opening the address directly (typed, reloaded) shows the same recipe as selecting its card", async ({ page }) => {
  await page.goto(base);
  await expect(page.locator("#grid .card")).toHaveCount(total);
  await page.locator("#grid .card", { has: page.getByRole("link", { name: "Honey Garlic Chicken", exact: true }) }).locator("a.name").tap();
  await expect(page).toHaveURL(`${base}recipe?name=honey-garlic-chicken`);
  await expect(page.locator("#recipe h1")).toBeVisible();
  const viaCard = await snapshot(page);
  await page.goto(`${base}recipe?name=honey-garlic-chicken`);
  await expect(page.locator("#recipe h1")).toBeVisible();
  expect(await snapshot(page)).toEqual(viaCard);
  await page.reload();
  await expect(page.locator("#recipe h1")).toBeVisible();
  expect(await snapshot(page)).toEqual(viaCard);
});

test("S-57.5 one Recipe page serves every recipe: no page per recipe is published", async ({ page }) => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const files = walk(dist).map((f) => path.relative(dist, f));
  expect(files.filter((f) => f.endsWith(".html")).sort()).toEqual(["create-account.html", "forgot-password.html", "index.html", "recipe.html", "sign-in.html"]);
  for (const f of files) expect(f).not.toMatch(/french-toast|apple-crumble-pie/);
  // two different recipes come from the same file
  await open(page, "french-toast");
  await expect(page.locator("h1")).toHaveText("French Toast");
  await open(page, "kotlet");
  await expect(page.locator("h1")).toHaveText((await live("kotlet")).name);
});

test("S-57.6 the page makes no request that writes to Supabase", async ({ page }) => {
  const reqs = [];
  page.on("request", (r) => { if (r.url().startsWith(URL_)) reqs.push(`${r.method()} ${r.url()}`); });
  await open(page, "honey-garlic-chicken");
  await page.locator("details.nutr summary").tap();
  await page.locator("#ing input").first().tap();
  await page.reload();
  await expect(page.locator("#recipe h1")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(reqs.length).toBeGreaterThan(0);
  for (const r of reqs) expect(r).toMatch(/^(GET|OPTIONS|HEAD) /);
  expect(reqs.some((r) => /^(POST|PUT|PATCH|DELETE) /.test(r))).toBe(false);
});

test("S-57.7 a recipe changed in the database shows its new content on the next load, with no rebuild", async ({ page }) => {
  const d = JSON.parse(JSON.stringify(await live("french-toast")));
  let current = d;
  await page.route(URL_ + "/rest/v1/recipe?**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify([current]) }));
  await open(page, "french-toast");
  await expect(page.locator(".lead")).toHaveText(d.description);
  const changed = JSON.parse(JSON.stringify(d));
  changed.name = "French Toast Deluxe";
  changed.description = "A brand new description.";
  changed.step[0].text = "Brand new first step.";
  current = changed;
  await page.reload();
  await expect(page.locator("h1")).toHaveText("French Toast Deluxe");
  await expect(page.locator(".lead")).toHaveText("A brand new description.");
  await expect(page.locator("#steps li").first()).toContainText("Brand new first step.");
});

test("S-57.8 while loading nothing extra is shown, and the header shows in every state", async ({ page }) => {
  let release;
  const gate = new Promise((ok) => (release = ok));
  const d = await live("french-toast");
  await page.route(URL_ + "/rest/v1/recipe?**", async (route) => {
    await gate;
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify([d]) });
  });
  await page.goto(`${base}recipe?name=french-toast`);
  await header(page);
  await expect(page.locator("#recipe")).toBeEmpty();
  expect((await page.locator("main").innerText()).trim()).toBe("");
  await expect(page.getByText(/loading/i)).toHaveCount(0);
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  release();
  await expect(page.locator("#recipe h1")).toHaveText(d.name);
  await header(page);
});

test("S-57.8b header shows when the recipe is not found or the load fails (no extra content)", async ({ page }) => {
  await page.goto(`${base}recipe?name=no-such-recipe-xyz`);
  await page.waitForLoadState("networkidle");
  await header(page);
  await expect(page.locator("#recipe h1")).toHaveCount(0);
  await page.route(URL_ + "/rest/v1/recipe?**", (route) => route.abort());
  await page.goto(`${base}recipe?name=french-toast`);
  await page.waitForLoadState("networkidle");
  await header(page);
});

test("S-57.9 servings label and options, tags in position order, notes with nesting", async ({ page }) => {
  for (const slug of ["corn-fritters", "apple-crumble-pie", "mac-and-cheese", "honey-garlic-chicken"]) {
    const d = await live(slug);
    await open(page, slug);
    // label, options (labels as written, position order), selected = base amount
    await expect(page.locator("label[for=sv]")).toHaveText(d.servings_label);
    const opts = [...d.serving_option].sort(byPos);
    const shown = await page.locator("#sv option").evaluateAll((os) => os.map((o) => ({ text: o.textContent, value: o.value, sel: o.selected })));
    expect(shown.map((o) => o.text)).toEqual(opts.map((o) => o.label || String(Number(o.amount))));
    expect(shown.filter((o) => o.sel).map((o) => Number(o.value))).toEqual([Number(d.base_amount)]);
    await expect(page.locator("#sv")).toHaveValue(String(Number(d.base_amount)));
    // the source makes N
    if (d.amount_noun === "servings") await expect(page.locator(".serv-row .note")).toHaveText(`(the source makes ${Number(d.base_amount)})`);
    else await expect(page.locator(".serv-row .note")).toHaveCount(0);
    // tags in position order
    const tags = [...d.recipe_tag].sort(byPos).map((t) => t.tag.name);
    expect(await page.locator(".rtags a.tag").allInnerTexts()).toEqual(tags);
    // notes with nesting
    const notes = [...d.recipe_note].sort(byPos);
    if (notes.length) {
      expect(await page.locator(".notes li").count()).toBe(notes.length);
      const nested = notes.filter((n) => n.level === 1).length;
      await expect(page.locator(".notes ul ul > li")).toHaveCount(nested);
      await expect(page.locator(".notes > ul > li")).toHaveCount(notes.length - nested);
    }
  }
});

test("S-57.9b a level 1 note is indented under the nearest earlier level 0 note (stub)", async ({ page }) => {
  const d = JSON.parse(JSON.stringify(await live("french-toast")));
  d.recipe_note = [
    { position: 1, level: 0, text: "First" }, { position: 2, level: 1, text: "First child A" },
    { position: 3, level: 1, text: "First child B" }, { position: 4, level: 0, text: "Second" }, { position: 5, level: 1, text: "Second child" },
  ];
  d.recipe_tag = [{ position: 2, tag: { name: "zeta" } }, { position: 1, tag: { name: "alpha" } }, { position: 3, tag: { name: "mid" } }];
  await page.route(URL_ + "/rest/v1/recipe?**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify([d]) }));
  await open(page, "french-toast");
  const tops = page.locator(".notes > ul > li");
  await expect(tops).toHaveCount(2);
  await expect(tops.nth(0).locator("> ul > li")).toHaveText(["First child A", "First child B"]);
  await expect(tops.nth(1).locator("> ul > li")).toHaveText(["Second child"]);
  expect(await page.locator(".rtags a.tag").allInnerTexts()).toEqual(["alpha", "zeta", "mid"]);
});
