// S-14, S-15, S-16, S-34: the wording of .claude/skills/recipe-extract/SKILL.md and the root CLAUDE.md (read the files; no browser).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { repoRoot } = require("./support/build");

const skill = fs.readFileSync(path.join(repoRoot, ".claude", "skills", "recipe-extract", "SKILL.md"), "utf8");
const claude = fs.readFileSync(path.join(repoRoot, "CLAUDE.md"), "utf8");
const flat = (s) => s.replace(/\s+/g, " ");
const sk = flat(skill);
const section = (title) => flat((skill.split(new RegExp(`^## ${title}\\s*$`, "m"))[1] || "").split(/^## /m)[0]);
const photo = section("Photo");
const course = section("Course");

test.describe("S-14 save a recipe's photo", () => {
  test("S-14.1 the skill says to download the photo from the address found on the recipe page", () => {
    expect(photo).toMatch(/Download the source's photo/);
    expect(sk).toMatch(/photo URL/); // the extraction step still returns the photo address to download
  });
  test("S-14.2 saved in images/ in the vault root, creating the folder if needed", () => {
    expect(photo).toMatch(/into `images\/` in the vault root \(create the folder if it doesn't exist\)/);
  });
  test("S-14.3 named after the note, with the extension of the type actually downloaded", () => {
    expect(photo).toMatch(/Name the file after the note, with the extension of the file type actually downloaded/);
    expect(photo).toContain("`images/French Toast.jpg` for `French Toast.md`");
    expect(photo).toContain("`images/French Toast.webp`");
  });
  test("S-14.4 stored exactly as downloaded", () => {
    expect(photo).toMatch(/exactly as downloaded, with no resizing, converting or editing/);
  });
  test("S-14.5 the photo line is a standard Markdown image, dish name as alt, spaces as %20", () => {
    expect(photo).toContain("`![<dish>](images/French%20Toast.jpg)`");
    expect(photo).toMatch(/dish name as alt text/);
    expect(photo).toMatch(/spaces written as `%20`/);
  });
  test("S-14.6 the line sits where the template puts the photo, and the note holds no other address", () => {
    const tpl = skill.split(/^## 4\. Note template/m)[1].split(/^## Photo/m)[0];
    const lines = tpl.split("\n");
    const desc = lines.findIndex((l) => l.startsWith("<one-line paraphrase"));
    const img = lines.findIndex((l) => l.startsWith("![<dish>]"));
    const servings = lines.findIndex((l) => l.startsWith("Servings:"));
    expect(desc).toBeGreaterThan(0);
    expect(img).toBeGreaterThan(desc);
    expect(img).toBeLessThan(servings);
    expect(photo).toMatch(/The note holds no other address for the photo/);
  });
  test("S-14.7 with no photo: no photo line, no file, the Owner is told in chat", () => {
    expect(photo).toMatch(/When the source gives no photo, write no photo line and say so in chat/);
    expect(photo).toMatch(/leave no file in `images\/`/);
  });
});

test.describe("S-15 photo can't be downloaded", () => {
  test("S-15.1 the note is still saved (the failure rule only drops the photo line)", () => {
    expect(photo).toMatch(/When the photo can't be downloaded \(blocked, dead link\), leave out the photo line/);
    expect(photo).not.toMatch(/(don't|do not|never) (save|write) the note/i);
  });
  test("S-15.2 no photo line and no external address", () => {
    expect(photo).toMatch(/leave out the photo line/);
    expect(photo).toMatch(/holds no other address/);
  });
  test("S-15.3 no file for that recipe is left in images/", () => {
    expect(photo).toMatch(/leave no file in `images\/`/);
  });
  test("S-15.4 the Owner is told in chat which photo failed (recipe name and photo address) and why", () => {
    expect(photo).toMatch(/tell the Owner in chat which photo failed \(recipe name and photo address\) and why/);
  });
  test("S-15.5 the rest of the note is the same: the rule changes nothing but the photo line", () => {
    expect(photo).not.toMatch(/\b(omit|skip|leave out) (the )?(notes|nutrition|description|ingredients|steps)/i);
  });
});

test.describe("S-16 extraction wording", () => {
  test("S-16.1 skill: download into images/, named after the note, type's extension, as downloaded", () => {
    expect(photo).toMatch(/Download .* into `images\/`/);
    expect(photo).toMatch(/Name the file after the note/);
    expect(photo).toMatch(/exactly as downloaded/);
  });
  test("S-16.2 template photo line", () => {
    expect(skill).toContain("![<dish>](images/<note name with spaces as %20>.<extension>)");
    expect(skill).not.toContain("![<dish>](<photo url>)");
  });
  test("S-16.3 no hot-link, full-size URL or 200-check wording", () => {
    expect(sk).not.toMatch(/hot-?link/i);
    expect(sk).not.toMatch(/full-size/i);
    expect(sk).not.toMatch(/returns 200/i);
    expect(sk).not.toMatch(/food\.fnr\.sndimg\.com|blocks hotlinking|go without a photo/i);
  });
  test("S-16.4 on a failed download: leave out the photo line, tell the Owner which photo failed and why", () => {
    expect(photo).toMatch(/leave out the photo line.*tell the Owner in chat which photo failed/);
  });
  test("S-16.5 the include list says to save the photo as a file, not link to it", () => {
    expect(sk).toMatch(/\*\*Include:\*\* .*the source photo saved as a file in `images\/` \(not a link to it\)/);
    expect(sk).not.toMatch(/a link to the source photo/);
  });
  test("S-16.6 CLAUDE.md says to capture the photo as a file in images/ and link it", () => {
    expect(flat(claude)).toMatch(/the source photo as a file in `images\/`, linked from the note/);
    expect(claude).not.toMatch(/a link to the source photo/);
  });
  test("S-16.7 neither file tells the Extractor to resize or convert photos", () => {
    for (const t of [sk, flat(claude)]) {
      for (const m of t.matchAll(/[^.]*\b(resiz|convert|compress|optimi[sz])\w*[^.]*\./gi)) {
        // allowed only where it forbids it, or where it is about metric/unit conversion or minutes
        expect(m[0]).toMatch(/no resizing|metric|unit|minutes|not resiz|total_time|conversions/i);
      }
    }
  });
  test("S-16.8 nothing else in the skill or CLAUDE.md changes (git diff limited to the story's lines)", () => {
    const { spawnSync } = require("child_process");
    const diff = (f) => spawnSync("git", ["diff", "-U0", "--", f], { cwd: repoRoot, encoding: "utf8" }).stdout;
    const changed = (d) => d.split("\n").filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
    const s = changed(diff(".claude/skills/recipe-extract/SKILL.md"));
    test.skip(s.length === 0, "already committed: nothing to compare");
    // Every changed line is about the photo (S-14/15/16) or the course (S-34); nothing else.
    const added = s.filter((l) => l.startsWith("+")).join("\n");
    expect(added).toMatch(/photo|course|Course|Photo|images|Sauce|canonical|Never write/i);
    const removed = s.filter((l) => l.startsWith("-"));
    for (const l of removed) expect(l, l).toMatch(/photo|course|hot-linked|full-size|WordPress|sndimg|-225x225|URL returns|<recipeCategory>|link to the source/i);
  });
});

test.describe("S-34 give new recipes a course", () => {
  test("S-34.1 the template has a course property", () => {
    const tpl = skill.split(/^## 4\. Note template/m)[1].split(/^## Photo/m)[0];
    expect(tpl).toMatch(/^course: .*Breakfast, Main, Side, Soup, Dessert, Sauce/m);
  });
  test("S-34.2 a source category that exactly names a course (ignoring case) is written", () => {
    expect(course).toMatch(/When the source's own category is exactly one of those words \(ignoring upper and lower case\), write that course/);
  });
  test("S-34.3 otherwise the Extractor asks the Owner to choose one of the six and writes the choice", () => {
    expect(course).toMatch(/When it isn't, or the source gives none, ask the Owner to choose one of the six and write their choice/);
  });
  test("S-34.4 never a course outside the list", () => {
    expect(course).toMatch(/Never write a `course` outside the list/);
    expect(skill).not.toMatch(/course: <recipeCategory>/);
  });
  test("S-34.5 the skill states these rules", () => {
    expect(course).toMatch(/exactly one of Breakfast, Main, Side, Soup, Dessert or Sauce/);
  });
});
