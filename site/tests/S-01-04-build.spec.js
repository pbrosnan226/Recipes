// S-01 to S-04: the build (Node only; each test builds fixture notes in a temp copy of the site code).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { makeRoot, makeSiteCopy, build, pages, siteDir, repoRoot, mkdtemp } = require("./support/build");
const { note, scaleBlock, simple, simpleBody, simpleNote, listFixtures, alphaInput, GIF_BYTES } = require("./support/notes");

const read = (r, slug) => fs.readFileSync(path.join(r.dist, "recipes", slug + ".html"), "utf8");
const good = () => simpleNote();

const skipCases = {
  "missing source": note({ fm: { source: null }, body: simpleBody() }),
  "missing created": note({ fm: { created: null }, body: simpleBody() }),
  "missing what the source makes": note({ body: `${scaleBlock({ ...simple, base: undefined })}` }),
  "missing servings/batches noun": note({ body: scaleBlock({ ...simple, noun: "" }) }),
};
const malformed = {
  "ingredient without quantity or fixed text": note({ body: scaleBlock({ ...simple, ingredients: [{ id: "a", name: "x", text: "x" }] }) }),
  "ingredients not a list": note({ body: scaleBlock({ ...simple, ingredients: "nope" }) }),
  "step using an unknown key": note({ body: scaleBlock({ ...simple, steps: ["Mix {zzz}."] }) }),
  "steps not a list": note({ body: scaleBlock({ ...simple, steps: "nope" }) }),
  "no ingredient block at all": note({ body: "Just prose.\n" }),
  "block that is not valid code": note({ body: "```dataviewjs\nawait dv.view(\"scripts/scale\", { base: ;\n```\n" }),
};

