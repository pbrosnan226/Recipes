// Runs the vault's own scripts/scale/view.js (the Obsidian renderer) with a stub of Dataview,
// independently of the site's code, so the site's amounts can be compared with what Obsidian shows.
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.resolve(__dirname, "..", "..", "..", "scripts", "scale", "view.js"), "utf8");
const render = new Function("dv", "input", src);
function oracle(input, want) {
  const out = { tables: [], steps: [], groups: [] };
  let g = "";
  const dv = {
    current: () => ({ servings_wanted: want }),
    header: (l, t) => { if (l === 3) g = t; },
    table: (head, rows) => { out.tables.push({ group: g, head, rows }); g = ""; },
    paragraph: (md) => { out.steps = String(md).split(/\n(?=\d+\. )/).map((p, i) => p.replace(new RegExp(`^${i + 1}\\. `), "")); },
  };
  render(dv, JSON.parse(JSON.stringify(input)));
  return out;
}
module.exports = { oracle };
