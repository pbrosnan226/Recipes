---
source: https://www.seriouseats.com/recipes/2009/03/west-indian-rice-and-beans-recipe.html
archived: http://web.archive.org/web/20210504081850/https://www.seriouseats.com/recipes/2009/03/west-indian-rice-and-beans-recipe.html
site: "Serious Eats"
author: Blake Royer
aliases:
  - "Dinner Tonight: West Indian Rice and Beans"
created: 2026-09-24
course: Main
cuisine: Caribbean
servings: 4
servings_wanted: 4
tags:
  - recipe
  - rice
  - beans
  - vegetarian
---

Rice simmered in vegetable broth and coconut milk with kidney beans, jalapeño, thyme and allspice, finished with sliced green onions.

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "broth", name: "Vegetable broth", text: "2 cups", q: 2, u: ["cup", "cups"] },
    { id: "beans", name: "Kidney beans, drained and rinsed", text: "1 can (15-ounce)", q: 1, u: ["can (15-ounce)", "cans (15-ounce)"] },
    { id: "coconut", name: "Canned unsweetened coconut milk", text: "1 cup", q: 1, u: ["cup", "cups"] },
    { id: "jalapeno", name: "Jalapeño, deseeded and minced", text: "1", q: 1 },
    { id: "thyme", name: "Dried thyme", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "allspice", name: "Ground allspice", text: "½ teaspoon", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "rice", name: "Medium-grain white rice", text: "¾ cup", q: 0.75, u: ["cup", "cups"] },
    { id: "greenonions", name: "Thinly sliced green onions", text: "1 cup", q: 1, u: ["cup", "cups"] },
  ],
  steps: [
    "In a medium or large saucepan, combine everything except the rice and green onion — the broth ({broth}), kidney beans ({beans}), coconut milk ({coconut}), jalapeño ({jalapeno}), thyme ({thyme}) and allspice ({allspice}) — and bring to a boil. Stir in the rice ({rice}), reduce the heat to a gentle simmer, and cook until the rice is almost tender and most of the liquid is absorbed, about 20 minutes.",
    "Stir in most of the green onions ({greenonions} in total), holding some back for garnish. Keep cooking until the rice is completely tender. Serve with the remaining green onions on top.",
  ],
});
```

## Notes

- The source page is no longer online — it now redirects to a category listing. This was documented from the Internet Archive snapshot dated 2021-05-04, linked in the `archived` property.
