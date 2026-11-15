// Home page (S-54): loads the recipes and courses from Supabase with the public read-only key (GET only),
// then filters, sorts and searches them in the page with no further request.
(function () {
  var cfg = window.RECIPES_CONFIG || {};
  var base = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  var headers = { apikey: cfg.supabaseKey, Authorization: "Bearer " + cfg.supabaseKey, "Accept-Profile": "recipes" };
  var root = document.getElementById("home");
  if (!root || !document.getElementById("tools") || !base || !cfg.supabaseKey) return;

  function get(path) {
    return fetch(base + "/rest/v1/" + path, { method: "GET", headers: headers }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function cmp(x, y) { return x.toLowerCase().localeCompare(y.toLowerCase(), "en"); }
  function photoUrl(p) {
    return base + "/storage/v1/object/public/recipe-photos/" + p.split("/").map(encodeURIComponent).join("/");
  }

  // S-27: /?favorites=1 for a signed-in Member shows only their favorites, under the title "Your favorites."
  // Anyone else gets the normal Home page.
  var favMode = new URLSearchParams(location.search).has("favorites") && !!(window.RecipesAuth && RecipesAuth.signedIn());

  // Title at once, so "Everything we cook." never flashes while the lists load (S-28.1).
  if (favMode) { var h1early = document.querySelector("h1"); if (h1early) h1early.textContent = "Your favorites."; }

  // The ids of the Member's favorites, read with their own sign-in (the database returns only their own rows).
  // Resolves to null when nobody is signed in any more (the sign-in could not be kept). A favorites list that can't be
  // read counts as no favorites (load failure for favorites is left out for now, as for the recipe page).
  function favoriteIds() {
    return RecipesAuth.api("favorite?select=recipe_id").then(function (r) {
      if (!r.ok) return [];
      return r.json().then(function (rows) { return rows.map(function (f) { return f.recipe_id; }); });
    }, function () { return RecipesAuth.signedIn() ? [] : null; });
  }

  // S-65: the average rating per recipe, from the public summary view (no who-rated). Resolves to a map
  // { recipe_id: {average, count} }, or null if the request fails (cards then show no rating text; Home still loads).
  // Kept on window.RecipesRatings so later stories (rating sort, filter, badge, recipe page) reuse it.
  function ratingSummary() {
    return get("recipe_rating_summary?select=recipe_id,average,rating_count").then(function (rows) {
      var m = {};
      rows.forEach(function (x) { m[x.recipe_id] = { average: Number(x.average), count: Number(x.rating_count) }; });
      return m;
    }, function () { return null; });
  }
  window.RecipesRatings = {
    summary: null,
    // "4.5 (3)", "No ratings yet", or "" when the summary could not be loaded.
    text: function (id) {
      var m = this.summary;
      if (!m) return "";
      var x = m[id];
      return x && x.count > 0 ? x.average.toFixed(1) + " (" + x.count + ")" : "No ratings yet";
    }
  };

  // S-66: the signed-in Member's own ratings and Want to try marks, read with their own sign-in (the row policy returns only
  // their rows). Nothing is requested when signed out. Each part is a map { recipe_id: stars } / { recipe_id: true }, or null when
  // that request fails (cards then show no personal part). Kept on window.RecipesPersonal for S-67, S-68 and S-70.
  function personalRows(path, pick) {
    if (!(window.RecipesAuth && RecipesAuth.signedIn())) return Promise.resolve(null);
    return RecipesAuth.api(path).then(function (r) {
      if (!r.ok) return null;
      return r.json().then(function (rows) {
        var m = {};
        rows.forEach(function (x) { m[x.recipe_id] = pick(x); });
        return m;
      });
    }, function () { return null; });
  }
  window.RecipesPersonal = {
    ratings: null, wantToTry: null,
    // "Your rating: 4.5", or "" when not rated / not loaded.
    ratingText: function (id) {
      var m = this.ratings;
      return m && m[id] != null ? "Your rating: " + Number(m[id]).toFixed(1) : "";
    },
    // Badge only when marked and not rated (rating wins).
    wants: function (id) {
      return !!(this.wantToTry && this.wantToTry[id] && !(this.ratings && this.ratings[id] != null));
    }
  };

  function load() {
    RecipesPersonal.ratings = RecipesPersonal.wantToTry = null;
    Promise.all([
      get("recipe?select=id,name,slug,site,photo_path,course(name),recipe_tag(position,tag(name)),recipe_ingredient(name)&recipe_ingredient.hidden=eq.false&order=name"),
      get("course?select=name,position&order=position"),
      favMode ? favoriteIds() : Promise.resolve(undefined),
      ratingSummary(),
      personalRows("rating?select=recipe_id,stars", function (x) { return x.stars; }),
      personalRows("want_to_try?select=recipe_id", function () { return true; })
    ]).then(function (res) {
      var favs = res[2];
      RecipesRatings.summary = res[3];
      RecipesPersonal.ratings = res[4];
      RecipesPersonal.wantToTry = res[5];
      if (favMode && favs === null) { location.replace("/"); return; }
      var recipes = favMode ? res[0].filter(function (r) { return favs.indexOf(r.id) > -1; }) : res[0];
      var rows = recipes.map(function (r) {
        return {
          id: r.id, name: r.name, slug: r.slug, site: r.site || "", photo: r.photo_path || "",
          course: r.course ? r.course.name : "",
          tags: (r.recipe_tag || []).slice().sort(function (a, b) { return a.position - b.position; })
            .map(function (t) { return t.tag.name; }),
          ings: (r.recipe_ingredient || []).map(function (i) { return String(i.name || "").toLowerCase(); })
        };
      });
      build(rows, res[1].map(function (c) { return c.name; }));
    }).catch(fail);
  }

  // S-55: no cards, search or chips; the message and a Try again button, under the unchanged header.
  function fail() {
    document.getElementById("tools").innerHTML = "";
    root.innerHTML = '<p class="empty" role="alert">Couldn\'t load recipes.</p>' +
      '<button type="button" class="chip" id="retry">Try again</button>';
    document.getElementById("retry").addEventListener("click", function () {
      root.innerHTML = "";
      load();
    });
  }

  load();

  function build(rows, courses) {
    // S-68/S-70.1: the second chip row is for signed-in Members only; Visitors get no row.
    var member = !!(window.RecipesAuth && RecipesAuth.signedIn());
    var chipHtml = ["All"].concat(courses).map(function (c) {
      return '<button type="button" class="chip' + (c === "All" ? " on" : "") + '" data-c="' + esc(c) + '" aria-pressed="' + (c === "All") + '">' + esc(c) + "</button>";
    }).join("\n");
    var cardHtml = rows.map(function (r, i) {
      var href = "/recipe?name=" + encodeURIComponent(r.slug);
      var tags = r.tags.map(function (t) {
        return '<a class="tag" href="/?q=' + encodeURIComponent(t) + '" data-tag="' + esc(t) + '">' + esc(t) + "</a>";
      }).join("");
      var rt = RecipesRatings.text(r.id), mine = RecipesPersonal.ratingText(r.id);
      return '<article class="card"><a class="photo t' + (i % 4) + '" href="' + esc(href) + '" tabindex="-1" aria-hidden="true">' +
        (r.photo ? '<img src="' + esc(photoUrl(r.photo)) + '" alt="' + esc(r.name) + '" loading="lazy">' : "") + "</a>" +
        '<div class="meta">' + (r.course ? '<span class="eyebrow">' + esc(r.course) + "</span>" : "") +
        '<a class="name" href="' + esc(href) + '">' + esc(r.name) + "</a>" +
        (rt ? '<span class="rating">' + esc(rt) + "</span>" : "") +
        (mine ? '<span class="rating mine">' + esc(mine) + "</span>" : RecipesPersonal.wants(r.id) ? '<span class="badge">Want to try</span>' : "") + (tags ? '<div class="tags">' + tags + "</div>" : "") + "</div></article>";
    }).join("\n");
    document.getElementById("tools").innerHTML =
      '<label for="q" class="sr">Search recipes</label>' +
      '<input id="q" class="search" type="search" placeholder="Search by name, site, tag or ingredient" autocomplete="off">' +
      '<div class="row"><div class="chips" id="chips" role="group" aria-label="Course">' + chipHtml + "</div>" +
      '<label class="sort">Sort by\n<select id="sort"><option value="name">Name</option><option value="site">Site</option><option value="rating">Rating</option></select></label></div>' +
      (member ? '<div class="chips mine-chips" id="mine" role="group" aria-label="Show">' +
        ["All", "Want to try", "Rated"].map(function (m) {
          return '<button type="button" class="chip' + (m === "All" ? " on" : "") + '" data-m="' + m + '" aria-pressed="' + (m === "All") + '">' + m + "</button>";
        }).join("") + "</div>" : "");
    if (favMode) { var h1 = document.querySelector("h1"); if (h1) h1.textContent = "Your favorites."; }
    // No favorites at all (S-28) gets its own message; a chip or search that leaves none is "Nothing matches that."
    var noneText = favMode && !rows.length ? "No favorites yet." : "Nothing matches that. Try another word.";
    root.innerHTML =
      '<p class="count" id="count" aria-live="polite"></p><div class="grid" id="grid">' + cardHtml + "</div>" +
      '<p class="empty" id="none" hidden>' + noneText + "</p>";

    var cards = Array.prototype.slice.call(root.querySelectorAll("#grid .card"));
    var grid = document.getElementById("grid"), $q = document.getElementById("q"), $sort = document.getElementById("sort");
    var $count = document.getElementById("count"), $none = document.getElementById("none");
    var chips = Array.prototype.slice.call(document.querySelectorAll("#chips .chip"));
    var course = "All", mine = "All";
    var mineChips = Array.prototype.slice.call(document.querySelectorAll("#mine .chip"));
    cards.forEach(function (c) {
      var img = c.querySelector("img");
      if (img) img.addEventListener("error", function () { img.remove(); });
    });

    // S-67: a Member sorts by their own rating, a Visitor by the average; null (no value, or data not loaded) sorts last.
    function sortValue(id) {
      if (window.RecipesAuth && RecipesAuth.signedIn()) {
        var m = RecipesPersonal.ratings;
        return m && m[id] != null ? Number(m[id]) : null;
      }
      var x = RecipesRatings.summary && RecipesRatings.summary[id];
      return x && x.count > 0 ? x.average : null;
    }

    function draw() {
      var t = $q.value.trim().toLowerCase(), key = $sort.value;
      var list = rows.map(function (r, i) { return i; }).filter(function (i) {
        var r = rows[i];
        if (course !== "All" && r.course !== course) return false;
        if (mine === "Want to try" && !(RecipesPersonal.wantToTry && RecipesPersonal.wantToTry[r.id])) return false;
        if (mine === "Rated" && !(RecipesPersonal.ratings && RecipesPersonal.ratings[r.id] != null)) return false;
        if (!t) return true;
        return [r.name, r.site].concat(r.tags).some(function (f) { return f && f.toLowerCase().indexOf(t) > -1; }) ||
          r.ings.some(function (n) { return n.indexOf(t) > -1; });
      });
      list.sort(function (a, b) {
        var A = rows[a], B = rows[b];
        if (key === "site") {
          if (!A.site !== !B.site) return !A.site ? 1 : -1;
          if (A.site) { var c = cmp(A.site, B.site); if (c) return c; }
        }
        if (key === "rating") {
          var va = sortValue(A.id), vb = sortValue(B.id);
          if ((va === null) !== (vb === null)) return va === null ? 1 : -1;
          if (va !== null && va !== vb) return vb - va;
        }
        return cmp(A.name, B.name);
      });
      cards.forEach(function (c) { c.hidden = true; });
      list.forEach(function (i) { cards[i].hidden = false; grid.appendChild(cards[i]); });
      $count.textContent = list.length + (list.length === 1 ? " recipe" : " recipes");
      $none.hidden = list.length > 0;
      if (!list.length && !(favMode && !rows.length)) {
        $none.textContent = course === "All" && !t && mine === "Want to try" ? "Nothing on your Want to try list yet."
          : course === "All" && !t && mine === "Rated" ? "You haven't rated any recipes yet."
          : "Nothing matches that. Try another word.";
      }
      chips.forEach(function (c) {
        var on = c.dataset.c === course;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      mineChips.forEach(function (c) {
        var on = c.dataset.m === mine;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { course = c.dataset.c; draw(); }); });
    mineChips.forEach(function (c) { c.addEventListener("click", function () { mine = c.dataset.m; draw(); }); });
    $sort.addEventListener("change", draw);
    $q.addEventListener("input", draw);
    grid.addEventListener("click", function (e) {
      var g = e.target.closest && e.target.closest("a[data-tag]");
      if (g) { e.preventDefault(); $q.value = g.dataset.tag; draw(); window.scrollTo(0, 0); }
    });
    function start() {
      course = "All"; mine = "All"; $sort.value = "name";
      $q.value = new URLSearchParams(location.search).get("q") || "";
      draw();
    }
    window.addEventListener("pageshow", function (e) { if (e.persisted) start(); });
    start();
  }
})();
