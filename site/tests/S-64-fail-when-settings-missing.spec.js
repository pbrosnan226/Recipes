// S-64: the build fails when the Supabase settings are missing. Builds build-shell.js in a temp copy; site/dist is never touched.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const siteDir = path.resolve(__dirname, "..");
const URL_ = "https://example-project.supabase.co";
const FAKEKEY = "sb_publishable_FAKEKEY123";
const good = { SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: FAKEKEY };

function build(env, { previous = false } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s64-"));
  const code = path.join(tmp, "site");
  fs.mkdirSync(code);
  fs.copyFileSync(path.join(siteDir, "build-shell.js"), path.join(code, "build-shell.js"));
  fs.cpSync(path.join(siteDir, "static"), path.join(code, "static"), { recursive: true });
  if (previous) {
    for (const d of ["dist", "dist.tmp"]) {
      fs.mkdirSync(path.join(code, d));
      fs.writeFileSync(path.join(code, d, "index.html"), "OLD SITE");
    }
  }
  const r = spawnSync("node", ["build-shell.js"], { cwd: code, env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env }, encoding: "utf8" });
  return { r, code, dist: path.join(code, "dist"), tmpDist: path.join(code, "dist.tmp") };
}
const out = (r) => r.stdout + r.stderr;

const blanks = [["missing", undefined], ["empty", ""], ["whitespace-only", "   \t "]];

test("S-64.1 project address missing, empty or whitespace-only fails the build", async () => {
  for (const [label, v] of blanks) {
    const env = { SUPABASE_PUBLISHABLE_KEY: FAKEKEY };
    if (v !== undefined) env.SUPABASE_URL = v;
    const { r } = build(env);
    expect(r.status, `URL ${label}`).not.toBe(0);
    expect(r.status, `URL ${label}`).not.toBeNull();
  }
});

test("S-64.2 public key missing, empty or whitespace-only fails the build", async () => {
  for (const [label, v] of blanks) {
    const env = { SUPABASE_URL: URL_ };
    if (v !== undefined) env.SUPABASE_PUBLISHABLE_KEY = v;
    const { r } = build(env);
    expect(r.status, `key ${label}`).not.toBe(0);
    expect(r.status, `key ${label}`).not.toBeNull();
  }
});

test("S-64.3 the log names the missing setting and never prints the key", async () => {
  // URL missing, a distinctive key present
  for (const [label, v] of blanks) {
    const env = { SUPABASE_PUBLISHABLE_KEY: FAKEKEY };
    if (v !== undefined) env.SUPABASE_URL = v;
    const { r } = build(env);
    expect(r.status).not.toBe(0);
    expect(out(r), `URL ${label}`).toContain("SUPABASE_URL");
    expect(out(r)).not.toContain("FAKEKEY123");
    expect(out(r)).not.toContain(FAKEKEY);
  }
  // key missing: names the key setting, and the URL is not mistaken for missing
  const k = build({ SUPABASE_URL: URL_ });
  expect(k.r.status).not.toBe(0);
  expect(out(k.r)).toContain("SUPABASE_PUBLISHABLE_KEY");
  expect(out(k.r)).not.toContain("SUPABASE_URL");
  // both missing: both named
  const both = build({});
  expect(out(both.r)).toContain("SUPABASE_URL");
  expect(out(both.r)).toContain("SUPABASE_PUBLISHABLE_KEY");
  // a key present with a refused (secret-looking) value is not echoed either
  const secret = build({ SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: "sb_secret_FAKESECRET999" });
  expect(secret.r.status).not.toBe(0);
  expect(out(secret.r)).not.toContain("FAKESECRET999");
});

test("S-64.4 a failed build leaves nothing to publish, even over an earlier dist and dist.tmp", async () => {
  for (const env of [{ SUPABASE_PUBLISHABLE_KEY: FAKEKEY }, { SUPABASE_URL: URL_ }, { SUPABASE_URL: " ", SUPABASE_PUBLISHABLE_KEY: "" }]) {
    const fresh = build(env);
    expect(fresh.r.status).not.toBe(0);
    expect(fs.existsSync(fresh.dist)).toBe(false);
    expect(fs.existsSync(fresh.tmpDist)).toBe(false);
    const over = build(env, { previous: true });
    expect(over.r.status).not.toBe(0);
    expect(fs.existsSync(over.dist), "dist removed").toBe(false);
    expect(fs.existsSync(over.tmpDist), "dist.tmp removed").toBe(false);
    expect(fs.readdirSync(over.code).sort()).toEqual(["build-shell.js", "static"]);
  }
});

test("S-64.5 previous site stays live: the repo publishes nothing on failure (the live site itself is a hand check)", async () => {
  // Netlify keeps the last good deploy when the build command fails; that cannot be run locally.
  // What the repo controls: the command exits non-zero and no publish folder exists.
  const { r, dist } = build({ SUPABASE_URL: URL_ });
  expect(r.status).not.toBe(0);
  expect(fs.existsSync(dist)).toBe(false);
  const toml = fs.readFileSync(path.join(siteDir, "..", "netlify.toml"), "utf8");
  expect(toml).toMatch(/command\s*=\s*"npm run build"/);
});

test("S-64.6 after the settings are added, the next build succeeds and writes dist", async () => {
  const failed = build({ SUPABASE_URL: URL_ });
  expect(failed.r.status).not.toBe(0);
  // same folder, settings now added: simulate the next build over the failed one
  const r2 = spawnSync("node", ["build-shell.js"], { cwd: failed.code, env: { PATH: process.env.PATH, HOME: process.env.HOME, ...good }, encoding: "utf8" });
  expect(r2.status, r2.stderr).toBe(0);
  for (const f of ["index.html", "recipe.html", "config.js", "style.css"]) expect(fs.existsSync(path.join(failed.dist, f)), f).toBe(true);
  expect(fs.existsSync(failed.tmpDist)).toBe(false);
  const win = {};
  new Function("window", fs.readFileSync(path.join(failed.dist, "config.js"), "utf8"))(win);
  expect(win.RECIPES_CONFIG).toEqual({ supabaseUrl: URL_, supabaseKey: FAKEKEY });
  // also succeeds over leftover dist/dist.tmp from an older run
  const again = build(good, { previous: true });
  expect(again.r.status, again.r.stderr).toBe(0);
  expect(fs.readFileSync(path.join(again.dist, "index.html"), "utf8")).not.toContain("OLD SITE");
});
