---
source: https://www.delish.com/cooking/recipe-ideas/a22728350/salmon-meatballs-recipe/
site: "Delish"
author: Rian Handler
aliases:
  - Salmon Meatballs With Avocado Crema
created: 2026-09-24
course: Main Dish
servings: 4
servings_wanted: 4
prep_time: 20 minutes
total_time: 40 minutes
tags:
  - recipe
  - salmon
  - fish
  - meatballs
---

Salmon chopped in a food processor, bound with panko, egg and garlic, baked as tablespoon-sized meatballs and served under a blended avocado, lime and herb crema.

![Salmon meatballs with avocado crema](https://hips.hearstapps.com/hmg-prod/images/delish-salmon-meatballs-horizontal-1535564670.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { group: "Meatballs", id: "salmon", name: "Salmon filet, skinned, cut into cubes", text: "1 lb", q: 1, u: "lb" },
    { group: "Meatballs", id: "panko", name: "Panko breadcrumbs", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { group: "Meatballs", id: "chili", name: "Chili powder", text: "½ tsp", q: 0.5, u: "tsp" },
    { group: "Meatballs", id: "parsley", name: "Freshly chopped parsley", text: "2 tbsp", q: 2, u: "tbsp" },
    { group: "Meatballs", id: "garlic", name: "Garlic cloves, minced", text: "2", q: 2 },
    { group: "Meatballs", id: "egg", name: "Egg", text: "1", q: 1 },
    { group: "Meatballs", id: "salt", name: "Kosher salt", text: "to taste", s: "to taste" },
    { group: "Meatballs", id: "pepper", name: "Freshly ground black pepper", text: "to taste", s: "to taste" },
    { group: "Avocado crema", id: "avocado", name: "Avocado", text: "1", q: 1 },
    { group: "Avocado crema", id: "limes", name: "Limes, juiced", text: "2", q: 2 },
    { group: "Avocado crema", id: "sourcream", name: "Sour cream (or yogurt)", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { group: "Avocado crema", id: "basil", name: "Basil", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { group: "Avocado crema", id: "parsley2", name: "Parsley", text: "2 tbsp", q: 2, u: "tbsp" },
  ],
  steps: [
    "Heat the oven to 350°F. Line a large rimmed baking sheet with parchment paper and coat it with cooking spray.",
    "**Meatballs:** put the salmon ({salmon}) in the bowl of a food processor and process until finely chopped, then transfer to a large bowl. Add the panko ({panko}), chili powder ({chili}), parsley ({parsley}), garlic ({garlic}) and egg ({egg}), and season generously with salt and pepper. Stir to combine, then form into tablespoon-sized meatballs and set them on the baking sheet.",
    "Bake until the meatballs are slightly golden and cooked through, 15 to 17 minutes.",
    "**Avocado crema:** meanwhile, put the avocado ({avocado}), lime juice ({limes} limes), yogurt ({sourcream}), basil ({basil}) and parsley ({parsley2}) in a food processor. Season with salt and pepper, then process until smooth. If the sauce is too thick, thin it with water.",
    "Serve the meatballs drizzled with the avocado crema and garnished with more parsley.",
  ],
});
```

## Nutrition

Per serving, approximate (calculated automatically by the source site):

| Calories | Carbs | Protein | Fat  | Sat. fat | Fiber | Sugar | Sodium |
| -------- | ----- | ------- | ---- | -------- | ----- | ----- | ------ |
| 390      | 8 g   | 27 g    | 27 g | 6 g      | 5 g   | 2 g   | 544 mg |
