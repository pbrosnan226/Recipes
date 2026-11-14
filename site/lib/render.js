// HTML for the Recipe list and Recipe pages (static; the small scripts in static/ add the behaviour).
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// JSON that is safe inside a <script type="application/json"> element.
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const safeUrl = (u) => /^https?:\/\//i.test(u);

// The few bits of Markdown the notes use: **bold**, *italic*, `code`, [text](url).
function inline(md) {
  let s = esc(md);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=$|[\s).,;:!?])/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  return s;
}

const { COURSES } = require("./read");

// URL for a stored photo: `images/French Toast.jpg` -> `images/French%20Toast.jpg`, under `prefix` ("" or "../").
const photoUrl = (file, prefix) => prefix + file.split("/").map(encodeURIComponent).join("/");

function head(title, cssHref) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${cssHref}">
</head>
`;
}

function header(prefix) {
  return `<header class="hdr">
<a class="logo" href="${prefix}index.html">Recipes</a>
<nav class="main"><a class="on" href="${prefix}index.html">Browse</a></nav>
</header>`;
}

const countText = (n) => `${n} ${n === 1 ? "recipe" : "recipes"}`;

// rows: [{ name, href, site, tags, course, photo }] already sorted by name.
function listPage(rows) {
  const data = rows.map((r) => ({ name: r.name, site: r.site, tags: r.tags, course: r.course }));
  const cards = rows
    .map((r, i) => {
      const photo = r.photo
        ? `<img src="${esc(photoUrl(r.photo, ""))}" alt="${esc(r.name)}" loading="lazy">`
        : "";
      const tags = r.tags.map((t) => `<a class="tag" href="?q=${encodeURIComponent(t)}" data-tag="${esc(t)}">${esc(t)}</a>`).join("");
      return `<article class="card" data-i="${i}">
<a class="photo t${i % 4}" href="${esc(r.href)}" tabindex="-1" aria-hidden="true">${photo}</a>
<div class="meta">${r.course ? `<span class="eyebrow">${esc(r.course)}</span>` : ""}<a class="name" href="${esc(r.href)}">${esc(r.name)}</a>${tags ? `<div class="tags">${tags}</div>` : ""}</div>
</article>`;
    })
    .join("\n");
  const chips = ["All", ...COURSES].map((c) => `<button type="button" class="chip${c === "All" ? " on" : ""}" data-c="${esc(c)}" aria-pressed="${c === "All"}">${esc(c)}</button>`).join("\n");
  return `${head("Recipes", "style.css")}<body>
