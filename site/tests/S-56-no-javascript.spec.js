// S-56: JavaScript-off message. The shell is built into a temp copy (site/dist is never touched),
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

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s56-"));
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


const MSG = "Turn on JavaScript to see recipes.";
const pages = { Home: () => base, Recipe: () => base + "recipe?slug=anything" };

for (const [label, url] of Object.entries(pages)) {
  const id = label === "Home" ? "S-56.1" : "S-56.2";
  test(`${id} JS off: ${label} shows header and only the message`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(url());
    await expect(page.locator("header .logo")).toHaveText("Recipes");
    await expect(page.locator("header nav").getByRole("link", { name: "Browse" })).toBeVisible();
    // Playwright's text matchers skip <noscript> content, so check the rendered text (innerText) of main
    expect((await page.locator("main").innerText()).trim()).toBe(MSG);
    await expect(page.locator("main .nojs")).toBeVisible();
    await ctx.close();
  });
}

test("S-56.3 JS off: no recipe name, card or content on either page", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const url of [base, base + "recipe?slug=anything"]) {
    await page.goto(url);
    expect((await page.locator("main").innerText()).trim()).toBe(MSG);
    // everything in main other than the message is hidden
    const visible = await page.locator("main > *").evaluateAll((els) =>
      els.filter((e) => e.tagName !== "NOSCRIPT" && getComputedStyle(e).display !== "none").length);
    expect(visible).toBe(0);
    await expect(page.locator(".card:visible")).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("combobox")).toHaveCount(0);
    expect((await page.locator("main").innerText()).trim()).toBe(MSG);
  }
  await ctx.close();
});

test("S-56.4 JS on: the message is not shown (Home and Recipe)", async ({ page }) => {
  for (const url of [base, base + "recipe?slug=anything"]) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(MSG)).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(MSG);
  }
});
