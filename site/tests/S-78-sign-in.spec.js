// S-78: Sign in. Shell built into a temp copy, served on a random port; every Supabase call is stubbed (no real account touched).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://stub-s78.supabase.co";
const KEY = "sb_publishable_stub";
let server, base, dist;

test.beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s78-"));
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
const tokenOk = { access_token: "tok", refresh_token: "ref", expires_at: 9999999999, token_type: "bearer", user: { id: "u1", email: "sam@example.com" } };
const json = (status, body) => (route) => route.fulfill({ status, json: body, headers: cors });
const wrong = json(400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
// Stubs Supabase: the password-token call answers with `login`; returns the token requests seen.
async function stub(page, login) {
  const seen = [];
  await page.route(URL_ + "/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/auth/v1/token")) { seen.push(route.request().postDataJSON()); return login(route); }
    if (u.includes("/auth/v1/")) return route.fulfill({ status: 400, json: {} });
    return route.fulfill({ status: 200, json: [], headers: cors });
  });
  return seen;
}
const open = (page) => page.goto(base + "/sign-in");
const fill = async (page, e, p) => {
  await page.getByLabel("Email").fill(e);
  await page.getByLabel("Password", { exact: true }).fill(p);
};
const submit = (page) => page.getByRole("button", { name: "Sign in" }).tap();
const nav = (page) => page.locator("header nav");
const session = (page) => page.evaluate(() => localStorage.getItem("recipes.session"));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem("s78-init")) { localStorage.clear(); sessionStorage.setItem("s78-init", "1"); } });
});

test("S-78.1 header Sign in link shows the Sign in page with its parts", async ({ page }) => {
  await stub(page, json(200, tokenOk));
  await page.goto(base + "/");
  await nav(page).getByRole("link", { name: "Sign in" }).tap();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
});

test("S-78.2 valid email and password sign in and show Home (survives reload)", async ({ page }) => {
  const seen = await stub(page, json(200, tokenOk));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen).toEqual([{ email: "sam@example.com", password: "longenough" }]);
  await expect(page.getByRole("heading", { name: "Everything we cook." })).toBeVisible();
  await page.reload();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toBeVisible();
});

test("S-78.3 Home shows after signing in, whichever page Sign in was selected from", async ({ page }) => {
  await stub(page, json(200, tokenOk));
  for (const from of ["/", "/create-account", "/forgot-password", "/recipe?slug=x"]) {
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto(base + from);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const link = nav(page).getByRole("link", { name: "Sign in" });
    await expect(link).toBeVisible();
    await link.tap();
    await expect(page).toHaveURL(/\/sign-in$/);
    await fill(page, "sam@example.com", "longenough");
    await submit(page);
    await expect(page, `from ${from}`).toHaveURL(base + "/");
    await expect(page.getByRole("heading", { name: "Everything we cook." })).toBeVisible();
  }
});

test("S-78.4 after signing in the header shows Favorites and Sign out, no Sign in", async ({ page }) => {
  await stub(page, json(200, tokenOk));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  await expect(nav(page).getByRole("link", { name: "Favorites" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Sign in" })).toHaveCount(0);
});

// S-78.5 (account made in Workout or the Gambling App) can only be checked by hand.

const keptAndAbove = async (page, text) => {
  const msg = page.locator("#si-form-err");
  await expect(msg).toHaveText(text);
  const [m, b] = [await msg.boundingBox(), await page.getByRole("button", { name: "Sign in" }).boundingBox()];
  expect(m.y).toBeLessThan(b.y);
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(await session(page)).toBeNull();
  await expect(nav(page).getByRole("link", { name: "Sign out" })).toHaveCount(0);
};

test("S-78.6 wrong email or password: not signed in, fields kept, message above button", async ({ page }) => {
  await stub(page, wrong);
  await open(page);
  await fill(page, "sam@example.com", "badpassword");
  await submit(page);
  await keptAndAbove(page, "Wrong email or password.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("badpassword");
});

for (const [n, e, p] of [["empty email", "", "longenough"], ["empty password", "sam@example.com", ""], ["both empty", "", ""]]) {
  test(`S-78.7 ${n}: not signed in, "Wrong email or password."`, async ({ page }) => {
    const seen = await stub(page, json(200, tokenOk));
    await open(page);
    await fill(page, e, p);
    await submit(page);
    await keptAndAbove(page, "Wrong email or password.");
    expect(seen).toHaveLength(0);
  });
}

test("S-78.8 no network: 'No connection.', fields kept", async ({ page, context }) => {
  await stub(page, json(200, tokenOk));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await context.setOffline(true);
  await submit(page);
  await keptAndAbove(page, "No connection.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("longenough");
});

test("S-78.8b request that fails to connect shows 'No connection.'", async ({ page }) => {
  await page.route(URL_ + "/auth/v1/token**", (route) => route.abort("internetdisconnected"));
  await page.route(URL_ + "/rest/**", json(200, []));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await submit(page);
  await keptAndAbove(page, "No connection.");
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
});

for (const [n, status] of [["server error", 500], ["rate limit", 429]]) {
  test(`S-78.9 ${n}: "Couldn't sign in. Try again.", fields kept`, async ({ page }) => {
    await stub(page, json(status, { code: status, error_code: "unexpected_failure", msg: "boom" }));
    await open(page);
    await fill(page, "sam@example.com", "longenough");
    await submit(page);
    await keptAndAbove(page, "Couldn't sign in. Try again.");
    await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue("longenough");
  });
}

test("S-78.10 Sign in again after 'No connection.' tries again and succeeds", async ({ page, context }) => {
  const seen = await stub(page, json(200, tokenOk));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await context.setOffline(true);
  await submit(page);
  await expect(page.locator("#si-form-err")).toHaveText("No connection.");
  await context.setOffline(false);
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen).toHaveLength(1);
});

test("S-78.10b Sign in again after 'Couldn't sign in.' tries again and succeeds", async ({ page }) => {
  let n = 0;
  const seen = await stub(page, (route) => (++n === 1 ? json(500, { error_code: "unexpected_failure" })(route) : json(200, tokenOk)(route)));
  await open(page);
  await fill(page, "sam@example.com", "longenough");
  await submit(page);
  await expect(page.locator("#si-form-err")).toHaveText("Couldn't sign in. Try again.");
  await submit(page);
  await expect(page).toHaveURL(base + "/");
  expect(seen).toHaveLength(2);
});

test("S-78.11 Create account link shows the Create account page", async ({ page }) => {
  await stub(page, json(200, tokenOk));
  await open(page);
  await page.getByRole("link", { name: "Create account" }).tap();
  await expect(page).toHaveURL(/\/create-account$/);
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
});

test("S-78.12 Forgot password? link shows the Forgot password page", async ({ page }) => {
  await stub(page, json(200, tokenOk));
  await open(page);
  await page.getByRole("link", { name: "Forgot password?" }).tap();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();
});

// S-78.13 (favorites, Want to try and ratings are per account) depends on the later favorites stories: by hand.
