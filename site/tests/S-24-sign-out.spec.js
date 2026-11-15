// S-24: sign out and stay signed in. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s24.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s24-"));
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


test("S-24 sign out: at once, same address, signed-out header; session gone after reopening", async ({ page }) => {
  await quiet(page);
  await signedIn(page);
  await page.goto(base + "/recipe?name=x");
  await expect(nav(page).getByText("Sign out")).toBeVisible();
  await page.reload(); // closing and reopening: still signed in (S-24.7, S-24.8)
  await expect(nav(page).getByText("Favorites")).toBeVisible();
  await nav(page).getByText("Sign out").tap();
  await expect(nav(page).getByText("Sign in")).toBeVisible();
  await expect(nav(page).getByText("Sign out")).toHaveCount(0);
  await expect(nav(page).getByText("Favorites")).toHaveCount(0);
  expect(page.url()).toBe(base + "/recipe?name=x");
  expect(await page.evaluate(() => localStorage.getItem("recipes.session"))).toBeNull();
  await page.reload(); // S-24.9
  await expect(nav(page).getByText("Sign in")).toBeVisible();
});

test("S-24.5 and S-24.6 Favorites address: Sign out lands on normal Home; signed out shows Home", async ({ page }) => {
  await quiet(page);
  await signedIn(page);
  await page.goto(base + "/?favorites=1");
  await nav(page).getByText("Sign out").tap();
  await expect(nav(page).getByText("Sign in")).toBeVisible();
  await page.waitForURL(base + "/");
  await page.goto(base + "/?favorites=1");
  await expect(nav(page).getByText("Sign in")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Your favorites");
});
