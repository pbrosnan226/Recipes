// S-68/S-70.1: second chip row (All / Want to try / Rated). Supabase is stubbed; no live calls.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s68.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s68-"));
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
const mk = (id, name, course) => ({ id, slug: name.toLowerCase().replace(/ /g, "-"), name, site: "", photo_path: null, course: { name: course || "Main" }, recipe_tag: [], recipe_ingredient: [] });
const recipes = [mk("r1", "Apple Pie", "Dessert"), mk("r2", "Banana Bread", "Dessert"), mk("r3", "Cake"), mk("r4", "Donut")];
async function stub(page, opts = {}) {
  const reqs = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    reqs.push(u);
    if (u.includes("/rest/v1/rating?")) return route.fulfill({ status: 200, json: opts.rated === false ? [] : [{ recipe_id: "r1", stars: 4 }, { recipe_id: "r3", stars: 2 }], headers: cors });
    if (u.includes("/rest/v1/want_to_try")) return route.fulfill({ status: 200, json: opts.want === false ? [] : [{ recipe_id: "r2" }, { recipe_id: "r3" }], headers: cors });
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: recipes, headers: cors });
    if (u.includes("/rest/v1/course")) return route.fulfill({ status: 200, json: [{ name: "Main", position: 1 }, { name: "Dessert", position: 2 }], headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return reqs;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
const names = (page) => page.locator("#grid .card:not([hidden]) .name").allTextContents();
const mine = (page, n) => page.locator("#mine .chip", { hasText: n });

test("S-70.1: a Visitor gets no second row and no personal requests", async ({ page }) => {
  const reqs = await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#grid .card").first()).toBeVisible();
  await expect(page.locator("#mine")).toHaveCount(0);
  expect(reqs.filter((u) => /rating\?|want_to_try/.test(u))).toEqual([]);
});

test("S-68.1-.5/.9/.10: Member filters, combined with course, search and sort", async ({ page }) => {
  await signIn(page);
  await stub(page);
  await page.goto(base + "/");
  await expect(page.locator("#mine .chip")).toHaveText(["All", "Want to try", "Rated"]);
  await expect(mine(page, "All")).toHaveAttribute("aria-pressed", "true");
  await mine(page, "Want to try").tap();
  expect(await names(page)).toEqual(["Banana Bread", "Cake"]);
  await expect(page.locator("#count")).toHaveText("2 recipes");
  await mine(page, "Rated").tap();
  expect(await names(page)).toEqual(["Apple Pie", "Cake"]);
  await page.locator("#chips .chip", { hasText: "Dessert" }).tap();
  expect(await names(page)).toEqual(["Apple Pie"]);
  await expect(page.locator("#count")).toHaveText("1 recipe");
  await page.locator("#chips .chip", { hasText: "All" }).tap();
  await page.locator("#q").fill("e");
  await page.locator("#sort").selectOption("rating");
  expect(await names(page)).toEqual(["Apple Pie", "Cake"]);
  await expect(page.locator("#q")).toHaveValue("e");
  await mine(page, "All").tap();
  expect(await names(page)).toEqual(["Apple Pie", "Cake", "Banana Bread"]);
  await page.locator("#q").fill("");
  expect(await names(page)).toEqual(["Apple Pie", "Cake", "Banana Bread", "Donut"]);
  expect(new URL(page.url()).pathname).toBe("/");
});

test("S-68.6/.7/.8: empty wordings", async ({ page }) => {
  await signIn(page);
  await stub(page, { rated: false, want: false });
  await page.goto(base + "/");
  await mine(page, "Want to try").tap();
  expect(await names(page)).toEqual([]);
  await expect(page.locator("#none")).toHaveText("Nothing on your Want to try list yet.");
  await mine(page, "Rated").tap();
  await expect(page.locator("#none")).toHaveText("You haven't rated any recipes yet.");
  await page.locator("#chips .chip", { hasText: "Main" }).tap();
  await expect(page.locator("#none")).toHaveText("Nothing matches that. Try another word.");
  await page.locator("#chips .chip", { hasText: "All" }).tap();
  await page.locator("#q").fill("zzz");
  await expect(page.locator("#none")).toHaveText("Nothing matches that. Try another word.");
});
