// S-01.13 to S-01.18, S-02.4/10, S-05.8, S-13: photos and courses in the build (Node only; fixture notes in temp copies of the site).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { makeRoot, build, pages, siteDir } = require("./support/build");
const { note, simpleBody } = require("./support/notes");

const BYTES = crypto.randomBytes(3000); // not a real image: proves the file is copied unchanged
const photoNote = (name, ext, fm = {}) => note({ fm, body: `![${name}](images/${encodeURIComponent(name)}.${ext})\n\n` + simpleBody() });
const read = (r, slug) => fs.readFileSync(path.join(r.dist, "recipes", slug + ".html"), "utf8");
const index = (r) => fs.readFileSync(path.join(r.dist, "index.html"), "utf8");
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const COURSES = ["Breakfast", "Main", "Side", "Soup", "Dessert", "Sauce"];
const cardOf = (html, name) => html.split("<article").find((a) => a.includes(`>${name}</a>`)) || "";

test.describe("S-01.13 to S-01.14 photo line", () => {
  test("S-01.13 a Markdown image pointing into images/ gives the decoded path as the photo file", () => {
    const r = build(makeRoot({ "French Toast.md": photoNote("French Toast", "jpg"), "images/French Toast.jpg": BYTES }));
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(r.dist, "images", "French Toast.jpg"))).toBe(true);
    expect(read(r, "french-toast")).toContain('src="../images/French%20Toast.jpg"');
  });
  test("S-01.14 an http(s) photo address: read with no photo, not skipped, NOTE line names the note", () => {
    for (const url of ["http://example.com/a.jpg", "https://example.com/a.jpg"]) {
      const r = build(makeRoot({ "Ext Photo.md": note({ body: `![Ext Photo](${url})\n\n` + simpleBody() }) }));
      expect(r.status).toBe(0);
      expect(pages(r.dist)).toEqual(["ext-photo.html"]);
      expect(r.out).toMatch(/^NOTE .*Ext Photo.*external address/m);
      expect(r.out).not.toContain("SKIPPED");
      expect(read(r, "ext-photo")).not.toContain("<img");
      expect(index(r)).not.toContain(url);
    }
  });
});

