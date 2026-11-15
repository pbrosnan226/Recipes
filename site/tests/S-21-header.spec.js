// S-21: header. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s21.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s21-"));
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

test("S-21.1 and S-21.7 signed out: Sign in only, name and Browse stay", async ({ page }) => {
  await quiet(page);
  for (const p of ["/", "/sign-in"]) {
    await page.goto(base + p);
    await expect(nav(page).getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(nav(page).getByRole("link", { name: "Favorites" })).toHaveCount(0);
    await expect(nav(page).getByRole("link", { name: "Sign out" })).toHaveCount(0);
    await expect(page.locator("header .logo")).toHaveText("Recipes");
    await expect(nav(page).getByRole("link", { name: "Browse" })).toHaveAttribute("href", "/");
  }
});

test("S-21.2 Sign in opens the Sign in page", async ({ page }) => {
  await quiet(page);
  await page.goto(base + "/");
  await nav(page).getByRole("link", { name: "Sign in" }).tap();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("S-21.3, .4, .7 signed in: Favorites and Sign out, no Sign in, no email or name", async ({ page }) => {
  await quiet(page);
  await signedIn(page);
  await page.goto(base + "/");
  await expect(nav(page).getByRole("link", { name: "Favorites" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign in" })).toHaveCount(0);
  await expect(page.locator("header .logo")).toHaveText("Recipes");
  await expect(nav(page).getByRole("link", { name: "Browse" })).toBeVisible();
  const t = await page.locator("header").innerText();
  expect(t).not.toContain("sam@example.com");
  expect(t).not.toContain("Sam");
});

test("S-21.5 Favorites link goes to the Favorites view address", async ({ page }) => {
  await quiet(page);
  await signedIn(page);
  await page.goto(base + "/");
  await nav(page).getByRole("link", { name: "Favorites" }).tap();
  await expect(page).toHaveURL(/\/\?favorites=1$/);
});

test("S-21.6 Sign out clears the session and shows Sign in", async ({ page }) => {
  await quiet(page);
  await signedIn(page);
  await page.goto(base + "/");
  await nav(page).getByRole("link", { name: "Sign out" }).tap();
  await expect(nav(page).getByRole("link", { name: "Sign in" })).toBeVisible();
});
