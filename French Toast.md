---
source: https://www.seriouseats.com/perfect-quick-easy-french-toast
site: Serious Eats
author: Daniel Gritzer
aliases:
  - Perfect Quick-and-Easy French Toast
created: 2026-11-07
servings: 4
servings_wanted: 12
prep_time: 5 mins
cook_time: 35 mins
total_time: 40 mins
total_minutes: 40
tags:
  - recipe
---

Basic French toast made from pantry staples.

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "bread", name: "white bread", text: "8 (1/2-inch thick) slices white bread", q: 8, u: ["slice", "slices"] },
    { id: "eggs", name: "eggs", text: "6 large eggs", q: 6, u: ["large egg", "large eggs"] },
    { id: "sugar", name: "sugar", text: "4 tablespoons sugar, plus more for sprinkling", q: 4, u: ["tablespoon", "tablespoons"] },
    { id: "salt", name: "kosher salt", text: "Pinch kosher salt", s: "pinch" },
    { id: "cinnamon", name: "ground cinnamon", text: "Pinch ground cinnamon", s: "pinch" },
    { id: "nutmeg", name: "nutmeg", text: "Pinch freshly grated nutmeg", s: "pinch" },
    { id: "vanilla", name: "vanilla extract", text: "1/4 teaspoon vanilla extract", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { id: "milk", name: "whole milk", text: "2 cups whole milk", q: 2, u: ["cup", "cups"] },
    { id: "butter", name: "unsalted butter", text: "4 tablespoons unsalted butter for the pan, plus more for serving", q: 4, u: ["tablespoon", "tablespoons"] },
    { id: "syrup", name: "maple syrup", text: "Maple syrup, for serving", s: "for serving" },
  ],
  steps: [
    "Put a wire rack on a rimmed baking sheet in the oven and preheat to 200°F (93°C). If the bread is very fresh and moist, lay the slices ({bread}) in a single layer on the rack and toast them in the oven, turning once, until lightly toasted, about 10 minutes.",
    "Meanwhile, whisk the eggs ({eggs}), sugar ({sugar}), salt ({salt}), cinnamon ({cinnamon}), nutmeg ({nutmeg}), and vanilla ({vanilla}) together in a large bowl until thoroughly combined. Add the milk ({milk}) and whisk to blend.",
    "Heat butter (1 tablespoon) in a large non-stick or cast iron skillet over medium heat, swirling, until the foaming subsides, about 5 minutes. Soak 2 slices of bread in the egg mixture, turning, until saturated. Cook in the skillet, swirling occasionally, until browned on the bottom, about 3 minutes. Sprinkle the top with sugar (more, for sprinkling), flip, and cook, swirling occasionally, until browned on the second side, about 3 minutes more. Move the French toast to the rack in the oven in a single layer to keep warm, and repeat with the remaining bread and egg mixture.",
    "Serve with pats of butter (more) and maple syrup.",
  ],
});
```

## Nutrition

Per serving:

| Calories | Carbs | Fiber | Sugars | Protein | Fat | Sat. fat | Cholesterol | Vitamin C | Sodium | Calcium | Iron | Potassium |
| -------- | ----- | ----- | ------ | ------- | --- | -------- | ----------- | --------- | ------ | ------- | ---- | --------- |
| 706 | 81g | 2g | 52g | 19g | 34g | 15g | 322mg | 0mg | 566mg | 244mg | 4mg | 426mg |