test.describe("S-01.15 to S-01.18 course", () => {
  test("S-01.15 each of the six courses is taken as the recipe's course", () => {
    const files = {};
    for (const c of COURSES) files[`Dish ${c}.md`] = note({ fm: { course: c }, body: simpleBody() });
    const r = build(makeRoot(files));
    expect(r.status).toBe(0);
    expect(r.out).not.toMatch(/^NOTE/m);
    for (const c of COURSES) {
      expect(read(r, `dish-${c.toLowerCase()}`)).toContain(`<span class="eyebrow">${c}</span>`);
      expect(cardOf(index(r), `Dish ${c}`)).toContain(`<span class="eyebrow">${c}</span>`);
    }
  });
  test("S-01.16 no course property: read with no course, no NOTE, no label", () => {
    const r = build(makeRoot({ "No Course.md": note({ body: simpleBody() }) }));
    expect(r.status).toBe(0);
    expect(r.out).not.toMatch(/^NOTE/m);
    expect(read(r, "no-course")).not.toContain("eyebrow");
    expect(cardOf(index(r), "No Course")).not.toContain("eyebrow");
    // that it shows only under the chip All is checked in the browser: S-20.5
  });
  for (const [why, val] of [["an unknown word", "Brunch"], ["empty", ""], ["more than one value", "[Main, Side]"], ["a list repeating one course", "[Soup, Soup]"]]) {
    test(`S-01.17 course value ${why}: read with no course, not skipped, NOTE names the note and says the course isn't valid`, () => {
      const r = build(makeRoot({ "Bad Course.md": note({ fm: { course: val }, body: simpleBody() }) }));
      expect(r.status).toBe(0);
      expect(pages(r.dist)).toEqual(["bad-course.html"]);
      expect(r.out).toMatch(/^NOTE .*Bad Course.*course isn't valid/m);
      expect(r.out).not.toContain("SKIPPED");
      expect(read(r, "bad-course")).not.toContain("eyebrow");
    });
  }
  test("S-01.18 the Home page offers All, Breakfast, Main, Side, Soup, Dessert, Sauce in order whatever courses the notes use", () => {
    for (const files of [{ "Only Plain.md": note({ body: simpleBody() }) }, { "A.md": note({ fm: { course: "Sauce" }, body: simpleBody() }), "B.md": note({ fm: { course: "Sauce" }, body: simpleBody() }) }]) {
      const chips = [...index(build(makeRoot(files))).matchAll(/class="chip[^"]*" data-c="([^"]+)"/g)].map((m) => m[1]);
      expect(chips).toEqual(["All", ...COURSES]);
    }
  });
});

test.describe("S-13 copy photo files / S-02.10", () => {
  const files = () => ({ "With Photo.md": photoNote("With Photo", "webp"), "images/With Photo.webp": BYTES, "No Photo.md": note({ body: simpleBody() }), "images/Unused.jpg": Buffer.from("x") });
  test("S-13.1 the photo is copied into the site with the same bytes", () => {
    const r = build(makeRoot(files()));
    expect(sha(path.join(r.dist, "images", "With Photo.webp"))).toBe(crypto.createHash("sha256").update(BYTES).digest("hex"));
  });
  test("S-13.2 / S-02.10 the recipe page and the Home card refer to the copy in the site, not to another site", () => {
    const r = build(makeRoot(files()));
    expect(read(r, "with-photo")).toContain('src="../images/With%20Photo.webp"');
    expect(cardOf(index(r), "With Photo")).toContain('src="images/With%20Photo.webp"');
    for (const f of ["index.html", "recipes/with-photo.html", "recipes/no-photo.html"]) {
      const h = fs.readFileSync(path.join(r.dist, f), "utf8");
      expect(h, f).not.toMatch(/<img[^>]+src="(https?:)?\/\//);
      for (const m of h.matchAll(/<img[^>]+src="([^"]+)"/g)) expect(fs.existsSync(path.join(r.dist, path.dirname(f), decodeURIComponent(m[1]))), m[1]).toBe(true);
    }
  });
  const missing = () => ({ "Lost Photo.md": photoNote("Lost Photo", "jpg"), "Good.md": note({ body: simpleBody() }) });
  test("S-13.3 and S-13.5 a missing photo file: still built with no photo, build succeeds, note not skipped", () => {
    const r = build(makeRoot(missing()));
    expect(r.status).toBe(0);
    expect(pages(r.dist).sort()).toEqual(["good.html", "lost-photo.html"]);
    expect(r.out).not.toContain("SKIPPED");
    expect(read(r, "lost-photo")).not.toContain("<img");
    expect(cardOf(index(r), "Lost Photo")).not.toContain("<img");
  });
  test("S-13.4 the log has a NOTE line naming the recipe and the missing file", () => {
    expect(build(makeRoot(missing())).out).toMatch(/^NOTE .*Lost Photo.*images\/Lost Photo\.jpg/m);
  });
  test("S-13.6 a recipe with no photo line gives no NOTE line and no copied file", () => {
    const r = build(makeRoot({ "No Photo.md": note({ body: simpleBody() }), "images/Unused.jpg": Buffer.from("x") }));
    expect(r.out).not.toMatch(/^NOTE/m);
    expect(fs.existsSync(path.join(r.dist, "images"))).toBe(false);
  });
  test("S-13.7 the build never changes, renames or deletes files in images/", () => {
    const root = makeRoot(files());
    const snap = () => fs.readdirSync(path.join(root, "images")).sort().map((f) => { const p = path.join(root, "images", f); return [f, sha(p), fs.statSync(p).mtimeMs]; });
    const before = snap();
    build(root);
    build(makeRoot({ ...files() }), undefined);
    expect(snap()).toEqual(before);
  });
});

test.describe("S-05.8 and S-02.4", () => {
  test("S-05.8 a recipe whose only tag is recipe shows just that tag; the tags block is absent when a card has none (see QUESTIONS)", () => {
    const r = build(makeRoot({ "Tagged.md": note({ body: simpleBody() }) }));
    // A note with no `recipe` tag is not a recipe; the fewest tags a recipe has is just `recipe`, so the card for that one has one tag only.
    expect(r.status).toBe(0);
    expect((cardOf(index(r), "Tagged").match(/class="tag"/g) || []).length).toBe(1);
  });
  test("S-02.4 the site's own scripts save nothing (no storage, cookies or requests of their own)", () => {
    for (const f of fs.readdirSync(path.join(siteDir, "static")).filter((f) => f.endsWith(".js"))) {
      expect(fs.readFileSync(path.join(siteDir, "static", f), "utf8"), f).not.toMatch(/localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/);
    }
  });
});