test.describe("S-01 read the notes", () => {
  test("S-01.1 a root note tagged recipe is a recipe", () => {
    const r = build(makeRoot({ "Root One.md": good() }));
    expect(r.status).toBe(0);
    expect(pages(r.dist)).toEqual(["root-one.html"]);
  });

  test("S-01.2 a recipe-tagged note in a sub-folder is ignored", () => {
    const r = build(makeRoot({ "Root One.md": good(), "sub/Hidden Dish.md": good() }));
    expect(pages(r.dist)).toEqual(["root-one.html"]);
    expect(r.out).not.toContain("Hidden Dish");
  });

  test("S-01.3 a root note not tagged recipe is ignored", () => {
    const r = build(makeRoot({ "Root One.md": good(), "Other.md": note({ tags: ["notes"], body: simpleBody() }), "Plain.md": "no properties" }));
    expect(pages(r.dist)).toEqual(["root-one.html"]);
    expect(r.out).not.toMatch(/SKIPPED (Other|Plain)/);
  });

  test("S-01.4 the name comes from the file name", () => {
    const r = build(makeRoot({ "Mac & Cheese, Deluxe.md": note({ fm: { aliases: "[Something Else]" }, body: simpleBody() }) }));
    const html = fs.readFileSync(path.join(r.dist, "recipes", pages(r.dist)[0]), "utf8");
    expect(html).toContain("<h1>Mac &amp; Cheese, Deluxe</h1>");
    expect(html).not.toContain("Something Else");
  });

  test("S-01.5 reads source, site, description, photo, times, tags, ingredients, steps, notes, nutrition and dropdown choices", () => {
    const r = build(makeRoot({ "Alpha Soup.md": listFixtures["Alpha Soup"], "images/Alpha Soup.gif": GIF_BYTES }));
    const h = read(r, "alpha-soup");
    expect(h).toContain("https://example.com/r");
    expect(h).toContain("Serious Eats");
    expect(h).toContain("A hearty fixture soup.");
    expect(h).toContain("../images/Alpha%20Soup.gif");
    for (const t of ["10 mins", "20 mins", "30 mins"]) expect(h).toContain(t);
    expect(h).toMatch(/<option value="0">2<\/option><option value="1" selected>4<\/option><option value="2">8<\/option>/);
    expect(h).toContain("<b class=\"amt\">1 cup</b> flour");
    expect(h).toContain("Mix 1 cup with 1 egg");
    expect(h).toContain("First <strong>author</strong> note");
    expect(h).toContain("706");
    expect(h).toContain("Per serving:");
    expect(h).toContain("Soup"); // course
  });

  test("S-01.6 tags keep the note's order and include recipe", () => {
    const r = build(makeRoot({ "Alpha Soup.md": listFixtures["Alpha Soup"] }));
    const tags = [...read(r, "alpha-soup").matchAll(/<a class="tag"[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    expect(tags).toEqual(["recipe", "soup", "Quick"]);
  });

  for (const [why, content] of Object.entries(skipCases)) {
    test(`S-01.7 skips a note ${why}`, () => {
      const r = build(makeRoot({ "Good.md": good(), "Bad Note.md": content }));
      expect(r.status).toBe(0);
      expect(pages(r.dist)).toEqual(["good.html"]);
      expect(r.out).toMatch(/SKIPPED Bad Note\.md: .+/);
    });
  }

  test("S-01.8 skips a note whose properties can't be parsed", () => {
    const broken = "---\nsource: [unclosed\nsite: : :\ntags:\n  - recipe\n  bad: indent\n---\n" + simpleBody();
    const r = build(makeRoot({ "Good.md": good(), "Broken Props.md": broken }));
    expect(r.status).toBe(0);
    expect(pages(r.dist)).toEqual(["good.html"]);
    expect(r.out).toMatch(/SKIPPED Broken Props\.md: properties can't be parsed/);
  });

  for (const [why, content] of Object.entries(malformed)) {
    test(`S-01.9 skips a note with ${why}`, () => {
      const r = build(makeRoot({ "Good.md": good(), "Bad Note.md": content }));
      expect(r.status).toBe(0);
      expect(pages(r.dist)).toEqual(["good.html"]);
      expect(r.out).toMatch(/SKIPPED Bad Note\.md: .+/);
    });
  }

  test("S-01.10 the log names each skipped note and says why", () => {
    const r = build(makeRoot({ "Good.md": good(), "No Source.md": skipCases["missing source"], "Bad Steps.md": malformed["step using an unknown key"] }));
    expect(r.out).toMatch(/SKIPPED No Source\.md: .*source/);
    expect(r.out).toMatch(/SKIPPED Bad Steps\.md: .*zzz/);
    expect(r.out).toContain("skipped 2 note(s)");
  });

  test("S-01.11 after skipping a note the build reads the rest", () => {
    const r = build(makeRoot({ "A Bad.md": skipCases["missing source"], "B Good.md": good(), "C Bad.md": malformed["no ingredient block at all"], "D Good.md": good() }));
    expect(r.status).toBe(0);
    expect(pages(r.dist)).toEqual(["b-good.html", "d-good.html"]);
  });

  test("S-01.12 a note with no photo, notes, nutrition, description, site, times is still read", () => {
    const r = build(makeRoot({ "Bare.md": note({ body: simpleBody() }) }));
    expect(r.status).toBe(0);
    expect(pages(r.dist)).toEqual(["bare.html"]);
    // A note with no tag other than `recipe` is the minimum: a note without `recipe` is not a recipe at all.
  });
});

test.describe("S-02 produce and publish", () => {
  const root = () => makeRoot({ "Alpha Soup.md": listFixtures["Alpha Soup"], "images/Alpha Soup.gif": GIF_BYTES, "Delta Plain.md": good(), "Bad One.md": skipCases["missing source"] });

  test("S-02.1 one Home page with a card per readable recipe", () => {
    const r = build(root());
    const idx = fs.readFileSync(path.join(r.dist, "index.html"), "utf8");
    expect((idx.match(/<article class="card"/g) || []).length).toBe(2);
    expect(idx).toContain("Alpha Soup");
    expect(idx).toContain("Delta Plain");
  });
  test("S-02.2 one recipe page per readable recipe", () => {
    expect(pages(build(root()).dist).sort()).toEqual(["alpha-soup.html", "delta-plain.html"]);
  });
  test("S-02.3 no page and no row for a skipped note", () => {
    const r = build(root());
    expect(pages(r.dist)).not.toContain("bad-one.html");
    expect(fs.readFileSync(path.join(r.dist, "index.html"), "utf8")).not.toContain("Bad One");
  });
  test("S-02.4 the site is plain files, needing no server", () => {
    const r = build(root());
    const files = fs.readdirSync(r.dist, { recursive: true }).filter((f) => fs.statSync(path.join(r.dist, f)).isFile());
    for (const f of files) {
      const t = fs.readFileSync(path.join(r.dist, f), "utf8");
      expect(t, f).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket/);
    }
    // Links are relative, so the files also work from a folder or file:// without a server.
    const idx = fs.readFileSync(path.join(r.dist, "index.html"), "utf8");
    expect(idx).not.toMatch(/(href|src)="\//);
  });
  test("S-02.5 a successful build publishes the site folder", () => {
    const r = build(root());
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(r.dist, "index.html"))).toBe(true);
    expect(fs.existsSync(r.tmp)).toBe(false);
  });
  test("S-02.6 every page has a noindex robots directive", () => {
    const r = build(root());
    const htmls = fs.readdirSync(r.dist, { recursive: true }).filter((f) => f.endsWith(".html"));
    expect(htmls.length).toBe(3);
    for (const f of htmls) expect(fs.readFileSync(path.join(r.dist, f), "utf8")).toContain('<meta name="robots" content="noindex">');
    expect(fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8")).toContain("X-Robots-Tag");
  });
  test("S-02.7 robots.txt disallows all crawling", () => {
    expect(fs.readFileSync(path.join(build(root()).dist, "robots.txt"), "utf8")).toMatch(/User-agent: \*\s+Disallow: \/\s*$/);
  });
  test("S-02.8 nothing in the site code pushes or deploys", () => {
    const files = ["build.js", "preview.js", "package.json", "../netlify.toml", ...fs.readdirSync(path.join(siteDir, "lib")).map((f) => "lib/" + f)];
    for (const f of files) expect(fs.readFileSync(path.join(siteDir, f), "utf8"), f).not.toMatch(/git push|netlify deploy|netlify-cli|child_process|gh pr|\bcurl\b/);
  });
  test("S-02.9 a rebuild shows new and changed recipes and drops removed ones", () => {
    const rootDir = root();
    const site = makeSiteCopy();
    build(rootDir, site);
    fs.writeFileSync(path.join(rootDir, "New Dish.md"), good());
    fs.writeFileSync(path.join(rootDir, "Delta Plain.md"), note({ fm: { site: "Changed Site" }, body: simpleBody() }));
    fs.unlinkSync(path.join(rootDir, "Alpha Soup.md"));
    const r = build(rootDir, site);
    expect(pages(r.dist).sort()).toEqual(["delta-plain.html", "new-dish.html"]);
    expect(fs.readFileSync(path.join(r.dist, "index.html"), "utf8")).toContain("Changed Site");
    expect(fs.readFileSync(path.join(r.dist, "index.html"), "utf8")).not.toContain("Alpha Soup");
  });
});

test.describe("S-03 keep the previous site on failure", () => {
  const unreadable = () => ({ "Bad A.md": skipCases["missing source"], "Bad B.md": malformed["no ingredient block at all"], "Not Recipe.md": note({ tags: ["x"], body: "x" }) });

  test("S-03.1 no readable recipe means a non-zero exit", () => {
    expect(build(makeRoot(unreadable())).status).not.toBe(0);
  });
  test("S-03.2 the log says no readable recipes and still names each skipped note", () => {
    const r = build(makeRoot(unreadable()));
    expect(r.out).toMatch(/No readable recipes were found/);
    expect(r.out).toMatch(/SKIPPED Bad A\.md: .*source/);
    expect(r.out).toMatch(/SKIPPED Bad B\.md: .+/);
  });
  test("S-03.3 a failed build leaves nothing to publish, even over an earlier good build", () => {
    const site = makeSiteCopy();
    const ok = build(makeRoot({ "Good.md": good() }), site);
    expect(fs.existsSync(ok.dist)).toBe(true);
    const bad = build(makeRoot(unreadable()), site);
    expect(bad.status).not.toBe(0);
    expect(fs.existsSync(bad.dist)).toBe(false);
    expect(fs.existsSync(bad.tmp)).toBe(false);
  });
  test("S-03.4 the previous site stays live: a failed build never writes a replacement", () => {
    // Netlify keeps the last successful deploy when the build command exits non-zero (a hosting behaviour, checked by hand).
    // Here: the failure exits non-zero, so Netlify would publish nothing, and no partial dist exists to be published.
    const site = makeSiteCopy();
    const bad = build(makeRoot(unreadable()), site);
    expect(bad.status).not.toBe(0);
    expect(fs.existsSync(path.join(site, "dist", "index.html"))).toBe(false);
  });
  test("S-03.5 another error (missing scaler, missing folder) fails the same way", () => {
    const noScaler = build(makeRoot({ "Good.md": good() }, { withScaler: false }));
    expect(noScaler.status).not.toBe(0);
    expect(noScaler.out).toContain("BUILD FAILED");
    expect(fs.existsSync(noScaler.dist)).toBe(false);
    const missing = build(path.join(mkdtemp("nothing-"), "nope"));
    expect(missing.status).not.toBe(0);
    expect(fs.existsSync(missing.dist)).toBe(false);
  });
});

test.describe("S-04 Netlify setup", () => {
  test("S-04.1 the site's code lives in site/", () => {
    for (const f of ["build.js", "package.json", "lib/read.js"]) expect(fs.existsSync(path.join(repoRoot, "site", f)), f).toBe(true);
  });
  test("S-04.2 netlify.toml names the build command and publish folder", () => {
    const t = fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8");
    expect(t).toMatch(/^\s*command\s*=\s*".*npm run build.*"/m);
    expect(t).toMatch(/^\s*publish\s*=\s*"dist"/m);
    expect(fs.existsSync(path.join(siteDir, "netlify.toml")), "only one Netlify config").toBe(false);
  });
  test("S-04.7 the repo-root netlify.toml sets the base directory to site", () => {
    const t = fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8");
    expect(/\[build\]([^[]*)/.exec(t)[1]).toMatch(/^\s*base\s*=\s*"site"\s*$/m);
    expect(fs.existsSync(path.join(repoRoot, "site", "package.json"))).toBe(true);
  });
  test("S-04.3 and S-04.4 from a clean checkout: install + build, notes read from the repo root", () => {
    test.setTimeout(180000);
    const repo = mkdtemp("recipes-repo-");
    fs.writeFileSync(path.join(repo, "Root Dish.md"), good());
    fs.mkdirSync(path.join(repo, "scripts", "scale"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "scripts", "scale", "view.js"), path.join(repo, "scripts", "scale", "view.js"));
    const site = path.join(repo, "site");
    fs.mkdirSync(site);
    for (const f of ["build.js", "preview.js", "package.json", "package-lock.json"]) fs.copyFileSync(path.join(siteDir, f), path.join(site, f));
    fs.cpSync(path.join(siteDir, "lib"), path.join(site, "lib"), { recursive: true });
    fs.cpSync(path.join(siteDir, "static"), path.join(site, "static"), { recursive: true });
    // Netlify's command, exactly as the root netlify.toml has it, run in its base directory (site/), with no RECIPE_ROOT and no secrets in the environment.
    const cmd = /command\s*=\s*"([^"]+)"/.exec(fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8"))[1];
    const env = { PATH: process.env.PATH, HOME: process.env.HOME };
    const r = spawnSync("sh", ["-c", cmd], { cwd: site, env, encoding: "utf8" });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(fs.readdirSync(path.join(site, "dist", "recipes"))).toEqual(["root-dish.html"]);
  });
  test("S-04.5 the build needs no secret, login or server", () => {
    const src = ["build.js", ...fs.readdirSync(path.join(siteDir, "lib")).map((f) => "lib/" + f)].map((f) => fs.readFileSync(path.join(siteDir, f), "utf8")).join("\n");
    const envs = [...src.matchAll(/process\.env\.(\w+)/g)].map((m) => m[1]);
    expect(envs.filter((e) => e !== "RECIPE_ROOT")).toEqual([]);
    expect(src).not.toMatch(/require\(["'](http|https|net)["']\)/);
  });
  test("S-04.6 nothing in the repo pushes or deploys by itself", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(siteDir, "package.json"), "utf8"));
    for (const s of Object.values(pkg.scripts)) expect(s).not.toMatch(/push|deploy/);
    expect(fs.existsSync(path.join(repoRoot, ".github", "workflows"))).toBe(false);
    expect(fs.existsSync(path.join(repoRoot, ".git", "hooks", "post-commit"))).toBe(false);
  });
});
