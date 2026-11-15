// S-80: Set a new password from the reset link. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s80.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s80-"));
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
    if (["/recipe", "/create-account", "/sign-in", "/forgot-password", "/reset-password"].includes(p)) p += ".html";
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
const json = (status, body) => (route) => route.fulfill({ status, json: body, headers: cors });
// Stubs Supabase; the PUT /auth/v1/user call answers with `put`; returns the requests seen.
async function stub(page, put) {
  const seen = [];
  await page.route(URL_ + "/**", async (route) => {
    const req = route.request();
    if (req.url().includes("/auth/v1/user") && req.method() === "PUT") { seen.push({ auth: req.headers().authorization, body: req.postDataJSON() }); return put(route); }
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors, "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (req.url().includes("/auth/v1/")) return route.fulfill({ status: 400, json: {}, headers: cors });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}
const LINK = "/reset-password#access_token=tok123&refresh_token=r&type=recovery&expires_in=3600";
const fill = async (page, a, b) => { await page.getByLabel("New password").fill(a); await page.getByLabel("Confirm password").fill(b); };
const set = (page) => page.getByRole("button", { name: "Set password" }).tap();

test("S-80.1 link shows the form", async ({ page }) => {
  await stub(page, json(200, {}));
  await page.goto(base + LINK);
  await expect(page.getByLabel("New password")).toBeVisible();
  await expect(page.locator("#rp-password-help")).toHaveText("8+ characters");
  await expect(page.getByLabel("Confirm password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Set password" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to sign in" })).toBeVisible();
});

test("S-80.2/.8 changes password, Sign in shows the notice until sign-in attempt or leaving", async ({ page }) => {
  const seen = await stub(page, json(200, {}));
  await page.goto(base + LINK);
  await fill(page, "newpass123", "newpass123");
  await set(page);
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.locator("#si-notice")).toHaveText("Password changed. Sign in with it.");
  expect(seen).toEqual([{ auth: "Bearer tok123", body: { password: "newpass123" } }]);
  expect(await page.evaluate(() => localStorage.getItem("recipes.session"))).toBeNull();
  await page.getByLabel("Email").fill("a@b.co");
  await page.getByLabel("Password").fill("x");
  await page.getByRole("button", { name: "Sign in" }).tap();
  await expect(page.locator("#si-form-err")).toBeVisible();
  await expect(page.locator("#si-notice")).toBeVisible();
  await page.goto(base + "/create-account");
  await page.goto(base + "/sign-in");
  await expect(page.locator("#si-notice")).toBeHidden();
});

test("S-80.4 short password", async ({ page }) => {
  const seen = await stub(page, json(200, {}));
  await page.goto(base + LINK);
  await fill(page, "short", "short");
  await set(page);
  await expect(page.locator("#rp-password-err")).toHaveText("Use 8+ characters.");
  await expect(page.locator("#rp-password-help")).toBeHidden();
  expect(seen).toHaveLength(0);
});

test("S-80.5 mismatch", async ({ page }) => {
  const seen = await stub(page, json(200, {}));
  await page.goto(base + LINK);
  await fill(page, "newpass123", "newpass124");
  await set(page);
  await expect(page.locator("#rp-confirm-err")).toHaveText("Passwords don't match.");
  expect(seen).toHaveLength(0);
});

for (const [n, hash] of [["no hash", ""], ["expired link", "#error=access_denied&error_code=otp_expired"], ["not recovery", "#access_token=t&type=signup"]]) {
  test(`S-80.6 ${n}: not a reset link`, async ({ page }) => {
    await stub(page, json(200, {}));
    await page.goto(base + "/reset-password" + hash);
    await expect(page.locator("#rp-not-reset")).toHaveText("That link is not a password reset link.");
    await expect(page.locator("input")).toHaveCount(0);
    await page.getByRole("link", { name: "Back to sign in" }).tap(); // S-80.7
    await expect(page).toHaveURL(/\/sign-in$/);
  });
}

test("S-80.9/.10 no connection, fields kept, retry", async ({ page, context }) => {
  const seen = await stub(page, json(200, {}));
  await page.goto(base + LINK);
  await fill(page, "newpass123", "newpass123");
  await context.setOffline(true);
  await set(page);
  await expect(page.locator("#rp-form-err")).toHaveText("No connection.");
  await expect(page.getByLabel("New password")).toHaveValue("newpass123");
  expect(seen).toHaveLength(0);
  await context.setOffline(false);
  await set(page);
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(seen).toHaveLength(1);
});

test("S-80.11 same password", async ({ page }) => {
  await stub(page, json(422, { code: 422, error_code: "same_password", msg: "same" }));
  await page.goto(base + LINK);
  await fill(page, "oldpass123", "oldpass123");
  await set(page);
  await expect(page.locator("#rp-password-err")).toHaveText("Use a new password.");
  await expect(page).toHaveURL(/\/reset-password$/);
});

test("S-80.12/.13 other failure, fields kept, retry", async ({ page }) => {
  let n = 0;
  const seen = await stub(page, (route) => (n++ === 0 ? json(500, { error_code: "unexpected_failure" })(route) : json(200, {})(route)));
  await page.goto(base + LINK);
  await fill(page, "newpass123", "newpass123");
  await set(page);
  await expect(page.locator("#rp-form-err")).toHaveText("Couldn't set password. Try again.");
  await expect(page.getByLabel("Confirm password")).toHaveValue("newpass123");
  await set(page);
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(seen).toHaveLength(2);
});
