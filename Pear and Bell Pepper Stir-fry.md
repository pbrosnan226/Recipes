---
source: https://paleoleap.com/pear-bell-pepper-ground-beef-stir-fry/
site: "Paleo Leap"
aliases:
  - Pear And Bell Pepper Ground Beef Stir-Fry
created: 2026-09-24
course: Main Course
cuisine: Chinese
servings: 4
servings_wanted: 4
prep_time: 25 minutes
cook_time: 15 minutes
total_time: 40 minutes
total_minutes: 40
tags:
  - recipe
  - beef
  - stir-fry
  - paleo
---

Ground beef stir-fried with bell peppers, zucchini, mushrooms, carrot and sliced pear, then finished with beef stock reduced by half.

![Pear and bell pepper ground beef stir-fry](https://paleoleap.com/wp-content/uploads/2018/11/pear-bell-pepper-ground-beef-stir-fry-recipe.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "beef", name: "Ground beef", text: "1½ lbs", q: 1.5, u: ["lb", "lbs"] },
    { id: "peppers", name: "Bell peppers, sliced", text: "2", q: 2 },
    { id: "onion", name: "Onion, sliced", text: "1", q: 1 },
    { id: "zucchini", name: "Zucchini, sliced", text: "1", q: 1 },
    { id: "mushrooms", name: "Mushrooms, sliced", text: "8 oz", q: 8, u: "oz" },
    { id: "pear", name: "Pear, sliced", text: "1", q: 1 },
    { id: "carrots", name: "Carrots, grated", text: "2", q: 2 },
    { id: "garlic", name: "Garlic cloves, minced", text: "2", q: 2 },
    { id: "ginger", name: "Fresh ginger, minced", text: "1 tbsp", q: 1, u: "tbsp" },
    { id: "greenonions", name: "Green onions, sliced, to garnish", text: "2", q: 2 },
    { id: "stock", name: "Beef stock", text: "1 cup", q: 1, u: ["cup", "cups"] },
    { id: "fat", name: "Cooking fat", text: "as needed", s: "as needed" },
  ],
  steps: [
    "Melt some cooking fat in a skillet over medium-high heat.",
    "Add the garlic ({garlic}) and ginger ({ginger}) and cook until soft and fragrant, about 1 to 2 minutes.",
    "Brown the ground beef ({beef}) until no longer pink, 4 to 5 minutes.",
    "Drain some of the fat if you like, then add all the remaining ingredients except the beef stock: bell peppers ({peppers}), onion ({onion}), zucchini ({zucchini}), mushrooms ({mushrooms}), pear ({pear}) and carrots ({carrots}).",
    "Cook until the vegetables are nearly soft, with just a hint of crunch left.",
    "Pour in the beef stock ({stock}) and cook until reduced by half.",
    "Serve topped with the green onions ({greenonions}).",
  ],
});
```

## Nutrition

Per serving, approximate (calculated automatically by the source site):

| Calories | Carbs | Protein | Fat  | Sat. fat | Fiber | Sugar | Sodium |
| -------- | ----- | ------- | ---- | -------- | ----- | ----- | ------ |
| 526 kcal | 20 g  | 34 g    | 35 g | 13 g     | 6 g   | 10 g  | 258 mg |
