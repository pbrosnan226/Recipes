// S-01: read the vault's recipe notes. Returns { recipes, skipped }.
// A note is a recipe when it is a .md file in the repo root tagged `recipe`.
// Notes that cannot be read are skipped and named, with a reason, in `skipped`.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const yaml = require("js-yaml");

// The fixed course list, in chip order (S-01.18). A note's `course` must be exactly one of these.
const COURSES = ["Breakfast", "Main", "Side", "Soup", "Dessert", "Sauce"];

class SkipNote extends Error {}
const skip = (msg) => {
  throw new SkipNote(msg);
};

function splitFrontmatter(raw) {
  const m = raw.replace(/^﻿/, "").match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : null;
}

function tagList(v) {
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : String(v).split(/[,\s]+/);
  return arr.map((t) => String(t).trim().replace(/^#/, "")).filter(Boolean);
}

const text = (v) => (v == null || v === "" ? "" : String(v).trim());

function dateText(v) {
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = text(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
}

// Parse the `await dv.view("scripts/scale", { ... })` block by running it against a stub.
async function parseScaleBlock(body) {
  const m = body.match(/```dataviewjs[ \t]*\r?\n([\s\S]*?)\r?\n```/);
  if (!m) skip("no dataviewjs ingredient/steps block");
  let input;
  let wrongView = "";
  const dv = {
    view: async (name, i) => {
      if (name !== "scripts/scale") wrongView = name;
      input = i;
    },
  };
  try {
    await vm.runInNewContext(`(async () => { ${m[1]} })()`, { dv }, { timeout: 2000 });
  } catch (e) {
    skip(`ingredient/steps block can't be parsed (${e.message})`);
  }
  if (wrongView) skip(`unexpected dv.view("${wrongView}")`);
  if (!input || typeof input !== "object") skip("ingredient/steps block does not call the scaler with data");
  return { input, block: m[0], blockIndex: m.index };
}

function validateScale(input) {
  const base = input.base;
  if (typeof base !== "number" || !(base > 0)) skip("missing what the source makes (base)");
  const noun = input.noun === undefined ? "servings" : input.noun;
  if (typeof noun !== "string" || !noun.trim()) skip("missing servings/batches noun");
  if (input.nounOne !== undefined && typeof input.nounOne !== "string") skip("malformed nounOne");
  if (input.prop !== undefined && (typeof input.prop !== "string" || !input.prop)) skip("malformed prop");

  if (!Array.isArray(input.ingredients)) skip("malformed ingredient block: ingredients is not a list");
  const ids = new Set();
  input.ingredients.forEach((ing, i) => {
    const where = `ingredient ${i + 1}`;
    if (!ing || typeof ing !== "object" || Array.isArray(ing)) skip(`malformed ingredient block: ${where} is not an object`);
    if (typeof ing.id !== "string" || !/^\w+$/.test(ing.id)) skip(`malformed ingredient block: ${where} has no valid id`);
    if (ids.has(ing.id)) skip(`malformed ingredient block: duplicate ingredient key "${ing.id}"`);
    ids.add(ing.id);
    if (!ing.hidden) {
      if (typeof ing.name !== "string" || !ing.name.trim()) skip(`malformed ingredient block: "${ing.id}" has no name`);
      if (typeof ing.text !== "string" || !ing.text.trim()) skip(`malformed ingredient block: "${ing.id}" has no text`);
    }
    const num = (x) => typeof x === "number" && isFinite(x);
    if (ing.s === undefined) {
      const okQ = num(ing.q) || (Array.isArray(ing.q) && ing.q.length === 2 && ing.q.every(num));
      if (!okQ) skip(`malformed ingredient block: "${ing.id}" has neither a quantity (q) nor fixed text (s)`);
    } else if (typeof ing.s !== "string") skip(`malformed ingredient block: "${ing.id}" fixed text (s) is not text`);
    if (ing.u !== undefined && !(typeof ing.u === "string" || (Array.isArray(ing.u) && ing.u.length === 2 && ing.u.every((x) => typeof x === "string"))))
      skip(`malformed ingredient block: "${ing.id}" unit (u) is not text or [singular, plural]`);
    if (ing.pre !== undefined && !num(ing.pre)) skip(`malformed ingredient block: "${ing.id}" pre is not a number`);
    if (ing.lead !== undefined && typeof ing.lead !== "string") skip(`malformed ingredient block: "${ing.id}" lead is not text`);
    if (ing.group !== undefined && typeof ing.group !== "string") skip(`malformed ingredient block: "${ing.id}" group is not text`);
  });
  if (!Array.isArray(input.steps)) skip("malformed steps block: steps is not a list");
  input.steps.forEach((s, i) => {
    if (typeof s !== "string" || !s.trim()) skip(`malformed steps block: step ${i + 1} is not text`);
    for (const t of s.matchAll(/\{(\w+)\}/g)) {
      if (!ids.has(t[1])) skip(`malformed steps block: step ${i + 1} uses {${t[1]}}, which is not an ingredient`);
    }
  });
}

// The label and options of the servings dropdown, from the Meta Bind INPUT line.
function parseDropdown(body, input) {
  const m = body.match(/^(.*?)`INPUT\[inlineSelect\((.*)\):(\w+)\]`(.*)$/m);
  const prop = input.prop || "servings_wanted";
  const options = [];
  let label = "";
  if (m) {
    label = m[1].replace(/\s*:\s*$/, "").trim();
    for (const o of m[2].matchAll(/option\(\s*([^,()]+?)\s*(?:,\s*([^)]*?)\s*)?\)/g)) {
      const amount = Number(o[1]);
      if (!isFinite(amount) || amount <= 0) skip(`servings dropdown has an option "${o[1]}" that is not a number`);
      options.push({ amount, label: o[2] ? o[2].trim() : "" });
    }
    if (m[3] !== prop) skip(`servings dropdown writes to ${m[3]} but the ingredient block reads ${prop}`);
  }
  return { label, options };
}

function sectionLines(body, title) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${title}\\s*$`, "i").test(l));
  if (start < 0) return null;
  const out = [];
  let inCode = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^```/.test(lines[i])) inCode = !inCode;
    if (!inCode && /^#{1,2}\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}

function parseNotes(body) {
  const lines = sectionLines(body, "Notes");
  if (!lines) return [];
  const notes = [];
  for (const l of lines) {
    const b = l.match(/^(\s*)[-*+]\s+(.*)$/);
    if (b) {
      if (b[1].length >= 2 && notes.length) notes[notes.length - 1].children.push(b[2].trim());
      else notes.push({ text: b[2].trim(), children: [] });
    } else if (l.trim() && /^\s+/.test(l) && notes.length) {
      const n = notes[notes.length - 1];
      if (n.children.length) n.children[n.children.length - 1] += " " + l.trim();
      else n.text += " " + l.trim();
    }
  }
  return notes;
}

function parseNutrition(body, warn) {
  const lines = sectionLines(body, "Nutrition");
  if (!lines) return null;
  const basis = (lines.find((l) => l.trim() && !l.trim().startsWith("|")) || "").trim();
  const rows = lines.filter((l) => l.trim().startsWith("|")).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (rows.length < 3 || !/^[\s:|-]+$/.test(rows[1].join("|"))) {
    warn("nutrition table can't be read; left out");
    return null;
  }
  const head = rows[0];
  const vals = rows[2];
  const nutrients = head.map((name, i) => ({ name, amount: vals[i] || "" })).filter((n) => n.name && n.amount);
  if (!nutrients.length) {
    warn("nutrition table is empty; left out");
    return null;
  }
  return { basis, nutrients };
}

function parseDescriptionAndPhoto(body, blockIndex) {
  // Only the part before the servings line / scaler block holds the description and photo.
  const head = body.slice(0, blockIndex).split(/\r?\n/);
  let photo = "";
  let description = "";
  const paras = [];
  let cur = [];
  for (const l of head) {
    if (!l.trim()) {
      if (cur.length) paras.push(cur.join(" "));
      cur = [];
    } else cur.push(l.trim());
  }
  if (cur.length) paras.push(cur.join(" "));
  for (const p of paras) {
    const img = p.match(/^!\[[^\]]*\]\((.+)\)$/);
    if (img) {
      if (!photo) photo = img[1].trim();
    } else if (!description && !p.includes("INPUT[")) description = p;
  }
  return { description, photo };
}

// S-01.15 to S-01.17: the note's course, or "" (with a NOTE when the property is there but not valid).
function readCourse(props, warn) {
  if (!("course" in props)) return "";
  const v = props.course;
  if (typeof v === "string" && COURSES.includes(v.trim())) return v.trim();
  const shown = v === null || v === "" ? "empty" : Array.isArray(v) ? `a list (${v.join(", ")})` : `"${String(v)}"`;
  warn(`course isn't valid (${shown}); it must be one of ${COURSES.join(", ")}; built with no course`);
  return "";
}

// S-01.13, S-01.14, S-13.3, S-13.4: the note's photo line -> the path of a file in images/ ("" for no photo).
function resolvePhoto(ref, root, warn) {
  if (!ref) return "";
  let p = ref.trim().replace(/^<(.*)>$/, "$1");
  if (/^https?:\/\//i.test(p)) {
    warn(`photo is an external address; built with no photo (the note must link a file in images/)`);
    return "";
  }
  try {
    p = decodeURIComponent(p);
  } catch (e) {
    /* keep the text as written */
  }
  p = p.replace(/^\.\//, "");
  const parts = p.split("/");
  if (parts[0] !== "images" || parts.length < 2 || parts.some((x) => x === ".." || x === "." || x === "")) {
    warn(`photo isn't a file in images/ (${p}); built with no photo`);
    return "";
  }
  let ok = false;
  try {
    ok = fs.lstatSync(path.join(root, ...parts)).isFile(); // lstat: a symlink is not a file in images/
  } catch (e) {
    ok = false;
  }
  if (!ok) {
    warn(`photo file ${p} is missing; built with no photo`);
    return "";
  }
  return p;
}

async function readNote(file, name, raw, warn, root) {
  const parts = splitFrontmatter(raw);
  if (!parts) return null; // no properties: not a recipe
  let props;
  try {
    props = yaml.load(parts.fm);
  } catch (e) {
    // Broken properties: it only matters if the note is meant to be a recipe.
    if (/^\s*(tags:.*\brecipe\b|-\s*["']?#?recipe["']?\s*$)/m.test(parts.fm))
      skip(`properties can't be parsed (${e.message.split("\n")[0]})`);
    return null;
  }
  if (!props || typeof props !== "object" || Array.isArray(props)) return null;
  const tags = tagList(props.tags);
  if (!tags.includes("recipe")) return null;

  const source = text(props.source);
  if (!source) skip("missing required field: source");
  const created = dateText(props.created);
  if (!created) skip("missing required field: created (a date like 2026-11-07)");

  const { input, blockIndex } = await parseScaleBlock(parts.body);
  validateScale(input);
  const dropdown = parseDropdown(parts.body, input);
  const noun = input.noun === undefined ? "servings" : input.noun;
  const base = input.base;

  let options = dropdown.options;
  if (!options.length) options = [{ amount: base, label: "" }];
  if (!options.some((o) => o.amount === base)) {
    options = options.concat([{ amount: base, label: "" }]).sort((a, b) => a.amount - b.amount);
    warn(`the servings dropdown has no option for what the source makes (${base}); added one`);
  }

  const { description, photo: photoRef } = parseDescriptionAndPhoto(parts.body, blockIndex);
  const photo = resolvePhoto(photoRef, root, warn);
  const course = readCourse(props, warn);
  const totalMinutes = Number.isFinite(Number(props.total_minutes)) && props.total_minutes !== null ? Math.round(Number(props.total_minutes)) : null;
  const aliases = Array.isArray(props.aliases) ? props.aliases.map(text).filter(Boolean) : [];

  return {
    name,
    source,
    archived: text(props.archived),
    site: text(props.site),
    author: text(props.author),
    aliases,
    description,
    photo,
    course,
    created,
    tags,
    times: { prep: text(props.prep_time), cook: text(props.cook_time), total: text(props.total_time) },
    totalMinutes,
    base,
    noun,
    nounOne: input.nounOne || "",
    prop: input.prop || "servings_wanted",
    dropdownLabel: dropdown.label || (noun === "servings" ? "Servings" : noun.charAt(0).toUpperCase() + noun.slice(1)),
    options,
    scaleInput: input,
    notes: parseNotes(parts.body),
    nutrition: parseNutrition(parts.body, warn),
  };
}

async function readRecipes(root) {
  const recipes = [];
  const skipped = [];
  const warnings = [];
  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".md") && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));
  for (const file of files) {
    const name = file.replace(/\.md$/, "");
    try {
      const raw = fs.readFileSync(path.join(root, file), "utf8");
      const r = await readNote(file, name, raw, (w) => warnings.push({ note: file, message: w }), root);
      if (r) recipes.push(r);
    } catch (e) {
      skipped.push({ note: file, reason: e instanceof SkipNote ? e.message : `unexpected error: ${e.message}` });
    }
  }
  return { recipes, skipped, warnings };
}

module.exports = { readRecipes, COURSES };
