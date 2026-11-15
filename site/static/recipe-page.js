// Recipe page (S-57): reads the slug from /recipe?name=<slug>, loads that recipe and its parts from Supabase
// with the public read-only key (GET only), and shows it at what the source makes. The servings dropdown rescales it in the browser (S-61). Ticking and Cook mode are other stories.
(function () {
  var cfg = window.RECIPES_CONFIG || {};
  var base = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  var root = document.getElementById("recipe");
  var slug = new URLSearchParams(location.search).get("name");
  // S-60: Netlify's placeholder matches a whole path segment, so the redirect from /recipes/<slug>.html can hand over "<slug>.html".
  // Drop that ending and tidy the address to /recipe?name=<slug>.
  if (slug && /\.html$/i.test(slug)) {
    slug = slug.replace(/\.html$/i, "");
    if (window.history && history.replaceState) history.replaceState(null, "", "/recipe?name=" + encodeURIComponent(slug));
  }
  if (!root) return;
  // S-59: no recipe with that name. Not a load failure, so no "Couldn't load recipes." and no Try again.
  function missing() {
    document.title = "Recipe not found";
    root.innerHTML = '<p class="empty">That recipe isn\'t here.</p>' +
      '<a class="backlink" href="/">Back to all recipes</a>';
  }
  if (!slug || !slug.trim()) { missing(); return; }
  if (!base || !cfg.supabaseKey) return;
  var headers = { apikey: cfg.supabaseKey, Authorization: "Bearer " + cfg.supabaseKey, "Accept-Profile": "recipes" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // The few bits of Markdown the notes use: **bold**, *italic*, `code`, [text](url).
  function inline(md) {
    var s = esc(md);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=$|[\s).,;:!?])/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
    return s;
  }
  function byPos(a, b) { return a.position - b.position; }
  function photoUrl(p) {
    return base + "/storage/v1/object/public/recipe-photos/" + p.split("/").map(encodeURIComponent).join("/");
  }
  function num(n) { return String(Number(n)); }

  var select = "*,course(name),recipe_tag(position,tag(name)),serving_option(*),recipe_ingredient(*),step(*),recipe_note(*),nutrient(*)";
  function load() {
    fetch(base + "/rest/v1/recipe?select=" + encodeURIComponent(select) + "&slug=eq." + encodeURIComponent(slug), { method: "GET", headers: headers })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) { if (rows.length) show(rows[0]); else missing(); /* an empty answer is "no such recipe" (S-59), not a failure */ },
        fail);
  }

  // S-58: the request failed (not an empty answer). No recipe content; the message and a Try again button,
  // under the unchanged header.
  function fail() {
    root.innerHTML = '<p class="empty" role="alert">Couldn\'t load recipes.</p>' +
      '<button type="button" class="chip" id="retry">Try again</button>';
    document.getElementById("retry").addEventListener("click", function () {
      root.innerHTML = "";
      load();
    });
  }
  load();

  function ingredientHtml(x) {
    var amount = String(x.amount || "").trim(), name = String(x.name || "").trim();
    var nw = name.toLowerCase().split(/\s+/).filter(Boolean), aw = amount.toLowerCase().split(/\s+/).filter(Boolean);
    var stem = function (w) { return w.replace(/(e?s)$/, ""); };
    var tail = aw.slice(aw.length - nw.length);
    if (nw.length && nw.length <= aw.length && tail.every(function (w, i) { return i === nw.length - 1 ? stem(w) === stem(nw[i]) : w === nw[i]; })) return '<b class="amt">' + esc(amount) + "</b>";
    if (/^for\s/i.test(amount)) return esc(name.charAt(0).toUpperCase() + name.slice(1)) + ', <b class="amt">' + esc(amount) + "</b>";
    return '<b class="amt">' + esc(amount) + "</b> " + esc(name);
  }

  // S-25: Favorite / Favorited, for a signed-in Member only (the box is not drawn for a Visitor). Favorites are read and
  // written with the Member's own sign-in. A favorites list that can't be read (including the table not existing yet)
  // counts as "not a favorite". Selecting Favorited removes it (S-26).
  function favoriteButton(recipeId) {
    var box = document.getElementById("actions");
    if (!box || !recipeId) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    var msg = document.createElement("p");
    msg.className = "note";
    msg.setAttribute("role", "alert");
    msg.hidden = true;
    msg.textContent = "Couldn't save. Try again.";
    function set(on) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = on ? "&#9829; Favorited" : "&#9825; Favorite";
      btn.classList.toggle("on-sage", on);
    }
    set(false);
    var busy = false;
    btn.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      msg.hidden = true;
      var was = btn.getAttribute("aria-pressed") === "true";
      set(!was);
      // Favorite adds the Member's row (S-25); Favorited deletes it (S-26). Only the favorite row is touched, so the
      // Want to try mark and the rating stay as they are. A failure puts the button back.
      var call = was
        ? RecipesAuth.api("favorite?user_id=eq." + encodeURIComponent(RecipesAuth.userId()) + "&recipe_id=eq." + encodeURIComponent(recipeId), { method: "DELETE", prefer: "return=minimal" })
        : RecipesAuth.api("favorite", { method: "POST", prefer: "return=minimal", body: { user_id: RecipesAuth.userId(), recipe_id: recipeId } });
      call
        .then(function (res) { if (!res.ok && !(!was && res.status === 409)) throw new Error("HTTP " + res.status); /* 409 on add: already saved */ })
        .catch(function () { set(was); msg.hidden = false; })
        .then(function () { busy = false; });
    });
    RecipesAuth.api("favorite?select=recipe_id&recipe_id=eq." + encodeURIComponent(recipeId))
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function () { return []; })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) set(true);
        box.appendChild(btn);
        box.appendChild(msg);
      });
  }

  function show(r) {
    var ings = r.recipe_ingredient.slice().sort(byPos);
    var steps = r.step.slice().sort(byPos).map(function (s) { return s.text; });
    var sc = window.RecipeScale.scale(ings, steps, r.base_amount, r.base_amount);
    var opts = r.serving_option.slice().sort(byPos);
    var tags = r.recipe_tag.slice().sort(byPos).map(function (t) { return t.tag.name; });
    var times = [["Prep", r.prep_time], ["Cook", r.cook_time], ["Total", r.total_time]].filter(function (t) { return t[1]; });
    document.title = r.name;

    function ingListHtml(sc) {
      return sc.groups.map(function (g) {
        return (g.name ? '<li class="sub">' + esc(g.name) + "</li>" : "") + g.rows.map(function (x) {
          return '<li><label><input type="checkbox"><span>' + ingredientHtml(x) + "</span></label></li>";
        }).join("\n");
      }).join("\n");
    }
    function stepListHtml(sc) {
      return sc.steps.map(function (s, i) { return '<li><span class="n">' + (i + 1) + "</span><p>" + esc(s) + "</p></li>"; }).join("\n");
    }
    var ingHtml = ingListHtml(sc);
    var stepHtml = stepListHtml(sc);

    var notes = r.recipe_note.slice().sort(byPos), noteHtml;
    var items = [];
    notes.forEach(function (n) {
      if (n.level === 1 && items.length) items[items.length - 1].kids.push(n.text);
      else items.push({ text: n.text, kids: [] });
    });
    noteHtml = items.map(function (n) {
      return "<li>" + inline(n.text) + (n.kids.length ? "<ul>" + n.kids.map(function (k) { return "<li>" + inline(k) + "</li>"; }).join("") + "</ul>" : "") + "</li>";
    }).join("\n");

    var nut = r.nutrient.slice().sort(byPos);
    var nutHtml = nut.length ? '<details class="nutr"><summary>Nutrition</summary>' +
      (r.nutrition_basis ? '<p class="basis">' + esc(r.nutrition_basis) + "</p>" : "") +
      '<div class="vals">' + nut.map(function (n) { return "<span>" + esc(n.name) + " <b>" + esc(n.amount) + "</b></span>"; }).join("") + "</div></details>" : "";

    var label = r.site || r.source_url, by = r.author ? ", by " + esc(r.author) : "";
    var src = /^https?:\/\//i.test(r.source_url)
      ? '<a class="srclink" href="' + esc(r.source_url) + '" rel="noopener noreferrer">Original recipe at ' + esc(label) + by + " &#8599;</a>"
      : '<span class="srclink">Original recipe at ' + esc(label) + by + "</span>";
    var optHtml = opts.map(function (o) {
      return '<option value="' + esc(num(o.amount)) + '"' + (Number(o.amount) === Number(r.base_amount) ? " selected" : "") + ">" + esc(o.label || num(o.amount)) + "</option>";
    }).join("");
    var makes = r.amount_noun === "servings" ? '<span class="note">(the source makes ' + esc(num(r.base_amount)) + ")</span>" : "";

    root.innerHTML =
      '<a class="backlink" href="/">&larr; Back to all recipes</a>' +
      '<section class="hero"><div class="text">' +
      (r.course ? '<span class="eyebrow">' + esc(r.course.name) + "</span>" : "") +
      "<h1>" + esc(r.name) + "</h1>" +
      (r.description ? '<p class="lead">' + esc(r.description) + "</p>" : "") +
      '<div class="facts">' + times.map(function (t) { return '<div class="fact"><span class="label">' + t[0] + '</span><span class="v">' + esc(t[1]) + "</span></div>"; }).join("\n") +
      '<div class="fact"><label class="label" for="sv">' + esc(r.servings_label || "Servings") + '</label><div class="serv-row"><select id="sv" autocomplete="off">' + optHtml + "</select>" + makes + "</div></div></div>" +
      (tags.length ? '<div class="rtags"><span class="label">Tags</span>' + tags.map(function (t) { return '<a class="tag" href="/?q=' + encodeURIComponent(t) + '">' + esc(t) + "</a>"; }).join("") + "</div>" : "") +
      (window.RecipesAuth && RecipesAuth.signedIn() ? '<div class="actions" id="actions"></div>' : "") +
      src + "</div>" +
      (r.photo_path ? '<div class="photo"><img src="' + esc(photoUrl(r.photo_path)) + '" alt="' + esc(r.name) + '"></div>' : "") +
      '</section><section class="body"><div class="ings"><h2>Ingredients</h2><ul class="ing" id="ing">' + ingHtml + "</ul></div>" +
      '<div class="method"><h2>Method</h2><ol class="steps" id="steps">' + stepHtml + "</ol>" +
      (items.length ? '<div class="notes"><h2>Notes</h2><ul>' + noteHtml + "</ul></div>" : "") + "</div></section>" + nutHtml;
    // S-61: the dropdown rescales the Ingredients and the amounts in the steps, in the browser (no request).
    var sel = document.getElementById("sv");
    sel.addEventListener("change", function () {
      var next = window.RecipeScale.scale(ings, steps, r.base_amount, Number(sel.value));
      var ingEl = document.getElementById("ing");
      var ticked = Array.prototype.map.call(ingEl.querySelectorAll("input"), function (c) { return c.checked; });
      ingEl.innerHTML = ingListHtml(next);
      Array.prototype.forEach.call(ingEl.querySelectorAll("input"), function (c, i) { c.checked = !!ticked[i]; });
      document.getElementById("steps").innerHTML = stepListHtml(next);
    });
    favoriteButton(r.id);
    var img = root.querySelector(".photo img");
    if (img) img.addEventListener("error", function () { img.parentNode.remove(); });
  }
})();
