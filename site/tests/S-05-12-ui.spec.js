// S-05 to S-12, S-20, S-29 to S-31, S-37: the Home and Recipe pages, in WebKit on iPhone 17.
// FIX = fixture site (controlled notes, port 8899). REAL = the vault's own build (port 8888).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { alphaInput, batchInput } = require("./support/notes");
const { oracle } = require("./support/oracle");

const FIX = "http://localhost:8899/";
const REAL = "http://localhost:8888/";
const realCount = fs.readdirSync(path.resolve(__dirname, "..", "dist", "recipes")).length;

const names = (page) => page.locator("#grid .card:not([hidden]) .name").allInnerTexts();
const search = (page) => page.getByRole("searchbox", { name: "Search recipes" });
const sortSel = (page) => page.getByLabel("Sort by");
const chip = (page, c) => page.locator("#chips .chip", { hasText: new RegExp(`^${c}$`) });
const DEFAULT = ["Alpha Soup", "bravo pasta", "Charlie Cookies", "Delta Plain", "echo Rice", "Foxtrot Bare"];
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };

test.describe("S-05 see the recipe list", () => {
  test("S-05.1 and S-05.13 title, search box, chips, Sort by, count, cards and header", async ({ page }) => {
    await page.goto(FIX);
    await expect(page.getByRole("heading", { level: 1, name: "Everything we cook." })).toBeVisible();
    await expect(search(page)).toBeVisible();
    await expect(page.locator("#chips .chip")).toHaveCount(7);
    await expect(sortSel(page)).toBeVisible();
    await expect(page.locator("#count")).toHaveText("6 recipes");
    await expect(page.locator("header .logo")).toHaveText("Recipes");
    await expect(page.locator("header nav a")).toHaveText(["Browse"]);
    await expect(page.locator("header").getByText(/Sign in|Sign out|Favorites/)).toHaveCount(0);
  });
  test("S-05.2 one card per recipe", async ({ page }) => {
    await page.goto(FIX);
    await expect(page.locator("#grid .card")).toHaveCount(6);
    await page.goto(REAL);
    await expect(page.locator("#grid .card")).toHaveCount(realCount);
  });
  test("S-05.3 starts sorted by name A to Z, All selected, Name chosen, search empty", async ({ page }) => {
    await page.goto(FIX);
    expect(await names(page)).toEqual(DEFAULT);
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expect(sortSel(page)).toHaveValue("name");
    await expect(search(page)).toHaveValue("");
  });
  test("S-05.4 to S-05.6 card shows photo, course, name and every tag; photo and name open the recipe", async ({ page }) => {
    await page.goto(FIX);
    const card = page.locator("#grid .card", { hasText: "Alpha Soup" });
    await expect(card.locator("img")).toHaveAttribute("src", "images/Alpha%20Soup.gif");
    expect(await card.locator("img").evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(card.locator(".eyebrow")).toHaveText("Soup");
    expect(await card.locator("a.tag").allInnerTexts()).toEqual(["recipe", "soup", "Quick"]);
    await expect(card.locator("a.name")).toHaveAttribute("href", "recipes/alpha-soup.html");
    await card.locator("a.name").tap();
    await expect(page).toHaveURL(/recipes\/alpha-soup\.html$/);
    await page.goBack();
    await page.locator("#grid .card", { hasText: "Alpha Soup" }).locator("a.photo").tap();
    await expect(page).toHaveURL(/recipes\/alpha-soup\.html$/);
  });
  test("S-05.11 a recipe with no photo shows a plain tinted box; no course shows no label", async ({ page }) => {
    await page.goto(FIX);
    const card = page.locator("#grid .card", { hasText: "Delta Plain" });
    await expect(card.locator("img")).toHaveCount(0);
    await expect(card.locator("a.photo")).toBeVisible();
    await expect(card.locator(".eyebrow")).toHaveCount(0);
  });
  test("S-05.12 the count reads N recipes or 1 recipe", async ({ page }) => {
    await page.goto(FIX);
    await search(page).fill("soup");
    await expect(page.locator("#count")).toHaveText("1 recipe");
  });
  for (const [label, url] of [["fixture", FIX], ["real", REAL]]) {
    test(`S-05.9 phone screen: no sideways scrolling, usable without zooming (${label})`, async ({ page }) => {
      await page.goto(url);
      const vw = page.viewportSize().width;
      expect(vw).toBeLessThan(500);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
      expect(await search(page).evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      const sb = await search(page).boundingBox();
      expect(sb.x + sb.width).toBeLessThanOrEqual(vw);
      expect(sb.height).toBeGreaterThanOrEqual(36);
      for (const sel of ["#chips .chip", "#sort", ".card .name"]) {
        const b = await page.locator(sel).first().boundingBox();
        expect(b.x + b.width, sel).toBeLessThanOrEqual(vw + 1);
      }
    });
  }
  for (const [label, url] of [["list", FIX], ["real list", REAL]]) {
    test(`S-05.10 light and dark colours and fonts (${label})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(url);
      const col = () => page.evaluate(() => ({
        bg: getComputedStyle(document.body).backgroundColor,
        tag: getComputedStyle(document.querySelector("a.tag")).color,
        h1: getComputedStyle(document.querySelector("h1")).fontFamily,
        body: getComputedStyle(document.body).fontFamily,
      }));
      let c = await col();
      expect(c.bg).toBe(rgb("#f7f6ee"));
      expect(c.tag).toBe(rgb("#3f6b4f"));
      expect(c.h1).toMatch(/Fraunces/);
      expect(c.body).toMatch(/Inter/);
      await page.emulateMedia({ colorScheme: "dark" });
      c = await col();
      expect(c.bg).toBe(rgb("#141a16"));
      expect(c.tag).toBe(rgb("#8dbe9d"));
    });
  }
  test("S-05.10 fonts are files of the site, none from another site", async ({ page }) => {
    const hosts = new Set();
    page.on("request", (r) => hosts.add(new URL(r.url()).host));
    await page.goto(REAL);
    await page.evaluate(() => document.fonts.ready);
    expect([...hosts]).toEqual(["localhost:8888"]);
    expect(await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")))).toEqual(expect.arrayContaining(["Fraunces", "Inter"]));
  });
});

test.describe("S-06 sort the list", () => {
  test("S-06.1, S-06.4, S-06.5, S-06.8 Sort by Name or Site; no site last; ties by name; ignores case", async ({ page }) => {
    await page.goto(FIX);
    expect(await sortSel(page).locator("option").allTextContents()).toEqual(["Name", "Site"]);
    await sortSel(page).selectOption("site");
    // Another Site, Baking Blog, salt site, Serious Eats, Zed Kitchen, (no site)
    expect(await names(page)).toEqual(["Foxtrot Bare", "Charlie Cookies", "bravo pasta", "Alpha Soup", "echo Rice", "Delta Plain"]);
  });
  test("S-06.6 no other sort choice, and no author or time on cards", async ({ page }) => {
    await page.goto(FIX);
    expect(await sortSel(page).locator("option").count()).toBe(2);
    await expect(page.locator("#grid")).not.toContainText(/A\. Cook|10 mins/);
  });
  test("S-06.7 search and chip keep the sort", async ({ page }) => {
    await page.goto(FIX);
    await sortSel(page).selectOption("site");
    await search(page).fill("dinner");
    expect(await names(page)).toEqual(["Foxtrot Bare", "echo Rice"]);
    await chip(page, "Main").tap();
    expect(await names(page)).toEqual(["Foxtrot Bare"]);
    await expect(sortSel(page)).toHaveValue("site");
  });
});

test.describe("S-07 search", () => {
  test("S-07.1 and S-07.2 typing updates the cards with no button, on name, site or tags", async ({ page }) => {
    await page.goto(FIX);
    await search(page).pressSequentially("past");
    await expect(search(page)).toHaveValue("past");
    expect(await names(page)).toEqual(["bravo pasta"]);
    await search(page).fill("baking");
    expect(await names(page)).toEqual(["Charlie Cookies"]);
    await search(page).fill("zesty");
    expect(await names(page)).toEqual(["bravo pasta"]);
  });
  test("S-07.3 ignores case", async ({ page }) => {
    await page.goto(FIX);
    await search(page).fill("SERIOUS eats");
    expect(await names(page)).toEqual(["Alpha Soup"]);
  });
  test("S-07.4 and S-07.5 empty or cleared search shows what the chip allows", async ({ page }) => {
    await page.goto(FIX);
    await search(page).fill("soup");
    expect(await names(page)).toHaveLength(1);
    await search(page).fill("");
    expect(await names(page)).toEqual(DEFAULT);
    await chip(page, "Main").tap();
    await search(page).fill("zesty");
    await search(page).fill("");
    expect(await names(page)).toEqual(["bravo pasta", "Foxtrot Bare"]);
  });
  test("S-07.6 and S-07.7 the empty message shows only when nothing matches", async ({ page }) => {
    await page.goto(FIX);
    const msg = page.getByText("Nothing matches that. Try another word.");
    await expect(msg).toBeHidden();
    await search(page).fill("zzzzqq");
    await expect(msg).toBeVisible();
    expect(await names(page)).toEqual([]);
    await search(page).fill("soup");
    await expect(msg).toBeHidden();
  });
  test("S-07.9 and S-07.10 search combines with the chip and the count follows", async ({ page }) => {
    await page.goto(FIX);
    await chip(page, "Main").tap();
    await search(page).fill("dinner");
    expect(await names(page)).toEqual(["Foxtrot Bare"]);
    await expect(page.locator("#count")).toHaveText("1 recipe");
  });
});

test.describe("S-08 filter by tag", () => {
  test("S-08.1 to S-08.3 and S-08.5 selecting a tag fills the search box, filters, stays on the page, keeps chip and sort", async ({ page }) => {
    await page.goto(FIX);
    await sortSel(page).selectOption("site");
    await page.evaluate(() => (window.__marker = 1));
    await page.locator("#grid").getByRole("link", { name: "soup", exact: true }).tap();
    await expect(search(page)).toHaveValue("soup");
    expect(await names(page)).toEqual(["Alpha Soup"]);
    expect(await page.evaluate(() => window.__marker)).toBe(1);
    await expect(page).toHaveURL(FIX);
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expect(sortSel(page)).toHaveValue("site");
  });
  test("S-08.2 a tag matches other recipes too (dinner, any case)", async ({ page }) => {
    await page.goto(FIX);
    await page.locator("#grid").getByRole("link", { name: "dinner", exact: true }).first().tap();
    expect(await names(page)).toEqual(["echo Rice", "Foxtrot Bare"]);
  });
  test("S-08.4 then edit or clear the box as in S-07", async ({ page }) => {
    await page.goto(FIX);
    await page.locator("#grid").getByRole("link", { name: "recipe", exact: true }).first().tap();
    await search(page).fill("rice");
    expect(await names(page)).toEqual(["echo Rice"]);
    await search(page).fill("");
    expect(await names(page)).toEqual(DEFAULT);
  });
});

test.describe("S-20 filter by course", () => {
  test("S-20.1 chips in order, All selected", async ({ page }) => {
    await page.goto(FIX);
    expect(await page.locator("#chips .chip").allInnerTexts()).toEqual(["All", "Breakfast", "Main", "Side", "Soup", "Dessert", "Sauce"]);
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
  });
  test("S-20.2 to S-20.5 a chip shows only its course, one at a time; All shows all; no course only under All", async ({ page }) => {
    await page.goto(FIX);
    await page.evaluate(() => (window.__marker = 1));
    await chip(page, "Main").tap();
    expect(await names(page)).toEqual(["bravo pasta", "Foxtrot Bare"]);
    await expect(page.locator("#chips .chip[aria-pressed=true]")).toHaveCount(1);
    await expect(chip(page, "Main")).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => window.__marker)).toBe(1);
    await chip(page, "All").tap();
    expect(await names(page)).toEqual(DEFAULT);
    for (const c of ["Breakfast", "Side", "Soup", "Dessert"]) {
      await chip(page, c).tap();
      expect(await names(page)).not.toContain("Delta Plain");
    }
  });
  test("S-20.7 and S-20.8 a course with no recipe shows the empty message and a count of 0", async ({ page }) => {
    await page.goto(FIX);
    await chip(page, "Sauce").tap();
    await expect(page.getByText("Nothing matches that. Try another word.")).toBeVisible();
    await expect(page.locator("#count")).toHaveText("0 recipes");
  });
  test("S-20.9 selecting a chip doesn't change the search box", async ({ page }) => {
    await page.goto(FIX);
    await search(page).fill("o");
    await chip(page, "Main").tap();
    await expect(search(page)).toHaveValue("o");
  });
});

const hrefOf = (slug) => FIX + "recipes/" + slug + ".html";
const ingRows = (page) => page.locator("#ing li:not(.sub)").allInnerTexts();
// Row text: amount alone when it already ends with the name's last word (optional s/es); "Name, for ..." for "for " amounts.
const rowText = (name, amount) => {
  const last = name.split(/\s+/).pop().toLowerCase();
  if (new RegExp(`^${last.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(e?s)?$`).test(amount.split(/\s+/).pop().toLowerCase())) return amount;
  if (/^for\s/i.test(amount)) return `${name.charAt(0).toUpperCase()}${name.slice(1)}, ${amount}`;
  return `${amount} ${name}`;
};
const expectedRows = (o) => o.tables.flatMap((t) => t.rows.map((r) => rowText(r[0], r[2])));

test.describe("S-09 view a recipe", () => {
  test("S-09.1 and S-09.21 name as the heading, course above it", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alpha Soup");
    await expect(page.locator(".hero .eyebrow")).toHaveText("Soup");
    await page.goto(hrefOf("delta-plain"));
    await expect(page.locator(".hero .eyebrow")).toHaveCount(0);
  });
  test("S-09.2 photo from the site's own copy when present, none when absent", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    const img = page.locator(".hero .photo img");
    await expect(img).toHaveAttribute("src", "../images/Alpha%20Soup.gif");
    expect(await img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    await page.goto(hrefOf("delta-plain"));
    await expect(page.locator("img")).toHaveCount(0);
  });
  test("S-09.3 description", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.getByText("A hearty fixture soup.")).toBeVisible();
    await page.goto(hrefOf("delta-plain"));
    await expect(page.locator(".lead")).toHaveCount(0);
  });
  test("S-09.4 every tag, in order", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    expect(await page.locator(".rtags a.tag").allInnerTexts()).toEqual(["recipe", "soup", "Quick"]);
  });
  test("S-09.5 and S-09.23 times and servings together in the header block", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    expect(await page.locator(".facts .fact").allInnerTexts()).toEqual(["PREP\n10 mins", "COOK\n20 mins", "TOTAL\n30 mins", expect.stringContaining("SERVINGS")]);
  });
  test("S-09.6 empty time left out; whole times row left out when all empty", async ({ page }) => {
    await page.goto(hrefOf("charlie-cookies"));
    expect(await page.locator(".fact .label").allTextContents()).toEqual(["Prep", "Batches"]);
    await page.goto(hrefOf("delta-plain"));
    expect(await page.locator(".fact .label").allTextContents()).toEqual(["Servings"]);
  });
  test("S-09.7 and S-09.8 servings dropdown with the note's options, set to what the source makes", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    const sv = page.getByRole("combobox", { name: "Servings" });
    expect(await sv.locator("option").allTextContents()).toEqual(["2", "4", "8"]);
    expect(await sv.evaluate((s) => s.selectedOptions[0].textContent)).toBe("4");
    await expect(page.getByText("(the source makes 4)")).toBeVisible();
    await page.goto(hrefOf("charlie-cookies"));
    await expect(page.getByText("the source makes")).toHaveCount(0);
  });
  test("S-09.9 to S-09.12 ingredient list: scaled amount and name, checkbox per row, sub-headings without one, hidden left out", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    expect(await ingRows(page)).toEqual(expectedRows(oracle(alphaInput, 4)));
    await expect(page.locator("#ing li:not(.sub) input[type=checkbox]")).toHaveCount(8);
    await expect(page.locator("#ing li.sub")).toHaveText(["Dough"]);
    await expect(page.locator("#ing li.sub input")).toHaveCount(0);
    const kinds = await page.locator("#ing li").evaluateAll((l) => l.map((x) => (x.classList.contains("sub") ? "sub" : "row")));
    expect(kinds.slice(0, 3)).toEqual(["sub", "row", "row"]);
    await expect(page.locator("#ing")).not.toContainText("salt portion");
  });
  test("S-09.14 steps are in order, numbered, with keys replaced by amounts", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.getByRole("heading", { name: "Method" })).toBeVisible();
    expect(await page.locator("ol.steps li p").allInnerTexts()).toEqual(oracle(alphaInput, 4).steps);
    expect(await page.locator("ol.steps .n").allInnerTexts()).toEqual(["1", "2", "3"]);
    await expect(page.locator("#steps")).not.toContainText("{");
  });
  test("S-09.15 notes in order; omitted when none", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
    const top = page.locator(".notes > ul > li");
    await expect(top).toHaveCount(2);
    await expect(top.nth(0).locator("strong")).toHaveText("author");
    await expect(top.nth(0).locator("ul li")).toHaveText("a sub point");
    await page.goto(hrefOf("delta-plain"));
    await expect(page.getByRole("heading", { name: "Notes" })).toHaveCount(0);
  });
  test("S-09.16 nutrition is collapsible and closed; basis and amounts as written; omitted when none", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    const d = page.locator("details.nutr");
    expect(await d.evaluate((e) => e.open)).toBe(false);
    await d.locator("summary").tap();
    expect(await d.evaluate((e) => e.open)).toBe(true);
    await expect(page.getByText("Per serving:")).toBeVisible();
    expect(await d.locator(".vals span").allInnerTexts()).toEqual(["Calories 706", "Carbs 81g"]);
    await page.goto(hrefOf("delta-plain"));
    await expect(page.locator("details.nutr")).toHaveCount(0);
  });
  test("S-09.17 source link: Original recipe at <site>, by <author>; URL without site; no by without author", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.locator("a.srclink")).toHaveText(/Original recipe at Serious Eats, by A\. Cook/);
    await expect(page.locator("a.srclink")).toHaveAttribute("href", "https://example.com/r");
    await page.goto(hrefOf("bravo-pasta"));
    await expect(page.locator("a.srclink")).toHaveText(/^Original recipe at salt site(?!, by)/);
    await page.goto(hrefOf("delta-plain"));
    await expect(page.locator("a.srclink")).toHaveText(/Original recipe at https:\/\/example.com\/r/);
  });
  test("S-09.18 and S-12.3 Back to all recipes at the top only; a bare recipe omits the optional parts", async ({ page }) => {
    await page.goto(hrefOf("delta-plain"));
    await expect(page.getByRole("link", { name: /Back to all recipes/ })).toHaveCount(1);
    await expect(page.locator("img, .lead, .notes, details.nutr, .eyebrow")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Ingredients", "Method"]);
    expect(await page.getByRole("link", { name: /Back to all recipes/ }).evaluate((a) => a.getBoundingClientRect().top)).toBeLessThan(200);
  });
  test("S-09.22 Cook mode button and no Favorite button", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await expect(page.getByRole("button", { name: "Cook mode" })).toBeVisible();
    await expect(page.getByText(/Favorite/)).toHaveCount(0);
  });
  for (const [label, url] of [["fixture full recipe", hrefOf("alpha-soup")], ["real French Toast", REAL + "recipes/french-toast.html"], ["real Corn Fritters (batches, groups)", REAL + "recipes/corn-fritters.html"]]) {
    test(`S-09.19 phone screen: one column, readable, no sideways scrolling (${label})`, async ({ page }) => {
      await page.goto(url);
      const vw = page.viewportSize().width;
      const o = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - window.innerWidth,
        sv: parseFloat(getComputedStyle(document.getElementById("sv")).fontSize),
        gap: document.querySelector(".method").getBoundingClientRect().top - document.querySelector(".ings").getBoundingClientRect().bottom,
      }));
      expect(o.doc).toBeLessThanOrEqual(0);
      expect(o.sv).toBeGreaterThanOrEqual(16);
      expect(o.gap).toBeGreaterThanOrEqual(0); // method below the ingredients: one column
      const sel = await page.locator("#sv").boundingBox();
      expect(sel.x + sel.width).toBeLessThanOrEqual(vw);
      await page.screenshot({ path: path.resolve(__dirname, "..", "test-results", `phone-${label.replace(/\W+/g, "-")}.png`), fullPage: true });
    });
  }
  for (const [label, url] of [["fixture", hrefOf("alpha-soup")], ["real", REAL + "recipes/french-toast.html"]]) {
    test(`S-09.20 light and dark colours and fonts (${label})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(url);
      const col = () => page.evaluate(() => ({
        bg: getComputedStyle(document.body).backgroundColor,
        link: getComputedStyle(document.querySelector("a.srclink")).color,
        h1: getComputedStyle(document.querySelector("h1")).fontFamily,
        body: getComputedStyle(document.body).fontFamily,
      }));
      let c = await col();
      expect(c.bg).toBe(rgb("#f7f6ee"));
      expect(c.link).toBe(rgb("#3f6b4f"));
      expect(c.h1).toMatch(/Fraunces/);
      expect(c.body).toMatch(/Inter/);
      await page.emulateMedia({ colorScheme: "dark" });
      c = await col();
      expect(c.bg).toBe(rgb("#141a16"));
      expect(c.link).toBe(rgb("#8dbe9d"));
    });
  }
});

test.describe("S-10 change the servings", () => {
  const sv = (page) => page.getByRole("combobox", { name: "Servings" });
  test("S-10.1 any option can be chosen", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    for (const o of ["2", "8", "4"]) {
      await sv(page).selectOption({ label: o });
      expect(await sv(page).evaluate((s) => s.selectedOptions[0].textContent)).toBe(o);
    }
  });
  test("S-10.2 choosing rescales the ingredients and the steps in place", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await page.evaluate(() => (window.__marker = 1));
    await sv(page).selectOption({ label: "8" });
    await expect(page.locator("#ing li:not(.sub)").first()).toContainText("2 cups flour");
    await expect(page.locator("ol.steps li p").first()).toContainText("Mix 2 cups with 2 eggs");
    expect(await page.evaluate(() => window.__marker)).toBe(1);
    await page.goto(REAL + "recipes/french-toast.html");
    await page.getByRole("combobox", { name: "Servings" }).selectOption({ label: "12" });
    await expect(page.locator("#ing")).toContainText("18 large eggs");
    await expect(page.locator("#steps")).toContainText("eggs (18 large eggs)");
  });
  test("S-09 ingredient rows don't repeat the name and put 'for serving' after it (French Toast)", async ({ page }) => {
    await page.goto(REAL + "recipes/french-toast.html");
    const rows = await page.locator("#ing li:not(.sub)").allInnerTexts();
    expect(rows.map((t) => t.trim())).toContain("6 large eggs");
    expect(rows.map((t) => t.trim())).toContain("Maple syrup, for serving");
    expect(rows.join("\n")).not.toMatch(/eggs eggs|for serving maple syrup/i);
    await page.getByRole("combobox", { name: "Servings" }).selectOption({ label: "12" });
    const after = (await page.locator("#ing li:not(.sub)").allInnerTexts()).map((t) => t.trim());
    expect(after).toContain("18 large eggs");
    expect(after).toContain("Maple syrup, for serving");
  });
  test("S-09 a multi-word name that only shares the last word with the amount keeps its name (Apple Pie)", async ({ page }) => {
    await page.goto(REAL + "recipes/apple-pie.html");
    const rows = (await page.locator("#ing li:not(.sub)").allInnerTexts()).map((x) => x.trim());
    expect(rows.some((x) => /Homemade Pie Crust or All Butter Pie Crust/i.test(x) && /2 pie crusts/i.test(x))).toBe(true);
    await page.goto(REAL + "recipes/pumpkin-pie.html");
    expect((await page.locator("#ing li:not(.sub)").allInnerTexts()).map((x) => x.trim())).toContain("3 large eggs");
  });
  test("S-10.3 to S-10.5 amounts are identical to scripts/scale/view.js at every option", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    for (const [i, want] of [[0, 2], [1, 4], [2, 8]]) {
      await sv(page).selectOption({ index: i });
      const o = oracle(alphaInput, want);
      expect(await ingRows(page)).toEqual(expectedRows(o));
      expect(await page.locator("ol.steps li p").allInnerTexts()).toEqual(o.steps);
    }
    await sv(page).selectOption({ label: "2" });
    const txt = await page.locator("#ing").innerText();
    for (const t of ["up to 1 ½ cups", "125g / ½ stick", "½–1 cup", "⅙ cup", "to taste"]) expect(txt).toContain(t);
  });
  test("S-10.6 nutrition doesn't change", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    const before = await page.locator(".nutr .vals").innerText();
    await sv(page).selectOption({ label: "8" });
    expect(await page.locator(".nutr .vals").innerText()).toBe(before);
  });
  test("S-10.7 step text that isn't a key doesn't change", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    for (const o of ["2", "8"]) {
      await sv(page).selectOption({ label: o });
      await expect(page.locator("ol.steps li p").nth(1)).toContainText("Bake 20 minutes at 350°F, then add");
    }
  });
  test("S-10.8 batches dropdown rescales the same way", async ({ page }) => {
    await page.goto(hrefOf("charlie-cookies"));
    const b = page.getByRole("combobox", { name: "Batches" });
    expect(await b.locator("option").allTextContents()).toEqual(["1", "2", "3"]);
    await b.selectOption({ label: "3" });
    const o = oracle(batchInput, 3);
    expect(await ingRows(page)).toEqual(expectedRows(o));
    expect(await page.locator("ol.steps li p").allInnerTexts()).toEqual(o.steps);
  });
  test("S-10.9 starts at the source's value on every load; choice isn't remembered", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await sv(page).selectOption({ label: "8" });
    await page.reload();
    expect(await sv(page).evaluate((s) => s.selectedOptions[0].textContent)).toBe("4");
    await sv(page).selectOption({ label: "8" });
    await page.getByRole("link", { name: /Back to all recipes/ }).tap();
    await expect(page).toHaveURL(/index\.html$/);
    await page.goBack();
    expect(await sv(page).evaluate((s) => s.selectedOptions[0].textContent)).toBe("4");
  });
});

