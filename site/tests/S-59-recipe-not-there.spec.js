// S-59: the Recipe page when the recipe can't be loaded. The shell is built into a temp copy (site/dist is never touched)
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s59-"));
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
const notHere = (page) => page.getByText("That recipe isn't here.");
const back = (page) => page.getByRole("link", { name: "Back to all recipes" });
const header = async (page) => {
  await expect(page.locator("header .logo")).toHaveText("Recipes");
  await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
};
const noContent = async (page) => {
  for (const sel of ["h1", "#ing", "#steps", ".notes", "details.nutr", ".photo", ".srclink", ".lead", ".fact", "#sv"])
    await expect(page.locator(sel), sel).toHaveCount(0);
  await expect(failMsg(page)).toHaveCount(0);
  await expect(tryBtn(page)).toHaveCount(0);
};
const recorder = async (page, mode) => {
  const reqs = [];
  page.on("request", (r) => { if (r.url().startsWith(URL_)) reqs.push(r.url()); });
  if (mode === "empty")
    await page.route(URL_ + "/rest/v1/recipe?**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));
  return reqs;
};

test("S-59.1 unknown slug (live data and stubbed empty answer) shows the message and the link", async ({ page }) => {
  const reqs = await recorder(page);
  await page.goto(`${base}recipe?name=no-such-recipe-xyz`);
  await expect(notHere(page)).toBeVisible();
  await expect(back(page)).toBeVisible();
  expect(reqs.some((u) => u.includes("slug=eq.no-such-recipe-xyz"))).toBe(true);
  await page.unroute(URL_ + "/rest/v1/recipe?**").catch(() => {});
  const stub = await recorder(page, "empty");
  await page.goto(`${base}recipe?name=french-toast-gone`);
  await expect(notHere(page)).toBeVisible();
  await expect(back(page)).toBeVisible();
  expect(stub.some((u) => u.includes("slug=eq.french-toast-gone"))).toBe(true);
});

test("S-59.2 no recipe content, no failure message, no Try again", async ({ page }) => {
  await recorder(page, "empty");
  await page.goto(`${base}recipe?name=gone`);
  await expect(notHere(page)).toBeVisible();
  await noContent(page);
  await page.goto(`${base}recipe?name=no-such-recipe-xyz`);
  await page.unroute(URL_ + "/rest/v1/recipe?**");
  await page.reload();
  await expect(notHere(page)).toBeVisible();
  await noContent(page);
});

test("S-59.3 Back to all recipes opens Home as S-05", async ({ page }) => {
  await page.goto(`${base}recipe?name=no-such-recipe-xyz`);
  await back(page).tap();
  await expect(page).toHaveURL(base);
  await expect(page.getByRole("button", { name: "All" }).first()).toBeVisible();
  await expect(page.getByRole("searchbox").or(page.getByRole("textbox")).first()).toHaveValue("");
  await expect(page.locator("a[href*='recipe?name=']").first()).toBeVisible();
  await expect(notHere(page)).toHaveCount(0);
});

for (const [label, q] of [["no name", ""], ["empty name", "?name="], ["blank name", "?name=%20%20"]]) {
  test(`S-59.4 ${label}: message and link, no request for a recipe`, async ({ page }) => {
    const reqs = await recorder(page);
    await page.goto(`${base}recipe${q}`);
    await expect(notHere(page)).toBeVisible();
    await expect(back(page)).toBeVisible();
    await noContent(page);
    await page.waitForLoadState("networkidle");
    expect(reqs).toEqual([]);
    await back(page).tap();
    await expect(page).toHaveURL(base);
  });
}

test("S-59.5 the site header shows", async ({ page }) => {
  for (const q of ["?name=no-such-recipe-xyz", "", "?name="]) {
    await page.goto(`${base}recipe${q}`);
    await expect(notHere(page)).toBeVisible();
    await header(page);
  }
  await page.locator("header .logo").tap();
  await expect(page).toHaveURL(base);
});
