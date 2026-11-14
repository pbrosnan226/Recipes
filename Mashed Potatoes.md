---
source: https://www.seriouseats.com/rich-and-creamy-mashed-potatoes-recipe
site: "Serious Eats"
author: J. Kenji López-Alt
aliases:
  - Pommes Purée (Rich and Creamy Mashed Potatoes)
created: 2026-11-12
course: Side
servings: 4
servings_wanted: 4
prep_time: 15 mins
cook_time: 30 mins
total_time: 50 mins
total_minutes: 50
tags:
  - recipe
---

Ultra-creamy French-style mashed potatoes made with Yukon Golds, hot cream and melted butter.

![Pommes purée](images/Mashed%20Potatoes.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8)):servings_wanted]` (the source makes 4 to 5)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "potatoes", name: "Skin-on Yukon Gold potatoes, scrubbed", text: "2 pounds (900 g) skin-on Yukon Gold potatoes, scrubbed", q: 2, u: ["pound", "pounds"] },
    { id: "butter", name: "Unsalted butter, cut into 1-tablespoon pieces", text: "8 tablespoons unsalted butter (1 stick; 115 g), cut into 1-tablespoon pieces", q: 8, u: ["tablespoon", "tablespoons"] },
    { id: "cream", name: "Heavy cream, plus more as needed", text: "1 1/2 cups (355 ml) heavy cream, plus more as needed", q: 1.5, u: ["cup", "cups"] },
    { id: "stock", name: "Homemade chicken stock or low-sodium broth (optional)", text: "Up to 1/2 cup (120 ml) homemade chicken stock or low-sodium broth (optional)", lead: "up to", q: 0.5, u: ["cup", "cups"] },
    { id: "saltpepper", name: "Kosher salt and freshly ground black pepper", text: "Kosher salt and freshly ground black pepper", s: "as written" },
  ],
  steps: [
    "In a large pot, cover the potatoes ({potatoes}) with cold water. Bring to a boil over high heat, then reduce to a simmer. Cook until the potatoes are tender and offer no resistance when poked with a paring knife. Drain and let stand until cool enough to handle.",
    "Carefully peel the potatoes, putting them in a large bowl as you go.",
    "Pass the potatoes through a ricer or food mill set over the now-empty pot or, optionally, the bowl of a stand mixer fitted with a paddle attachment. For the absolute smoothest texture, work the potatoes through a drum sieve first; this is entirely optional.",
    "If using the stand mixer, whip on low speed for 30 seconds, then on high until smooth, about 30 seconds longer. Move the whipped potatoes to the now-empty pot and add the butter ({butter}), cream ({cream}) and a generous sprinkling of salt. If skipping the stand mixer, add the butter, cream and salt to the potatoes in the pot.",
    "Bring the cream to a simmer, letting the butter melt fully. Fold in the hot cream and melted butter, stirring well. Season to taste with salt and pepper. For creamier or more savory potatoes, add more cream or the optional chicken stock ({stock}), pouring it around the mass of potatoes and bringing it to a simmer before folding it in. Keep warm until ready to serve.",
  ],
});
```

## Notes

- Special equipment: a ricer or food mill, and optionally a stand mixer with a paddle attachment.
- This recipe can be doubled to serve a larger crowd.
- The recipe was originally developed by Kenji López-Alt and later updated by Daniel Gritzer to include a method without a stand mixer, with the quantities reduced for a smaller yield.

## Nutrition

Per serving:

| Calories | Fat | Carbs | Protein |
| -------- | --- | ----- | ------- |
| 575 | 45g | 40g | 7g |
