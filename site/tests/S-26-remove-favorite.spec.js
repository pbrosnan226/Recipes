// S-26: remove a favorite. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s26.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s26-"));
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



const recipe = { id: "r1", slug: "x", name: "Toast", base_amount: 4, amount_noun: "servings", servings_label: "Servings", source_url: "https://e.com", site: "E", course: null,
  recipe_tag: [], serving_option: [{ position: 1, amount: 4, label: "4" }], recipe_ingredient: [{ position: 1, amount: "1 egg", name: "egg", group_name: null }], step: [{ position: 1, text: "Cook." }], recipe_note: [], nutrient: [] };
// favRows: what GET favorite returns (or a status for a missing table); postStatus: answer to POST favorite
async function stub(page, o) {
  const seen = { posts: [], dels: [], auth: [] };
  await page.route(URL_ + "/**", async (route) => {
    const req = route.request(), u = req.url();
    if (u.includes("/rest/v1/recipe?")) return route.fulfill({ status: 200, json: [recipe], headers: cors });
    if (u.includes("/rest/v1/favorite")) {
      seen.auth.push(req.headers()["authorization"] + "|" + req.headers()["accept-profile"] + "|" + req.headers()["content-profile"]);
      if (req.method() === "DELETE") { seen.dels.push(req.url()); return route.fulfill({ status: o.delStatus || 204, body: "", headers: cors }); }
      if (req.method() === "POST") { seen.posts.push(req.postDataJSON()); return route.fulfill({ status: o.postStatus || 201, body: "", headers: cors }); }
      return route.fulfill({ status: o.getStatus || 200, json: o.favRows || [], headers: cors });
    }
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}

test("S-26.1/.2/.3/.6 Favorited deletes only the favorite row and shows Favorite", async ({ page }) => {
  const seen = await stub(page, { favRows: [{ recipe_id: "r1" }] });
  await signedIn(page);
  await page.goto(base + "/recipe?name=x");
  const btn = page.locator("#actions button:not(#want):not(#remove-rating)");
  await expect(btn).toContainText("Favorited");
  await btn.tap();
  await expect(btn).not.toContainText("Favorited");
  await expect(btn).toContainText("Favorite");
  expect(seen.dels.length).toBe(1);
  expect(seen.dels[0]).toContain("/rest/v1/favorite?user_id=eq.u1&recipe_id=eq.r1");
  expect(seen.posts).toEqual([]);
  for (const a of seen.auth) expect(a).toBe("Bearer tok|recipes|recipes");
});

test("S-26.5 a failed removal keeps Favorited and shows the message", async ({ page }) => {
  await stub(page, { favRows: [{ recipe_id: "r1" }], delStatus: 500 });
  await signedIn(page);
  await page.goto(base + "/recipe?name=x");
  await page.locator("#actions button:not(#want):not(#remove-rating)").tap();
  await expect(page.getByText("Couldn't save. Try again.")).toBeVisible();
  await expect(page.locator("#actions button:not(#want):not(#remove-rating)")).toContainText("Favorited");
});
