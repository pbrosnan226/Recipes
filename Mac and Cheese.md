---
source: https://www.mrfood.com/Pastas/Four-Cheese-Smoked-Mac-n-Cheese
site: "MrFood.com"
aliases:
  - Four Cheese Smoked Mac 'n' Cheese
created: 2026-09-24
batch_wanted: 1
course: Pastas
cook_time: 1 hour 20 minutes
tags:
  - recipe
  - pasta
  - cheese
---

Elbow macaroni in a cream cheese sauce with extra sharp cheddar, smoked Gouda and Parmesan, baked in the oven — or finished in a smoker.

![Four cheese smoked mac 'n' cheese](https://irepo.primecp.com/2019/03/404126/Four-Cheese-Smoked-Mac-n-Cheese_ExtraLarge1000_ID-3126278.jpg?v=3126278)

The source doesn't publish a serving count.

Batch size: `INPUT[inlineSelect(option(0.5, ½ batch), option(1, 1 batch), option(2, 2 batches), option(3, 3 batches)):batch_wanted]`

```dataviewjs
await dv.view("scripts/scale", {
  base: 1,
  noun: "batches",
  nounOne: "batch",
  prop: "batch_wanted",
  ingredients: [
    { id: "pasta", name: "Elbow macaroni", text: "1 (16-ounce) package", q: 1, u: ["(16-ounce) package", "(16-ounce) packages"] },
    { id: "butter", name: "Butter", text: "½ stick (¼ cup)", q: 0.25, u: ["cup", "cups"] },
    { id: "flour", name: "All-purpose flour", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { id: "milk", name: "Milk", text: "3 cups", q: 3, u: ["cup", "cups"] },
    { id: "creamcheese", name: "Cream cheese, cut into chunks", text: "1 (8-ounce) package", q: 1, u: ["(8-ounce) package", "(8-ounce) packages"] },
    { id: "salt", name: "Salt", text: "1 teaspoon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "pepper", name: "Black pepper", text: "½ teaspoon", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "cheddar", name: "Extra sharp cheddar cheese, shredded, divided", text: "1 (8-ounce) block", q: 1, u: ["(8-ounce) block", "(8-ounce) blocks"] },
    { id: "cheddarpart", hidden: true, q: 2, u: ["cup", "cups"] },
    { id: "gouda", name: "Smoked Gouda cheese, shredded, divided", text: "1 (8-ounce) block", q: 1, u: ["(8-ounce) block", "(8-ounce) blocks"] },
    { id: "goudapart", hidden: true, q: 2, u: ["cup", "cups"] },
    { id: "parmesan", name: "Parmesan cheese, shredded", text: "1 (4-ounce) wedge", q: 1, u: ["(4-ounce) wedge", "(4-ounce) wedges"] },
  ],
  steps: [
    "Cook the pasta ({pasta}) according to the package directions. Drain well.",
    "Meanwhile, melt the butter ({butter}) in a medium saucepan. Whisk the flour ({flour}) into the butter and cook over medium heat 2 minutes. Whisk in the milk ({milk}) and bring to a boil, then remove from the heat. Stir in the cream cheese ({creamcheese}), salt ({salt}) and pepper ({pepper}) until the mixture is smooth.",
    "Heat the oven to 300°F. Coat a disposable 9½ x 11 x 2-inch aluminum roasting pan with cooking spray. The aluminum pan is suggested in case you want to put this in an outdoor smoker; otherwise a 9x13-inch baking dish is fine.",
    "In a large bowl, combine {cheddarpart} of the cheddar ({cheddar}), {goudapart} of the smoked Gouda ({gouda}), the Parmesan ({parmesan}), the pasta and the sauce.",
    "Spoon the mixture into the roasting pan. Cover with aluminum foil and bake (or smoke) 45 minutes. Uncover, sprinkle with the remaining cheese, and bake 15 to 20 minutes more, until heated through.",
  ],
});
```

## Notes

- **Test kitchen tip:** the cheese gives this a natural smoky flavor on its own, but you can put it in a smoker for 45 minutes to an hour at 225 degrees, until brown and bubbly.
