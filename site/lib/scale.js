// Servings scaling. The amounts come from running the vault's own renderer,
// scripts/scale/view.js (unchanged), against a stub of Dataview, once per
// dropdown option. The site therefore shows exactly what Obsidian shows.
const fs = require("fs");
const path = require("path");

function loadRenderer(root) {
  const file = path.join(root, "scripts", "scale", "view.js");
  const src = fs.readFileSync(file, "utf8");
  // view.js is a Dataview view: it uses the globals `dv` and `input`, and top-level `await`-free code.
  return new Function("dv", "input", src);
}

// Returns { tables: [{ group, head, rows }], steps: [string] } for one dropdown value.
function renderAt(render, recipe, want) {
  const out = { tables: [], steps: [] };
  let group = "";
  let sawInstructions = false;
  const dv = {
    current: () => ({ [recipe.prop]: want }),
    header: (level, title) => {
      if (level === 3) group = title;
      if (level === 2 && title === "Instructions") sawInstructions = true;
    },
    table: (head, rows) => {
      out.tables.push({ group, head, rows });
      group = "";
    },
    paragraph: (md) => {
      // "1. first\n2. second"
      const parts = String(md).split(/\n(?=\d+\. )/);
      out.steps = parts.map((p, i) => p.replace(new RegExp(`^${i + 1}\\. `), ""));
    },
  };
  // view.js takes the input as a plain object; copy so it can't be modified between runs.
  const input = JSON.parse(JSON.stringify(recipe.scaleInput));
  render(dv, input);
  if (!sawInstructions) throw new Error("the scaler produced no steps");
  if (out.steps.length !== recipe.scaleInput.steps.length) throw new Error("the scaler returned a different number of steps");
  return out;
}

function renderAll(render, recipe) {
  return recipe.options.map((o) => ({ amount: o.amount, label: o.label, ...renderAt(render, recipe, o.amount) }));
}

module.exports = { loadRenderer, renderAll };
