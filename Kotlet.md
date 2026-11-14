---
source: http://www.thepersianpot.com/recipe/kotlet-persian-cutlet/
archived: http://web.archive.org/web/20210620085319/http://www.thepersianpot.com/recipe/kotlet-persian-cutlet/
site: "The Persian Pot"
author: "@mehnoosh_mah"
aliases:
  - Kotlet (Persian Cutlet)
created: 2026-09-24
course: Main
cuisine: Persian
servings: 2
servings_wanted: 2
prep_time: 15 minutes
cook_time: 20 minutes
tags:
  - recipe
  - beef
  - persian
---

An Iranian ground beef and potato patty, fried until golden brown and crispy outside and soft inside. Good warm or cold, plain or with bread.

Servings: `INPUT[inlineSelect(option(1), option(2), option(3), option(4), option(6)):servings_wanted]` (the source makes 2)

```dataviewjs
await dv.view("scripts/scale", {
  base: 2,
  ingredients: [
    { id: "beef", name: "Ground beef", text: "250 grams", q: 250, u: "grams" },
    { id: "potato", name: "Large potato", text: "2", q: 2 },
    { id: "onion", name: "Medium onion", text: "1", q: 1 },
    { id: "turmeric", name: "Turmeric", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "pepper", name: "Black pepper", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "salt", name: "Salt", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "egg", name: "Egg", text: "1", q: 1 },
    { id: "groundgarlic", name: "Ground garlic, optional", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "oil", name: "Vegetable oil", text: "as needed", s: "as needed" },
    { id: "garlic", name: "Garlic cloves, minced", text: "2", q: 2 },
  ],
  steps: [
    "Grate the potatoes ({potato}) into a large bowl.",
    "Grate the onion ({onion}) and add it to the bowl.",
    "Add the ground beef ({beef}), turmeric ({turmeric}), salt ({salt}), minced garlic ({garlic}) and black pepper ({pepper}).",
    "Add the egg ({egg}) and mix well — the source shows a photo of the consistency to aim for. If the mixture is too wet, add breadcrumbs.",
    "Heat vegetable oil in a large pan over medium-low heat. Take about 2 tablespoons of the mixture and pat it flat into a patty, not too thick or too thin.",
    "Place the patties gently into the pan. Once the bottom has turned golden brown, with rich brown crispy edges, flip them over. Add more oil if needed.",
    "Set a plate lined with paper towel next to your work station. As you take each patty out of the pan, drain off as much oil as possible, then put it on the plate and serve.",
  ],
});
```

## Notes

- The source page is no longer online — the domain now hosts unrelated content. This was documented from the Internet Archive snapshot dated 2021-06-20, linked in the `archived` property.

