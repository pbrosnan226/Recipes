// S-72: take a recipe off Want to try. Shell built into a temp copy; every Supabase call is stubbed (writes recorded, never sent).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s72.supabase.co";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s72-"));
  const code = path.join(tmp, "site");
  fs.mkdirSync(code);
  fs.copyFileSync(path.join(siteDir, "build-shell.js"), path.join(code, "build-shell.js"));
  fs.cpSync(path.join(siteDir, "static"), path.join(code, "static"), { recursive: true });
  const r = spawnSync("node", ["build-shell.js"], {
    cwd: code, encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: "sb_publishable_stub" },
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
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(() => server && server.close());

const cors = { "access-control-allow-origin": "*" };
const session = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, user: { id: "u1", email: "sam@example.com", name: "Sam" } };
const recipe = { id: "r1", slug: "apple-pie", name: "Apple Pie", site: "", author: "", source_url: "x", photo_path: null, base_amount: 4, amount_noun: "servings", servings_label: "Servings", description: "", prep_time: "", cook_time: "", total_time: "", course: { name: "Main" }, recipe_tag: [], serving_option: [{ position: 1, amount: 4, label: "4" }], recipe_ingredient: [], step: [], recipe_note: [], nutrient: [] };
async function stub(page, opts = {}) {
  const calls = [];
  await page.route(URL_ + "/**", async (route) => {
    const req = route.request(), u = req.url(), m = req.method();
    calls.push({ m, u, body: req.postData() });
    const ok = (json, status = 200) => route.fulfill({ status, json, headers: cors });
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (u.includes("/rest/v1/want_to_try")) {
      if (m === "DELETE") return opts.deleteStatus ? ok({ message: "no" }, opts.deleteStatus) : route.fulfill({ status: 204, headers: cors });
      if (m === "POST") return route.fulfill({ status: 201, headers: cors });
      return ok([{ recipe_id: "r1" }]);
    }
    if (u.includes("/rest/v1/rating?")) return ok([]);
    if (u.includes("/rest/v1/recipe?") && u.includes("slug")) return ok([recipe]);
    return ok([]);
  });
  return calls;
}
const signIn = (page) => page.addInitScript((s) => localStorage.setItem("recipes.session", JSON.stringify(s)), session);
const btn = (page) => page.locator("#want");
const writes = (calls) => calls.filter((c) => c.m !== "GET" && c.m !== "OPTIONS" && /want_to_try/.test(c.u));

test("S-72.1: a marked recipe reads On your list", async ({ page }) => {
  await signIn(page); await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await expect(btn(page)).toHaveText("On your list");
});

test("S-72.2: selecting it deletes only the Member's row and the button returns to Want to try", async ({ page }) => {
  await signIn(page); const calls = await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await btn(page).tap();
  await expect(btn(page)).toHaveText("Want to try");
  await expect(btn(page)).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#want-msg")).toBeHidden();
  const w = writes(calls);
  expect(w).toHaveLength(1);
  expect(w[0].m).toBe("DELETE");
  expect(w[0].u).toContain("user_id=eq.u1");
  expect(w[0].u).toContain("recipe_id=eq.r1");
  expect(await page.evaluate(() => window.RecipesRecipe.state.wantToTry)).toBe(false);
});

test("S-72.2: it can be marked again after removing", async ({ page }) => {
  await signIn(page); const calls = await stub(page);
  await page.goto(base + "/recipe?name=apple-pie");
  await btn(page).tap();
  await expect(btn(page)).toHaveText("Want to try");
  await btn(page).tap();
  await expect(btn(page)).toHaveText("On your list");
  expect(writes(calls).map((c) => c.m)).toEqual(["DELETE", "POST"]);
});

test("S-72.4: a failed removal keeps the mark and says so", async ({ page }) => {
  await signIn(page); await stub(page, { deleteStatus: 500 });
  await page.goto(base + "/recipe?name=apple-pie");
  await btn(page).tap();
  await expect(page.locator("#want-msg")).toHaveText("Couldn't save. Try again.");
  await expect(btn(page)).toHaveText("On your list");
  await expect(btn(page)).toHaveAttribute("aria-pressed", "true");
});

// S-72.3 (no badge on the card, gone from the Want to try chip) is S-66/S-68 reading the row; tester checks by hand.
