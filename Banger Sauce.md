---
source: https://www.foodnetwork.com/recipes/tequila-shrimp-banger-sauce-3220459
site: "Food Network"
aliases:
  - Tequila Shrimp Banger Sauce
created: 2026-09-24
course: Sauce
servings: 50
servings_wanted: 50
prep_time: 10 minutes
total_time: 10 minutes
total_minutes: 10
tags:
  - recipe
  - sauce
---

A mayonnaise-based dipping sauce with Thai sweet chili, tequila, Sriracha and sesame oil, stirred together in one bowl. The published batch is restaurant-sized.

Servings: `INPUT[inlineSelect(option(25), option(50), option(75), option(100), option(150)):servings_wanted]` (the source makes 50)

```dataviewjs
await dv.view("scripts/scale", {
  base: 50,
  ingredients: [
    { id: "mayo", name: "Mayonnaise", text: "1 gallon", q: 1, u: ["gallon", "gallons"] },
    { id: "chili", name: "Thai sweet chili sauce", text: "4 cups", q: 4, u: ["cup", "cups"] },
    { id: "tequila", name: "Tequila", text: "2 cups", q: 2, u: ["cup", "cups"] },
    { id: "sriracha", name: "Sriracha", text: "1½ cups", q: 1.5, u: ["cup", "cups"] },
    { id: "sesame", name: "Sesame oil", text: "½ cup", q: 0.5, u: ["cup", "cups"] },
    { id: "adobo", name: "Adobo seasoning", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { id: "garlic", name: "Granulated garlic", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { id: "cayenne", name: "Cayenne pepper", text: "1 tablespoon", q: 1, u: ["tablespoon", "tablespoons"] },
    { id: "water", name: "Water (listed in the method)", text: "2 cups", q: 2, u: ["cup", "cups"] },
  ],
  steps: [
    "Put the mayonnaise ({mayo}), chili sauce ({chili}), tequila ({tequila}), Sriracha ({sriracha}), sesame oil ({sesame}), adobo ({adobo}), granulated garlic ({garlic}), cayenne ({cayenne}) and water ({water}) in a large mixing bowl, and mix to combine.",
  ],
});
```

## Notes

- The restaurant serves this alongside their tequila shrimp bangers, and their guests also use it as a side for burgers and fries.

