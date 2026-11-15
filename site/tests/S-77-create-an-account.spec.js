// S-77: Create an account. The shell is built into a temp copy (site/dist is never touched) and served on a random port.
// Every Supabase call is stubbed with page.route: the real project is never called and no account is created.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s77.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s77-"));
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
    if (["/recipe", "/create-account", "/sign-in"].includes(p)) p += ".html";
    const f = path.join(dist, p);
    if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    res.end(fs.readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(() => server && server.close());

const ok = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, token_type: "bearer", user: { id: "u1", email: "new@example.com" } };
// Stubs Supabase: signup answers with `signup(route, body)`, REST reads return empty lists. Returns the signup requests seen.
async function stub(page, signup) {
  const seen = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/auth/v1/signup")) {
      seen.push(route.request().postDataJSON());
      return signup(route);
    }
    if (u.includes("/auth/v1/")) return route.fulfill({ status: 400, json: {} });
    return route.fulfill({ status: 200, json: [], headers: { "access-control-allow-origin": "*" } });
  });
  return seen;
}
const json = (status, body) => (route) => route.fulfill({ status, json: body, headers: { "access-control-allow-origin": "*" } });
const exists = json(422, { code: 422, error_code: "user_already_exists", msg: "User already registered" });

const open = async (page) => { await page.goto(base + "/create-account"); };
const fill = async (page, e, p, c) => {
  await page.getByLabel("Email").fill(e);
  await page.getByLabel("Password", { exact: true }).fill(p);
  await page.getByLabel("Confirm password").fill(c);
};
const submit = (page) => page.getByRole("button", { name: "Create account" }).tap();
const nav = (page) => page.locator("header nav");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem("s77-init")) { localStorage.clear(); sessionStorage.setItem("s77-init", "1"); } });
});

test("S-77.1 Create account link on Sign in shows the Create account page", async ({ page }) => {
  await stub(page, json(200, ok));
  await page.goto(base + "/sign-in");
  await page.getByRole("link", { name: "Create account" }).tap();
  await expect(page).toHaveURL(/\/create-account$/);
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByText("8+ characters")).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByText("Have an account?")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" }).last()).toBeVisible();
});

test("S-77.2 valid details create the account, sign in and show Home (and survive reload)", async ({ page }) => {
  const seen = await stub(page, json(200, ok));
  await open(page);
  await fill(page, "new@example.com", "longenough", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen).toEqual([{ email: "new@example.com", password: "longenough" }]);
  await expect(page.getByRole("heading", { name: "Everything we cook." })).toBeVisible();
  await page.reload();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toBeVisible();
});