${header("")}
<main>
<div class="top">
<h1>Everything we cook.</h1>
<label for="q" class="sr">Search recipes</label>
<input id="q" class="search" type="search" placeholder="Search by name, site or tag" autocomplete="off">
<div class="row">
<div class="chips" id="chips" role="group" aria-label="Course">
${chips}
</div>
<label class="sort">Sort by
<select id="sort"><option value="name">Name</option><option value="site">Site</option></select></label>
</div>
</div>
<p class="count" id="count" aria-live="polite">${countText(rows.length)}</p>
<div class="grid" id="grid">
${cards}
</div>
<p class="empty" id="none" hidden>Nothing matches that. Try another word.</p>
</main>
<script type="application/json" id="data">${jsonForScript(data)}</script>
<script src="list.js"></script>
</body></html>
`;
}

const stepsHtml = (steps) => steps.map((s) => inline(s));

// The scaler's tables for one dropdown value -> flat rows: { sub } for a group heading, { name, amount } for an ingredient.
function flatRows(tables) {
  const out = [];
  for (const t of tables) {
    if (t.group) out.push({ sub: t.group });
    for (const r of t.rows) out.push({ name: r[0], amount: r[2] });
  }
  return out;
}

// One ingredient row's inner HTML. The amount is the part the servings dropdown rewrites.
//  - amount already ends with the whole name ("6 large eggs", "eggs"): show the amount alone.
//  - fixed text starting with "for " ("for serving"): "Maple syrup, for serving".
//  - otherwise: "<amount> <name>".
function ingredientHtml(x) {
  const amount = String(x.amount || "").trim();
  const name = String(x.name || "").trim();
  // Drop the name only when its words are the amount's trailing words (last word may differ by s/es).
  const nw = name.toLowerCase().split(/\s+/).filter(Boolean);
  const aw = amount.toLowerCase().split(/\s+/).filter(Boolean);
  const stem = (w) => w.replace(/(e?s)$/, "");
  const tail = aw.slice(aw.length - nw.length);
  if (nw.length && nw.length <= aw.length && tail.every((w, i) => (i === nw.length - 1 ? stem(w) === stem(nw[i]) : w === nw[i]))) return `<b class="amt">${esc(amount)}</b>`;
  if (/^for\s/i.test(amount)) return `${esc(name.charAt(0).toUpperCase() + name.slice(1))}, <b class="amt">${esc(amount)}</b>`;
  return `<b class="amt">${esc(amount)}</b> ${esc(name)}`;
}

function recipePage(r, variants) {
  const baseIdx = r.options.findIndex((o) => o.amount === r.base);
  const v = variants[baseIdx];
  const time = [["Prep", r.times.prep], ["Cook", r.times.cook], ["Total", r.times.total]].filter(([, t]) => t);
  const opts = r.options.map((o, i) => `<option value="${i}"${i === baseIdx ? " selected" : ""}>${esc(o.label || o.amount)}</option>`).join("");
  const makes = r.noun === "servings" ? `<span class="note">(the source makes ${esc(r.base)})</span>` : "";
  const sourceLabel = (r.site || r.source) + "";
  const by = r.author ? `, by ${esc(r.author)}` : "";
  const sourceLink = safeUrl(r.source)
    ? `<a class="srclink" href="${esc(r.source)}" rel="noopener noreferrer">Original recipe at ${esc(sourceLabel)}${by} &#8599;</a>`
    : `<span class="srclink">Original recipe at ${esc(sourceLabel)}${by}</span>`;

  const rows = flatRows(v.tables);
  const ingHtml = rows
    .map((x) => (x.sub ? `<li class="sub">${esc(x.sub)}</li>` : `<li><label><input type="checkbox"><span>${ingredientHtml(x)}</span></label></li>`))
    .join("\n");
  const stepList = stepsHtml(v.steps)
    .map((s, i) => `<li><span class="n">${i + 1}</span><p>${s}</p></li>`)
    .join("\n");

  const notes = r.notes.length
    ? `<div class="notes"><h2>Notes</h2>
<ul>
${r.notes.map((n) => `<li>${inline(n.text)}${n.children.length ? `<ul>${n.children.map((c) => `<li>${inline(c)}</li>`).join("")}</ul>` : ""}</li>`).join("\n")}
</ul></div>`
    : "";
  const nutrition = r.nutrition
    ? `<details class="nutr">
<summary>Nutrition</summary>
${r.nutrition.basis ? `<p class="basis">${esc(r.nutrition.basis)}</p>` : ""}
<div class="vals">${r.nutrition.nutrients.map((n) => `<span>${esc(n.name)} <b>${esc(n.amount)}</b></span>`).join("")}</div>
</details>`
    : "";

  const payload = variants.map((x) => ({ amts: flatRows(x.tables).filter((y) => !y.sub).map((y) => y.amount), steps: stepsHtml(x.steps) }));

  return `${head(r.name, "../style.css")}<body>
${header("../")}
<main>
<a class="backlink" href="../index.html">&larr; Back to all recipes</a>

<section class="hero">
<div class="text">
${r.course ? `<span class="eyebrow">${esc(r.course)}</span>` : ""}
<h1>${esc(r.name)}</h1>
${r.description ? `<p class="lead">${esc(r.description)}</p>` : ""}
<div class="facts">
${time.map(([l, t]) => `<div class="fact"><span class="label">${l}</span><span class="v">${esc(t)}</span></div>`).join("\n")}
<div class="fact"><label class="label" for="sv">${esc(r.dropdownLabel)}</label>
<div class="serv-row"><select id="sv" autocomplete="off">${opts}</select>${makes}</div></div>
</div>
<div class="actions">
<button type="button" id="cook" class="pill" aria-pressed="false">Cook mode</button>
</div>
${r.tags.length ? `<div class="rtags"><span class="label">Tags</span>${r.tags.map((t) => `<a class="tag" href="../index.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</div>` : ""}
${sourceLink}
</div>
${r.photo ? `<div class="photo"><img src="${esc(photoUrl(r.photo, "../"))}" alt="${esc(r.name)}"></div>` : ""}
</section>

<section class="body">
<div class="ings"><h2>Ingredients</h2><ul class="ing" id="ing">
${ingHtml}
</ul></div>
<div class="method"><h2>Method</h2><ol class="steps" id="steps">
${stepList}
</ol>
${notes}</div>
</section>
${nutrition}
</main>
<script type="application/json" id="variants" data-default="${baseIdx}">${jsonForScript(payload)}</script>
<script src="../recipe.js"></script>
</body></html>
`;
}

module.exports = { listPage, recipePage };