test.describe("S-37 tick off an ingredient", () => {
  test("S-37.1 to S-37.7 ticks strike through, aren't remembered, and stay when servings change", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    const boxes = page.locator("#ing li:not(.sub) input");
    for (const b of await boxes.all()) await expect(b).not.toBeChecked();
    const steps = await page.locator("#steps").innerText();
    const decoration = () => page.locator("#ing li:not(.sub)").first().locator("span").evaluate((e) => getComputedStyle(e).textDecorationLine);
    await boxes.first().check();
    expect(await decoration()).toBe("line-through");
    expect(await page.locator("#steps").innerText()).toBe(steps);
    await page.getByRole("combobox", { name: "Servings" }).selectOption({ label: "8" });
    await expect(boxes.first()).toBeChecked();
    await boxes.first().uncheck();
    expect(await decoration()).toBe("none");
    await boxes.nth(1).check();
    await page.reload();
    await expect(boxes.nth(1)).not.toBeChecked();
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length)).toBe(0);
  });
});

test.describe("S-29 to S-31 Cook mode", () => {
  const stub = (page) => page.addInitScript(() => {
    window.__wl = { req: 0, rel: 0 };
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: async () => { window.__wl.req++; const s = { released: false, release: async () => { window.__wl.rel++; }, addEventListener() {} }; window.__wl.last = s; return s; } },
    });
  });
  const stepSize = (page) => page.locator("ol.steps p").first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  test("S-29 and S-31 on: larger steps, Leave cook mode, wake lock; off: normal, released; on again", async ({ page }) => {
    await stub(page);
    await page.goto(hrefOf("alpha-soup"));
    const btn = page.locator("#cook");
    const normal = await stepSize(page);
    await btn.tap();
    await expect(btn).toHaveText("Leave cook mode");
    expect(await stepSize(page)).toBeGreaterThan(normal);
    expect(await page.evaluate(() => window.__wl.req)).toBe(1);
    await btn.tap();
    await expect(btn).toHaveText("Cook mode");
    expect(await stepSize(page)).toBe(normal);
    expect(await page.evaluate(() => window.__wl.rel)).toBe(1);
    await btn.tap();
    await expect(btn).toHaveText("Leave cook mode");
    await page.reload();
    await expect(page.locator("#cook")).toHaveText("Cook mode"); // S-29.7: not remembered
  });
  test("S-29.5 without screen-lock support Cook mode still turns on", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined }));
    await page.goto(hrefOf("alpha-soup"));
    await page.locator("#cook").tap();
    await expect(page.locator("#cook")).toHaveText("Leave cook mode");
    await expect(page.locator("body")).toHaveClass(/cook/);
  });
  test("S-30 the screen lock is requested again when the tab returns, only while Cook mode is on", async ({ page }) => {
    await stub(page);
    await page.goto(hrefOf("alpha-soup"));
    const show = () => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await show();
    expect(await page.evaluate(() => window.__wl.req)).toBe(0);
    await page.locator("#cook").tap();
    await page.evaluate(() => { window.__wl.last.released = true; }); // the browser released it while the tab was hidden
    await show();
    expect(await page.evaluate(() => window.__wl.req)).toBe(2);
    await expect(page.locator("#cook")).toHaveText("Leave cook mode");
  });
});

