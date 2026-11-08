---
source: https://www.acouplecooks.com/chickpea-curry/
site: "A Couple Cooks"
author: Sonja Overhiser
aliases:
  - Cozy Chickpea Curry
created: 2026-09-24
course: Main Dish
cuisine: Indian Inspired
servings: 4
servings_wanted: 4
prep_time: 5 minutes
cook_time: 15 minutes
total_time: 20 minutes
tags:
  - recipe
  - chickpeas
  - curry
  - indian
---

Onion, garlic, ginger and spinach cooked down with fire roasted tomatoes, chickpeas, curry spices and coconut milk, served over basmati rice.

![Chickpea curry](https://www.acouplecooks.com/wp-content/uploads/2019/11/Chickpea-Curry-007.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "onion", name: "Yellow onion", text: "1", q: 1 },
    { id: "garlic", name: "Large garlic clove", text: "1", q: 1 },
    { id: "ginger", name: "Grated ginger", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "oil", name: "Coconut oil or olive oil", text: "1 tablespoon", q: 1, u: ["tablespoon", "tablespoons"] },
    { id: "spinach", name: "Baby spinach leaves (or chopped spinach)", text: "6 cups (5 ounces)", q: 6, u: ["cup", "cups"] },
    { id: "tomatoes", name: "Crushed fire roasted tomatoes (see notes)", text: "28-ounce can", q: 1, u: ["28-ounce can", "28-ounce cans"] },
    { id: "curry", name: "Curry powder", text: "1 tablespoon", q: 1, u: ["tablespoon", "tablespoons"] },
    { id: "cumin", name: "Cumin", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "coriander", name: "Coriander", text: "½ teaspoon", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "salt", name: "Kosher salt", text: "¾ teaspoon", q: 0.75, u: ["teaspoon", "teaspoons"] },
    { id: "chickpeas", name: "Chickpeas", text: "2 15-ounce cans", q: 2, u: ["15-ounce can", "15-ounce cans"] },
    { id: "coconutmilk", name: "Full fat canned coconut milk", text: "½ cup", q: 0.5, u: ["cup", "cups"] },
    { id: "rice", name: "White or brown basmati rice, to serve", text: "as needed", s: "as needed" },
  ],
  steps: [
    "If you're serving it with rice, start the basmati rice.",
    "Mince the onion ({onion}). Mince the garlic ({garlic}). Peel and mince the ginger ({ginger}), or grate it. Drain and rinse the chickpeas ({chickpeas}).",
    "Heat the oil ({oil}) in a large skillet over medium-high heat. Add the onion and sauté for 5 minutes. Add the garlic, ginger and spinach ({spinach}), and sauté for 2 minutes until the spinach is fully wilted.",
    "Carefully pour in the tomatoes ({tomatoes}), then add the curry powder ({curry}), cumin ({cumin}), coriander ({coriander}), salt ({salt}) and chickpeas. Cook for 5 minutes, until bubbly.",
    "Stir in the coconut milk ({coconutmilk}) until fully combined, then take it off the heat. Serve with basmati rice. Leftovers keep up to 3 days refrigerated.",
  ],
});
```

## Notes

- **Fire roasted tomatoes** are the key ingredient here: they're charred over an open fire before canning, so they taste sweet straight out of the can. Other varieties can taste bitter out of the can and need to cook longer — if you substitute high quality canned tomatoes, cook the sauce 10 minutes longer.

## Nutrition

Per serving, approximate (calculated automatically by the source site):

| Calories | Carbs  | Protein | Fat    | Sat. fat | Fiber  | Sugar | Sodium |
| -------- | ------ | ------- | ------ | -------- | ------ | ----- | ------ |
| 286      | 33.3 g | 11.8 g  | 13.5 g | 8.6 g    | 10.9 g | 2.9 g | 545 mg |
