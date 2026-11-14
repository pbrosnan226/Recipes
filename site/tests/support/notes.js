// Builders for fixture recipe notes (same format as the vault's notes).
const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function note({ fm = {}, tags = ["recipe"], body = "", noTags = false } = {}) {
  const props = { source: "https://example.com/r", created: "2026-11-07", ...fm };
  let y = "---\n";
  for (const [k, v] of Object.entries(props)) if (v !== null) y += `${k}: ${v}\n`;
  if (!noTags) y += "tags:\n" + tags.map((t) => `  - ${t}`).join("\n") + "\n";
  return y + "---\n" + body;
}

function scaleBlock(input) {
  return "```dataviewjs\nawait dv.view(\"scripts/scale\", " + JSON.stringify(input, null, 1) + ");\n```\n";
}

const simple = { base: 2, ingredients: [{ id: "a", name: "flour", text: "1 cup flour", q: 1, u: ["cup", "cups"] }], steps: ["Mix {a}."] };
const simpleBody = (extra = "") => `Servings: \`INPUT[inlineSelect(option(2), option(4)):servings_wanted]\` (the source makes 2)\n\n${scaleBlock(simple)}${extra}`;
const simpleNote = (opts = {}) => note({ body: simpleBody(), ...opts });

// The full-featured recipe used by the page tests.
const alphaInput = {
  base: 4,
  ingredients: [
    { id: "flour", name: "flour", text: "1 cup flour", q: 1, u: ["cup", "cups"], group: "Dough" },
    { id: "egg", name: "egg", text: "1 egg", q: 1, u: ["egg", "eggs"], group: "Dough" },
    { id: "oil", name: "oil", text: "3/4 tablespoon oil", q: 0.75, u: ["tablespoon", "tablespoons"] },
    { id: "water", name: "water", text: "Water, to taste", s: "to taste" },
    { id: "stock", name: "stock", text: "Up to 3 cups stock", q: 3, u: ["cup", "cups"], lead: "up to" },
    { id: "butter", name: "butter", text: "250g / 1 stick butter", q: 1, u: ["stick", "sticks"], pre: 250 },
    { id: "nuts", name: "nuts", text: "1-2 cups nuts", q: [1, 2], u: ["cup", "cups"] },
    { id: "third", name: "milk", text: "1/3 cup milk", q: 0.3333, u: ["cup", "cups"] },
    { id: "salt2", name: "salt portion", text: "1 teaspoon of the salt", q: 1, u: ["teaspoon", "teaspoons"], hidden: true },
  ],
  steps: ["Mix {flour} with {egg} and {third}.", "Bake 20 minutes at 350°F, then add {salt2} and {oil}.", "Serve with {water}, {stock}, {butter} and {nuts}."],
};
const alphaBody = `A hearty fixture soup.

![Alpha Soup](images/Alpha%20Soup.gif)

Servings: \`INPUT[inlineSelect(option(2), option(4), option(8)):servings_wanted]\` (the source makes 4)

${scaleBlock(alphaInput)}
## Notes

- First **author** note
  - a sub point
- Second note

## Nutrition

Per serving:

| Calories | Carbs |
| -------- | ----- |
| 706 | 81g |
`;

const batchInput = { base: 1, noun: "batches", nounOne: "batch", ingredients: [{ id: "d", name: "dough", text: "1 ball dough", q: 1, u: ["ball", "balls"] }], steps: ["Bake {d}."] };
const batchBody = `Batches: \`INPUT[inlineSelect(option(1), option(2), option(3)):servings_wanted]\`\n\n${scaleBlock(batchInput)}`;

// A set of notes for the list tests. name -> content.
const listFixtures = {
  "Alpha Soup": note({
    fm: { course: "Soup", site: "Serious Eats", author: "A. Cook", prep_time: "10 mins", cook_time: "20 mins", total_time: "30 mins" },
    tags: ["recipe", "soup", "Quick"],
    body: alphaBody,
  }),
  "bravo pasta": note({ fm: { course: "Main", site: "salt site" }, tags: ["recipe", "pasta", "zesty"], body: simpleBody() }),
  "Charlie Cookies": note({ fm: { course: "Dessert", site: "Baking Blog", prep_time: "5 mins" }, tags: ["recipe", "dessert"], body: batchBody }),
  "Delta Plain": note({ tags: ["recipe"], body: simpleBody() }),
  "echo Rice": note({ fm: { course: "Side", site: "Zed Kitchen" }, tags: ["recipe", "Dinner", "rice"], body: simpleBody() }),
  "Foxtrot Bare": note({ fm: { course: "Main", site: "Another Site" }, tags: ["recipe", "dinner"], body: simpleBody() }),
  "Not A Recipe": note({ tags: ["notes"], body: "just a note" }),
};

const GIF_BYTES = Buffer.from(GIF.split(",")[1], "base64");

module.exports = { GIF_BYTES, note, scaleBlock, simple, simpleBody, simpleNote, alphaInput, batchInput, listFixtures, GIF };
