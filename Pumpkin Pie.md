---
source: https://sallysbakingaddiction.com/the-great-pumpkin-pie-recipe/
site: "Sally's Baking Addiction"
author: Sally
aliases:
  - The Great Pumpkin Pie Recipe
created: 2026-11-12
course: Dessert
cuisine: American
servings: 8
servings_wanted: 8
prep_time: 45 minutes
cook_time: 1 hour 5 minutes
total_time: 5 hours
total_minutes: 300
tags:
  - recipe
  - pumpkin pie
---

A rich, smooth, spiced pumpkin pie in a par-baked homemade crust, optionally decorated with sugared cranberries and pie crust leaves.

![Pumpkin pie](images/Pumpkin%20Pie.jpg)

Servings: `INPUT[inlineSelect(option(8), option(16)):servings_wanted]` (the source makes 8, and says it serves 8-10; it also makes 1 cup sugared cranberries)

```dataviewjs
await dv.view("scripts/scale", {
  base: 8,
  ingredients: [
    { id: "cranberries", name: "Fresh cranberries (do not use frozen)", text: "1 cup (100g) fresh cranberries (do not use frozen)", q: 1, u: ["cup", "cups"] },
    { id: "water", name: "Water", text: "3/4 cup (180ml) water", q: 0.75, u: ["cup", "cups"] },
    { id: "sugar", name: "Granulated sugar, divided", text: "1 and 1/4 cups (250g) granulated sugar, divided", q: 1.25, u: ["cup", "cups"] },
    { id: "syrupsugar", hidden: true, q: 0.75, u: ["cup", "cups"] },
    { id: "coatsugar", hidden: true, q: 0.5, u: ["cup", "cups"] },
    { id: "dough", name: "Homemade Pie Dough", text: "Homemade Pie Dough (full recipe makes 2 crusts: 1 for bottom, 1 for leaf decor)", q: 2, u: ["pie crust", "pie crusts"] },
    { id: "eggwash", name: "Egg wash", text: "egg wash: 1 large egg beaten with 1 Tablespoon milk", q: 1, u: ["large egg", "large eggs"] },
    { id: "washmilk", hidden: true, q: 1, u: ["Tablespoon", "Tablespoons"] },
    { id: "pumpkin", name: "Pumpkin puree", text: "one 15-ounce can (425g) pumpkin puree*", q: 1, u: ["15-ounce can", "15-ounce cans"] },
    { id: "eggs", name: "Large eggs", text: "3 large eggs", q: 3, u: ["large egg", "large eggs"] },
    { id: "brown", name: "Packed light or dark brown sugar", text: "1 and 1/4 cups (250g) packed light or dark brown sugar", q: 1.25, u: ["cup", "cups"] },
    { id: "cornstarch", name: "Cornstarch", text: "1 Tablespoon (8g) cornstarch", q: 1, u: ["Tablespoon", "Tablespoons"] },
    { id: "salt", name: "Salt", text: "1/2 teaspoon salt", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "cinnamon", name: "Ground cinnamon", text: "1 and 1/2 teaspoons ground cinnamon", q: 1.5, u: ["teaspoon", "teaspoons"] },
    { id: "ginger", name: "Ground ginger", text: "1/2 teaspoon ground ginger*", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "nutmeg", name: "Ground or freshly grated nutmeg", text: "1/4 teaspoon ground or freshly grated nutmeg*", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { id: "cloves", name: "Ground cloves", text: "1/8 teaspoon ground cloves*", q: 0.125, u: ["teaspoon", "teaspoons"] },
    { id: "pepper", name: "Fresh ground black pepper", text: "1/8 teaspoon fresh ground black pepper", q: 0.125, u: ["teaspoon", "teaspoons"] },
    { id: "cream", name: "Heavy cream", text: "1 cup (240ml) heavy cream", q: 1, u: ["cup", "cups"] },
    { id: "milk", name: "Milk", text: "1/4 cup (60ml) milk", q: 0.25, u: ["cup", "cups"] },
  ],
  steps: [
    "If you want to decorate the pie with sugared cranberries, start them the night before, since they need to sit for several hours. Put the cranberries ({cranberries}) in a large heatproof bowl and set aside. In a medium saucepan over medium heat, bring the water ({water}) and {syrupsugar} of the sugar to a simmer, whisking until the sugar dissolves. Take the pan off the heat and cool for 5 minutes. Pour the syrup over the cranberries and stir. Cover the bowl and leave for 15 minutes. Line a baking sheet with parchment paper or a silicone baking mat. With a slotted spoon, move the cranberries from the syrup to the baking sheet and let them dry uncovered for 1 hour. Put the remaining {coatsugar} sugar in a large bowl and toss the cranberries in it to coat all the way around. Set them on a lined baking sheet and let them dry uncovered for at least 1 hour at room temperature or in the refrigerator. Cover tightly and refrigerate for up to 3 days.",
    "Make the pie crust through step 5 following the author's pie crust recipe ({dough}), or use your favorite pie dough or a store-bought crust.",
    "Preheat the oven to 375°F (190°C).",
    "Take 1 disc of pie dough from the refrigerator. On a lightly floured surface, roll it into a 12-inch circle, turning it about a quarter turn every few rolls. Carefully fit it into a 9×2-inch deep dish pie dish (the author's is 1.75 inches deep), pressing it in tightly with your fingers. Fold any overhang back into the dish to make a thick rim, then crimp the edges with a fork or flute them with your fingers. Lightly brush the edges with the egg wash (the egg ({eggwash}) beaten with milk ({washmilk})).",
    "Line the crust with parchment paper, crunching the paper up first so it shapes easily into the crust. Fill with pie weights or dried beans, distributing them evenly; you need at least 2 standard sets of pie weights to fit. Par-bake for 10 minutes. Carefully remove the parchment and weights, prick the bottom of the crust all over with a fork to make steam vents, and return the crust (without weights) to the oven for 7-8 more minutes, or until the bottom is just starting to brown.",
    "Whisk the pumpkin ({pumpkin}), eggs ({eggs}) and brown sugar ({brown}) together until combined. Add the cornstarch ({cornstarch}), salt ({salt}), cinnamon ({cinnamon}), ginger ({ginger}), nutmeg ({nutmeg}), cloves ({cloves}), pepper ({pepper}), heavy cream ({cream}) and milk ({milk}). Whisk vigorously until everything is combined.",
    "Pour the filling into the warm crust, filling it only about 3/4 of the way up. With the deep dish pie dish, only a little filling should be left over; the extra can go into mini pies made with leftover dough scraps. Bake until the center is almost set, about 55-60 minutes give or take. A small part of the center will be wobbly, which is fine. After 25 minutes of baking, cover the crust edges with aluminum foil or a pie crust shield so they don't get too brown. Check for doneness at minute 50, then 55, then 60, and so on.",
    "Once done, move the pie to a wire rack and cool completely for at least 3 hours before garnishing and serving.",
    "Decorate with sugared cranberries and pie crust leaves (see Notes). There will be leftover cranberries. Serve the pie with whipped cream if desired.",
    "Cover leftovers tightly and refrigerate for up to 5 days.",
  ],
});
```

