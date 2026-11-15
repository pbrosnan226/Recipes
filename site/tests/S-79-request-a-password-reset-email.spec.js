// S-79: Request a password reset email. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s79.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s79-"));
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
test.afterAll(() => server && server.close());

const cors = { "access-control-allow-origin": "*" };
const json = (status, body) => (route) => route.fulfill({ status, json: body, headers: cors });
// Stubs Supabase; the recover call answers with `recover`; returns the recover requests seen.
async function stub(page, recover) {
  const seen = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/auth/v1/recover")) { seen.push(route.request().postDataJSON()); return recover(route); }
    if (u.includes("/auth/v1/")) return route.fulfill({ status: 400, json: {} });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}
const open = (page) => page.goto(base + "/forgot-password");
const send = (page) => page.getByRole("button", { name: "Send reset link" }).tap();
const msg = (page) => page.locator("#fp-form-err");
const MSG = "If it has an account, a link is on its way.";
const stayed = async (page, text) => {
  await expect(msg(page)).toHaveText(text);
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.locator("#fp-sent")).toBeHidden();
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem("s79-init")) { localStorage.clear(); sessionStorage.setItem("s79-init", "1"); } });
});

test("S-79.1 Forgot password? shows the page with Email, Send reset link, Back to sign in", async ({ page }) => {
  await stub(page, json(200, {}));
  await page.goto(base + "/sign-in");
  await page.getByRole("link", { name: "Forgot password?" }).tap();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to sign in" })).toBeVisible();
});

test("S-79.2 email of an account: reset requested, confirmation shown", async ({ page }) => {
  const seen = await stub(page, json(200, {}));
  await open(page);
  await page.getByLabel("Email").fill("sam@example.com");
  await send(page);
  await expect(page.locator("#fp-sent")).toHaveText(MSG);
  expect(seen).toEqual([{ email: "sam@example.com" }]);
  await expect(msg(page)).toBeHidden();
});

test("S-79.3 email with no account: same message (server answers the same)", async ({ page }) => {
  const seen = await stub(page, json(200, {}));
  await open(page);
  await page.getByLabel("Email").fill("nobody@example.com");
  await send(page);
  await expect(page.locator("#fp-sent")).toHaveText(MSG);
  expect(seen).toHaveLength(1);
});

test("S-79.4 hourly limit: nothing sent, stays, 'Too many emails. Try again in an hour.'", async ({ page }) => {
  await stub(page, json(429, { code: 429, error_code: "over_email_send_rate_limit", msg: "limit" }));
  await open(page);
  await page.getByLabel("Email").fill("sam@example.com");
  await send(page);
  await stayed(page, "Too many emails. Try again in an hour.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
});

test("S-79.5 no network: 'No connection.', email kept", async ({ page, context }) => {
  const seen = await stub(page, json(200, {}));
  await open(page);
  await page.getByLabel("Email").fill("sam@example.com");
  await context.setOffline(true);
  await send(page);
  await stayed(page, "No connection.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
  expect(seen).toHaveLength(0);
});

test("S-79.5b request that fails to connect shows 'No connection.'", async ({ page }) => {
  await page.route(URL_ + "/auth/v1/recover**", (route) => route.abort("internetdisconnected"));
  await page.route(URL_ + "/rest/**", json(200, []));
  await open(page);
  await page.getByLabel("Email").fill("sam@example.com");
  await send(page);
  await stayed(page, "No connection.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
});

for (const [n, e] of [["empty", ""], ["no domain (sam@)", "sam@"], ["no at sign", "sam"]]) {
  test(`S-79.6 ${n}: nothing sent, 'Enter a valid email.' under Email`, async ({ page }) => {
    const seen = await stub(page, json(200, {}));
    await open(page);
    await page.getByLabel("Email").fill(e);
    await send(page);
    const err = page.locator("#fp-email-err");
    await expect(err).toHaveText("Enter a valid email.");
    await expect(page).toHaveURL(/\/forgot-password$/);
    const [a, b] = [await page.getByLabel("Email").boundingBox(), await err.boundingBox()];
    expect(b.y).toBeGreaterThan(a.y);
    await expect(page.locator("#fp-sent")).toBeHidden();
    expect(seen).toHaveLength(0);
  });
}

test("S-79.7 Back to sign in shows the Sign in page", async ({ page }) => {
  await stub(page, json(200, {}));
  await open(page);
  await page.getByRole("link", { name: "Back to sign in" }).tap();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

for (const [n, status] of [["server error", 500], ["unavailable", 503]]) {
  test(`S-79.8 ${n}: "Couldn't send reset link. Try again.", email kept`, async ({ page }) => {
    await stub(page, json(status, { code: status, error_code: "unexpected_failure", msg: "boom" }));
    await open(page);
    await page.getByLabel("Email").fill("sam@example.com");
    await send(page);
    await stayed(page, "Couldn't send reset link. Try again.");
    await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
  });
}