test.describe("S-11 open the list from a recipe's tag", () => {
  test("S-11.1 to S-11.4 tags open the filtered list, All chip, sorted by name", async ({ page }) => {
    await page.goto(hrefOf("echo-rice"));
    const tag = page.locator(".rtags").getByRole("link", { name: "Dinner", exact: true });
    await expect(tag).toBeVisible();
    await tag.tap();
    await expect(page).toHaveURL(/index\.html\?q=Dinner$/);
    await expect(page.getByRole("heading", { level: 1, name: "Everything we cook." })).toBeVisible();
    await expect(search(page)).toHaveValue("Dinner");
    expect(await names(page)).toEqual(["echo Rice", "Foxtrot Bare"]);
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expect(sortSel(page)).toHaveValue("name");
  });
  test("S-11.2 the recipe tag lists every recipe", async ({ page }) => {
    await page.goto(hrefOf("alpha-soup"));
    await page.locator(".rtags").getByRole("link", { name: "recipe", exact: true }).tap();
    await expect(search(page)).toHaveValue("recipe");
    expect(await names(page)).toEqual(DEFAULT);
  });
});

test.describe("S-12 source link and back", () => {
  test("S-12.1 the source link opens the original page", async ({ page }) => {
    await page.route("https://example.com/**", (r) => r.fulfill({ contentType: "text/html", body: "<title>original</title>original page" }));
    await page.goto(hrefOf("alpha-soup"));
    await page.locator("a.srclink").tap();
    await expect(page).toHaveURL("https://example.com/r");
    await expect(page.getByText("original page")).toBeVisible();
  });
  test("S-12.2 Back to all recipes opens the full default list with an empty search", async ({ page }) => {
    await page.goto(FIX + "index.html?q=soup");
    await page.getByRole("link", { name: "Alpha Soup" }).first().tap();
    await page.getByRole("link", { name: /Back to all recipes/ }).tap();
    await expect(page).toHaveURL(/index\.html$/);
    await expect(search(page)).toHaveValue("");
    expect(await names(page)).toEqual(DEFAULT);
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expect(sortSel(page)).toHaveValue("name");
  });
  test("S-09.bold steps render bold as <strong>, never literal **, at default and after changing servings", async ({ page }) => {
    await page.goto(REAL + "recipes/corn-fritters.html");
    const check = async () => {
      await expect(page.locator("li strong").first()).toBeVisible();
      expect(await page.locator("li").allInnerTexts().then((t) => t.join("\n"))).not.toContain("**");
      await expect(page.locator("li strong", { hasText: "Herb sour cream:" })).toBeVisible();
    };
    await check();
    await page.getByRole("combobox", { name: "Makes" }).selectOption({ label: "30" });
    await check();
  });
});
