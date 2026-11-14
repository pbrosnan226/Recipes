---
source: https://www.saltandlavender.com/creamy-tomato-pasta/
site: "Salt & Lavender"
author: Natasha Bull
created: 2026-09-18
course: Main
cuisine: American
servings: 4
servings_wanted: 4
prep_time: 5 minutes
cook_time: 20 minutes
total_time: 25 minutes
total_minutes: 25
tags:
  - recipe
  - pasta
  - vegetarian
  - quick
---

Quick pasta made with everyday ingredients and a silky tomato sauce.

![Creamy tomato pasta](images/Creamy%20Tomato%20Pasta.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "pasta", name: "Uncooked pasta", text: "8 oz", q: 8, u: "oz" },
    { id: "butter", name: "Butter", text: "2 tbsp", q: 2, u: "tbsp" },
    { id: "garlic", name: "Garlic cloves, minced", text: "2–3", q: [2, 3] },
    { id: "paste", name: "Tomato paste", text: "2 tbsp", q: 2, u: "tbsp" },
    { id: "sauce", name: "Tomato sauce", text: "1 (14 oz) can", q: 1, u: ["(14 oz) can", "(14 oz) cans"] },
    { id: "cream", name: "Heavy/whipping cream", text: "¾ cup", q: 0.75, u: ["cup", "cups"] },
    { id: "italian", name: "Italian seasoning", text: "¼ tsp", q: 0.25, u: "tsp" },
    { id: "saltpepper", name: "Salt and pepper", text: "to taste", s: "to taste" },
    { id: "parmesan", name: "Freshly grated parmesan cheese", text: "to taste, for serving", s: "to taste, for serving" },
  ],
  steps: [
    "Bring a large pot of salted water to a boil and cook the pasta ({pasta}) until al dente, following the package instructions.",
    "Meanwhile, once the pasta starts cooking, melt the butter ({butter}) in a skillet over medium-high heat. Add the garlic ({garlic}) and sauté for about 1 minute, stirring constantly.",
    "Stir in the tomato paste ({paste}), tomato sauce ({sauce}), cream ({cream}), and Italian seasoning ({italian}) until smooth. Cook for about 5 minutes, or until thickened to your liking. It should bubble very gently, so turn the heat down if needed.",
    "Season with salt and pepper as needed (the author is generous with both). If the sauce is too acidic or tangy for your taste, add a pinch of sugar.",
    "Drain the pasta and toss it with the sauce, adding a splash of hot pasta water if the sauce gets too thick. Serve immediately with plenty of parmesan on top.",
  ],
});
```

## Notes

- Don't swap the cream for anything lower in fat; it's likely to curdle from the acid in the tomatoes.

## Nutrition

Per serving, approximate (calculated automatically by the source site):

| Calories | Carbs | Protein | Fat  | Sat. fat | Fiber | Sugar | Sodium |
| -------- | ----- | ------- | ---- | -------- | ----- | ----- | ------ |
| 447 kcal | 51 g  | 10 g    | 23 g | 14 g     | 4 g   | 7 g   | 654 mg |
