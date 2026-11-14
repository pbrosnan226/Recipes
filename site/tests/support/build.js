// Build the site from a fixture folder of notes, in a temp copy of the site code so the real site/dist is never touched.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const siteDir = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(siteDir, "..");

function mkdtemp(p) { return fs.mkdtempSync(path.join(os.tmpdir(), p)); }

// notes: { "File Name.md": content } ; sub: { "folder/File.md": content }
function makeRoot(notes, { withScaler = true } = {}) {
  const root = mkdtemp("recipes-root-");
  for (const [f, c] of Object.entries(notes)) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), c);
  }
  if (withScaler) {
    fs.mkdirSync(path.join(root, "scripts", "scale"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "scripts", "scale", "view.js"), path.join(root, "scripts", "scale", "view.js"));
  }
  return root;
}

function makeSiteCopy() {
  const dir = mkdtemp("recipes-site-");
  for (const f of ["build.js", "preview.js", "package.json"]) fs.copyFileSync(path.join(siteDir, f), path.join(dir, f));
  fs.cpSync(path.join(siteDir, "lib"), path.join(dir, "lib"), { recursive: true });
  fs.cpSync(path.join(siteDir, "static"), path.join(dir, "static"), { recursive: true });
  fs.symlinkSync(path.join(siteDir, "node_modules"), path.join(dir, "node_modules"));
  return dir;
}

function build(root, site = makeSiteCopy()) {
  const r = spawnSync("node", ["build.js"], { cwd: site, env: { ...process.env, RECIPE_ROOT: root }, encoding: "utf8" });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || ""), site, dist: path.join(site, "dist"), tmp: path.join(site, "dist.tmp") };
}

const pages = (dist) => (fs.existsSync(path.join(dist, "recipes")) ? fs.readdirSync(path.join(dist, "recipes")) : []);
module.exports = { makeRoot, makeSiteCopy, build, pages, siteDir, repoRoot, mkdtemp };
