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

  function load() {
    Promise.all([
      get("recipe?select=name,slug,site,photo_path,course(name),recipe_tag(position,tag(name)),recipe_ingredient(name)&recipe_ingredient.hidden=eq.false&order=name"),
      get("course?select=name,position&order=position")
    ]).then(function (res) {
      var rows = res[0].map(function (r) {
        return {
          name: r.name, slug: r.slug, site: r.site || "", photo: r.photo_path || "",
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
    var chipHtml = ["All"].concat(courses).map(function (c) {
      return '<button type="button" class="chip' + (c === "All" ? " on" : "") + '" data-c="' + esc(c) + '" aria-pressed="' + (c === "All") + '">' + esc(c) + "</button>";
    }).join("\n");
    var cardHtml = rows.map(function (r, i) {
      var href = "/recipe?name=" + encodeURIComponent(r.slug);
      var tags = r.tags.map(function (t) {
        return '<a class="tag" href="/?q=' + encodeURIComponent(t) + '" data-tag="' + esc(t) + '">' + esc(t) + "</a>";
      }).join("");
      return '<article class="card"><a class="photo t' + (i % 4) + '" href="' + esc(href) + '" tabindex="-1" aria-hidden="true">' +
        (r.photo ? '<img src="' + esc(photoUrl(r.photo)) + '" alt="' + esc(r.name) + '" loading="lazy">' : "") + "</a>" +
        '<div class="meta">' + (r.course ? '<span class="eyebrow">' + esc(r.course) + "</span>" : "") +
        '<a class="name" href="' + esc(href) + '">' + esc(r.name) + "</a>" + (tags ? '<div class="tags">' + tags + "</div>" : "") + "</div></article>";
    }).join("\n");
    document.getElementById("tools").innerHTML =
      '<label for="q" class="sr">Search recipes</label>' +
      '<input id="q" class="search" type="search" placeholder="Search by name, site, tag or ingredient" autocomplete="off">' +
      '<div class="row"><div class="chips" id="chips" role="group" aria-label="Course">' + chipHtml + "</div>" +
      '<label class="sort">Sort by\n<select id="sort"><option value="name">Name</option><option value="site">Site</option></select></label></div>';
    root.innerHTML =
      '<p class="count" id="count" aria-live="polite"></p><div class="grid" id="grid">' + cardHtml + "</div>" +
      '<p class="empty" id="none" hidden>Nothing matches that. Try another word.</p>';

    var cards = Array.prototype.slice.call(root.querySelectorAll("#grid .card"));
    var grid = document.getElementById("grid"), $q = document.getElementById("q"), $sort = document.getElementById("sort");
    var $count = document.getElementById("count"), $none = document.getElementById("none");
    var chips = Array.prototype.slice.call(document.querySelectorAll("#chips .chip"));
    var course = "All";
    cards.forEach(function (c) {
      var img = c.querySelector("img");
      if (img) img.addEventListener("error", function () { img.remove(); });
    });

    function draw() {
      var t = $q.value.trim().toLowerCase(), key = $sort.value;
      var list = rows.map(function (r, i) { return i; }).filter(function (i) {
        var r = rows[i];
        if (course !== "All" && r.course !== course) return false;
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
        return cmp(A.name, B.name);
      });
      cards.forEach(function (c) { c.hidden = true; });
      list.forEach(function (i) { cards[i].hidden = false; grid.appendChild(cards[i]); });
      $count.textContent = list.length + (list.length === 1 ? " recipe" : " recipes");
      $none.hidden = list.length > 0;
      chips.forEach(function (c) {
        var on = c.dataset.c === course;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { course = c.dataset.c; draw(); }); });
    $sort.addEventListener("change", draw);
    $q.addEventListener("input", draw);
    grid.addEventListener("click", function (e) {
      var g = e.target.closest && e.target.closest("a[data-tag]");
      if (g) { e.preventDefault(); $q.value = g.dataset.tag; draw(); window.scrollTo(0, 0); }
    });
    function start() {
      course = "All"; $sort.value = "name";
      $q.value = new URLSearchParams(location.search).get("q") || "";
      draw();
    }
    window.addEventListener("pageshow", function (e) { if (e.persisted) start(); });
    start();
  }
})();
