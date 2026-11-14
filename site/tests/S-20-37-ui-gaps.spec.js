// Extra UI checks: S-02.11, S-02.12, S-20.6, S-29.1, S-29.6, S-30.3, S-30.4, S-31.4. Fixture site on :8899, real site on :8888.
const { test, expect } = require("@playwright/test");

const FIX = "http://localhost:8899/";
const REAL = "http://localhost:8888/";
const search = (page) => page.getByRole("searchbox", { name: "Search recipes" });
const chip = (page, c) => page.locator("#chips .chip", { hasText: new RegExp(`^${c}$`) });
const names = (page) => page.locator("#grid .card:not([hidden]) .name").allInnerTexts();
const stub = (page) => page.addInitScript(() => {
  window.__wl = { req: 0, rel: 0 };
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request: async () => { window.__wl.req++; const s = { released: false, release: async () => { window.__wl.rel++; }, addEventListener() {} }; window.__wl.last = s; return s; } } });
});

test.describe("S-02.11 and S-02.12 no request to a server of the site's own", () => {
  test("S-02.11 chips, Sort by, search and tag selection send no request after the page has loaded", async ({ page }) => {
    await page.goto(FIX);
    await page.evaluate(() => document.fonts.ready);
    const after = [];
    page.on("request", (r) => { if (!["image", "font"].includes(r.resourceType())) after.push(r.resourceType() + " " + r.url()); }); // a lazy-loaded card photo is a published file, not a request for data
    await chip(page, "Main").tap();
    await page.getByLabel("Sort by").selectOption("site");
    await search(page).fill("pasta");
    await expect(page.locator("#grid .card:not([hidden])")).toHaveCount(1);
    await search(page).fill("");
    await page.locator("#grid a.tag", { hasText: /^zesty$/ }).first().tap();
    await expect(search(page)).toHaveValue(/zesty/i);
    expect(await names(page)).toEqual(["bravo pasta"]);
    expect(after).toEqual([]);
  });
  test("S-02.12 changing servings on a Recipe page sends no request", async ({ page }) => {
    await page.goto(FIX + "recipes/alpha-soup.html");
    await page.evaluate(() => document.fonts.ready);
    const after = [];
    page.on("request", (r) => { if (!["image", "font"].includes(r.resourceType())) after.push(r.resourceType() + " " + r.url()); }); // a lazy-loaded card photo is a published file, not a request for data
    for (const label of ["2", "8", "4"]) await page.getByRole("combobox", { name: "Servings" }).selectOption({ label });
    await expect(page.locator("#ing")).toContainText("1 cup");
    expect(after).toEqual([]);
  });
  test("S-02.12 the same on a real recipe, every option", async ({ page }) => {
    await page.goto(REAL + "recipes/french-toast.html");
    await page.evaluate(() => document.fonts.ready);
    const after = [];
    page.on("request", (r) => { if (!["image", "font"].includes(r.resourceType())) after.push(r.resourceType() + " " + r.url()); }); // a lazy-loaded card photo is a published file, not a request for data
    const sel = page.getByRole("combobox", { name: "Servings" });
    for (const o of await sel.locator("option").all()) await sel.selectOption({ label: (await o.textContent()).trim() });
    expect(after).toEqual([]);
  });
});

test("S-20.6 chip, search and Sort by combine: selected course, matching the text, in the chosen order", async ({ page }) => {
  await page.goto(FIX);
  await chip(page, "Main").tap();
  await search(page).fill("o");
  expect(await names(page)).toEqual(["bravo pasta", "Foxtrot Bare"]); // by name, case ignored
  await page.getByLabel("Sort by").selectOption("site");
  expect(await names(page)).toEqual(["Foxtrot Bare", "bravo pasta"]); // Another Site, salt site
  await search(page).fill("pasta");
  expect(await names(page)).toEqual(["bravo pasta"]);
  await expect(page.locator("#count")).toHaveText("1 recipe");
  await chip(page, "Dessert").tap();
  expect(await names(page)).toEqual([]);
});

test.describe("Cook mode extras", () => {
  test("S-29.1 Cook mode is there for every Visitor with no sign-in", async ({ page }) => {
    await page.goto(FIX + "recipes/alpha-soup.html");
    await expect(page.getByRole("button", { name: "Cook mode" })).toBeVisible();
    await expect(page.getByText(/sign in|log in/i)).toHaveCount(0);
  });
  for (const url of [FIX + "recipes/alpha-soup.html", REAL + "recipes/corn-fritters.html", REAL + "recipes/french-toast.html"]) {
    test(`S-29.6 larger steps on a phone: readable, no sideways scrolling (${url.split("/").pop()})`, async ({ page }) => {
      await page.goto(url);
      await page.locator("#cook").tap();
      await expect(page.locator("#cook")).toHaveText("Leave cook mode");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
      expect(await page.locator("ol.steps p").first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(18);
      const vw = page.viewportSize().width;
      for (const p of await page.locator("ol.steps p").all()) { const b = await p.boundingBox(); expect(b.x + b.width).toBeLessThanOrEqual(vw); }
    });
  }
  test("S-30.3 without screen-lock support, returning to the tab leaves the larger steps as they were", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined }));
    await page.goto(FIX + "recipes/alpha-soup.html");
    await page.locator("#cook").tap();
    const size = () => page.locator("ol.steps p").first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const before = await size();
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(await size()).toBe(before);
    await expect(page.locator("#cook")).toHaveText("Leave cook mode");
  });
  test("S-30.4 returning to the tab doesn't turn Cook mode off or change the label (on and off)", async ({ page }) => {
    await stub(page);
    await page.goto(FIX + "recipes/alpha-soup.html");
    const ret = () => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await ret();
    await expect(page.locator("#cook")).toHaveText("Cook mode");
    await expect(page.locator("body")).not.toHaveClass(/cook/);
    await page.locator("#cook").tap();
    await ret();
    await expect(page.locator("#cook")).toHaveText("Leave cook mode");
    await expect(page.locator("body")).toHaveClass(/cook/);
  });
  test("S-30.1 returning while Cook mode is on asks again (screen lock was released by the browser)", async ({ page }) => {
    await stub(page);
    await page.goto(FIX + "recipes/alpha-soup.html");
    await page.locator("#cook").tap();
    await page.evaluate(() => { window.__wl.last.released = true; document.dispatchEvent(new Event("visibilitychange")); });
    expect(await page.evaluate(() => window.__wl.req)).toBe(2);
  });
  test("S-31.4 leaving the page releases the screen-awake request", async ({ page }) => {
    await stub(page);
    await page.goto(FIX + "recipes/alpha-soup.html");
    await page.locator("#cook").tap();
    expect(await page.evaluate(() => window.__wl.req)).toBe(1);
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    expect(await page.evaluate(() => window.__wl.rel)).toBe(1);
    await page.getByRole("link", { name: "Back to all recipes" }).first().tap();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
  });
});