test("S-77.3 after creating, header shows Favorites and Sign out and no Sign in", async ({ page }) => {
  await stub(page, json(200, ok));
  await open(page);
  await fill(page, "new@example.com", "longenough", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  await expect(nav(page).getByRole("link", { name: "Favorites" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign in" })).toHaveCount(0);
});

test("S-77.4 no confirmation email: the request asks for none and a session comes back", async ({ page }) => {
  let req;
  await page.route(URL_ + "/auth/v1/signup", (route) => { req = route.request(); return json(200, ok)(route); });
  await page.route(URL_ + "/rest/**", json(200, []));
  await open(page);
  await fill(page, "new@example.com", "longenough", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(req.url()).not.toMatch(/redirect_to|resend|otp/);
  expect(Object.keys(req.postDataJSON()).sort()).toEqual(["email", "password"]);
  // If the project did want a confirmation (no session returned), the visitor is not signed in.
});

test("S-77.5 no invitation needed: any new email can create an account", async ({ page }) => {
  const seen = await stub(page, json(200, ok));
  await open(page);
  await expect(page.getByLabel(/invit/i)).toHaveCount(0);
  await expect(page.getByText(/invit/i)).toHaveCount(0);
  await fill(page, "someone.random+x@anywhere.org", "longenough", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen[0].email).toBe("someone.random+x@anywhere.org");
  expect(Object.keys(seen[0])).toEqual(["email", "password"]);
});

test("S-77.6 existing email: no account, error under Email", async ({ page }) => {
  await stub(page, exists);
  await open(page);
  await fill(page, "old@example.com", "longenough", "longenough");
  await submit(page);
  await expect(page.locator("#ca-email-err")).toHaveText("Email already has an account. Sign in");
  await expect(page.locator("#ca-email-err").getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page).toHaveURL(/\/create-account$/);
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("recipes.session"))).toBeNull();
});

test("S-77.7 Sign in in the email error shows the Sign in page", async ({ page }) => {
  await stub(page, exists);
  await open(page);
  await fill(page, "old@example.com", "longenough", "longenough");
  await submit(page);
  await page.locator("#ca-email-err").getByRole("link", { name: "Sign in" }).tap();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
});

for (const [n, bad] of [["empty", ""], ["invalid", "sam@example"]]) {
  test(`S-77.8 ${n} email: no account, stays, "Enter a valid email."`, async ({ page }) => {
    const seen = await stub(page, json(200, ok));
    await open(page);
    await fill(page, bad, "longenough", "longenough");
    await submit(page);
    await expect(page.locator("#ca-email-err")).toHaveText("Enter a valid email.");
    await expect(page).toHaveURL(/\/create-account$/);
    expect(seen).toHaveLength(0);
  });
}

test("S-77.9 short password: error replaces helper; 7 fails, 8 passes", async ({ page }) => {
  const seen = await stub(page, json(200, ok));
  await open(page);
  await fill(page, "new@example.com", "1234567", "1234567");
  await submit(page);
  await expect(page.locator("#ca-password-err")).toHaveText("Use 8+ characters.");
  await expect(page.getByText("8+ characters", { exact: true })).toBeHidden();
  await expect(page).toHaveURL(/\/create-account$/);
  expect(seen).toHaveLength(0);
  await fill(page, "new@example.com", "12345678", "12345678");
  await expect(page.getByText("8+ characters", { exact: true })).toBeVisible();
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen).toHaveLength(1);
});

test("S-77.10 mismatched confirm: no account, error under Confirm password", async ({ page }) => {
  const seen = await stub(page, json(200, ok));
  await open(page);
  await fill(page, "new@example.com", "longenough", "different1");
  await submit(page);
  await expect(page.locator("#ca-confirm-err")).toHaveText("Passwords don't match.");
  await expect(page).toHaveURL(/\/create-account$/);
  expect(seen).toHaveLength(0);
});

test("S-77.11 no network: 'No connection.' above the button, entries kept", async ({ page, context }) => {
  await stub(page, json(200, ok));
  await open(page);
  await fill(page, "new@example.com", "longenough", "longenough");
  await context.setOffline(true);
  await submit(page);
  const msg = page.locator("#ca-form-err");
  await expect(msg).toHaveText("No connection.");
  const [m, b] = [await msg.boundingBox(), await page.getByRole("button", { name: "Create account" }).boundingBox()];
  expect(m.y).toBeLessThan(b.y);
  await expect(page.getByLabel("Email")).toHaveValue("new@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("longenough");
  await expect(page.getByLabel("Confirm password")).toHaveValue("longenough");
  await expect(page).toHaveURL(/\/create-account$/);
  expect(await page.evaluate(() => localStorage.getItem("recipes.session"))).toBeNull();
});

test("S-77.11b request that fails to connect (not just navigator offline) shows 'No connection.'", async ({ page }) => {
  await page.route(URL_ + "/auth/v1/signup", (route) => route.abort("internetdisconnected"));
  await page.route(URL_ + "/rest/**", json(200, []));
  await open(page);
  await fill(page, "new@example.com", "longenough", "longenough");
  await submit(page);
  await expect(page.locator("#ca-form-err")).toHaveText("No connection.");
  await expect(page.getByLabel("Email")).toHaveValue("new@example.com");
});

for (const [n, status] of [["server error", 500], ["rate limit", 429]]) {
  test(`S-77.12 ${n}: "Couldn't create account. Try again." above the button, entries kept`, async ({ page }) => {
    await stub(page, json(status, { code: status, error_code: "unexpected_failure", msg: "boom" }));
    await open(page);
    await fill(page, "new@example.com", "longenough", "longenough");
    await submit(page);
    const msg = page.locator("#ca-form-err");
    await expect(msg).toHaveText("Couldn't create account. Try again.");
    const [m, b] = [await msg.boundingBox(), await page.getByRole("button", { name: "Create account" }).boundingBox()];
    expect(m.y).toBeLessThan(b.y);
    await expect(page.getByLabel("Email")).toHaveValue("new@example.com");
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue("longenough");
    await expect(page.getByLabel("Confirm password")).toHaveValue("longenough");
    await expect(page).toHaveURL(/\/create-account$/);
    expect(await page.evaluate(() => localStorage.getItem("recipes.session"))).toBeNull();
  });
}

test("S-77.13 'Have an account? Sign in' shows the Sign in page", async ({ page }) => {
  await stub(page, json(200, ok));
  await open(page);
  await page.locator("p.alt").getByRole("link", { name: "Sign in" }).tap();
  await expect(page).toHaveURL(/\/sign-in$/);
});

// S-77.14 (the new account also signs in to Workout and the Gambling App) can only be checked by hand.
