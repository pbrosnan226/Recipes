---
source: https://paleoleap.com/oven-baked-french-onion-chicken/
site: "Paleo Leap"
aliases:
  - Oven-Baked French Onion Chicken
created: 2026-09-24
course: Main
cuisine: French
servings: 4
servings_wanted: 4
prep_time: 20 minutes
cook_time: 30 minutes
total_time: 50 minutes
total_minutes: 50
tags:
  - recipe
  - chicken
  - onion
  - paleo
---

Chicken breasts rubbed with dried onion and oregano, browned, then baked with softened onions, garlic, thyme and rosemary in beef stock.

![Oven-baked French onion chicken](images/Oven%20Baked%20French%20Onion%20Chicken.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "chicken", name: "Chicken breasts, skinless and boneless", text: "2 to 4", q: [2, 4] },
    { id: "onions", name: "Onions, sliced", text: "2 to 3", q: [2, 3] },
    { id: "garlic", name: "Garlic cloves, minced", text: "3 to 4", q: [3, 4] },
    { id: "thyme", name: "Fresh thyme, minced", text: "1 tbsp", q: 1, u: "tbsp" },
    { id: "rosemary", name: "Fresh rosemary, minced", text: "1 tbsp", q: 1, u: "tbsp" },
    { id: "stock", name: "Beef stock", text: "1½ cups", q: 1.5, u: ["cup", "cups"] },
    { id: "stockpart", hidden: true, q: 2, u: "tbsp" },
    { id: "driedonion", name: "Dried onion", text: "1 tsp", q: 1, u: "tsp" },
    { id: "oregano", name: "Dried oregano", text: "1 tsp", q: 1, u: "tsp" },
    { id: "paprika", name: "Paprika, optional", text: "½ tsp", q: 0.5, u: "tsp" },
    { id: "ghee", name: "Ghee", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { id: "fat", name: "Cooking fat", text: "as needed", s: "as needed" },
    { id: "saltpepper", name: "Sea salt and freshly ground black pepper", text: "to taste", s: "to taste" },
  ],
  steps: [
    "Heat the oven to 400°F.",
    "Combine the dried onion ({driedonion}), dried oregano ({oregano}) and paprika ({paprika}) in a bowl, and season generously to taste.",
    "Rub the chicken ({chicken}) with the onion and oregano mixture, coating it well.",
    "Melt cooking fat in a skillet over medium-high heat and brown the chicken 2 to 3 minutes per side, until nicely browned.",
    "Set the chicken aside and add the ghee ({ghee}) to the same skillet.",
    "Add the fresh onion ({onions}) and garlic ({garlic}) and cook over medium heat, stirring, until soft.",
    "Add {stockpart} of the stock ({stock}) to the skillet along with the thyme ({thyme}) and rosemary ({rosemary}), and cook until slightly caramelized, 5 to 6 minutes.",
    "Return the chicken to the pan, toss everything together, pour in the remaining stock, and put the pan in the oven.",
    "Bake until the chicken is cooked through, about 15 to 18 minutes.",
    "Adjust the seasoning and serve.",
  ],
});
```

## Nutrition

Per serving, approximate (calculated automatically by the source site):

| Calories | Carbs | Protein | Fat  | Sat. fat | Fiber | Sugar | Sodium |
| -------- | ----- | ------- | ---- | -------- | ----- | ----- | ------ |
| 295 kcal | 11 g  | 30 g    | 15 g | 8 g      | 3 g   | 3 g   | 247 mg |
