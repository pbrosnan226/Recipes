// Builds the fixture notes into a temp folder and serves them on port 8899 (UI tests run against this).
const path = require("path");
const { spawn } = require("child_process");
const { makeRoot, makeSiteCopy, build } = require("./build");
const { listFixtures, GIF_BYTES } = require("./notes");
const files = {};
for (const [n, c] of Object.entries(listFixtures)) files[`${n}.md`] = c;
files["images/Alpha Soup.gif"] = GIF_BYTES;
const r = build(makeRoot(files), makeSiteCopy());
if (r.status !== 0) { console.error(r.out); process.exit(1); }
console.log(r.out);
spawn("node", ["preview.js"], { cwd: r.site, env: { ...process.env, PORT: "8899" }, stdio: "inherit" });