## Notes

- **Make ahead and freezing:** the pie freezes well for up to 3 months; thaw overnight in the refrigerator before serving. The crust dough freezes for up to 3 months; thaw overnight in the refrigerator before using. If decorating with sugared cranberries, start them the night before, and start the crust the night before too (the dough needs at least 2 hours to chill; overnight is best). The filling can also be made the night before, which the author prefers because it lets the flavors blend; cover and refrigerate overnight, with no need to bring it to room temperature before baking.
- **Cranberries:** use fresh, not frozen. The sugar syrup doesn't coat frozen berries evenly, leaving some plain and shriveled.
- **Pumpkin:** canned pumpkin is best; the author uses and recommends Libby's. If using fresh pumpkin puree, lightly blot it first to remove some moisture; the bake time may be longer.
- **Spices:** instead of the ground ginger, nutmeg, cloves and pepper, you can use 1 teaspoon of pumpkin pie spice. Still add the 1 and 1/2 teaspoons of cinnamon.
- **Pie crust:** pre-bake the crust whether it's homemade or store-bought (the par-baking step). A graham cracker crust works, though the slices may be a little messy; pre-bake it for 10 minutes like the regular crust, with no pie weights needed for a cookie crust.
- **Pie crust leaves:** on a floured surface, roll out one of the chilled dough balls (keep the other refrigerated) to any shape, 1/8 inch thick. Cut with leaf cookie cutters, brush each lightly with the egg and milk mixture, and cut leaf veins with a sharp knife if you like. Bake on a parchment- or silicone-mat-lined baking sheet at 350°F (177°C) for 10 minutes or until lightly browned. Cool before decorating the pie.
- The pie crust leaves and sugared cranberries are decoration only; the author says you can skip either, and skipping the leaves means making only 1 crust.
