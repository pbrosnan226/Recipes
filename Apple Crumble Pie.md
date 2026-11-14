---
source: https://sallysbakingaddiction.com/apple-crumble-pie/
site: "Sally's Baking Addiction"
author: Sally
aliases:
  - Apple Crumble Pie
created: 2026-11-12
course: Dessert
cuisine: American
yield: one 9-inch pie
pies_wanted: 1
prep_time: 3 hours
cook_time: 1 hour
total_time: 7 hours
total_minutes: 420
tags:
  - recipe
  - apple crumble pie
---

Apple pie topped with a thick, buttery brown sugar and walnut crumble instead of a top crust.

![Apple crumble pie](images/Apple%20Crumble%20Pie.jpg)

Pies: `INPUT[inlineSelect(option(1, 1 pie), option(2, 2 pies)):pies_wanted]` (the source makes one 9-inch pie)

```dataviewjs
await dv.view("scripts/scale", {
  base: 1,
  noun: "pies",
  nounOne: "pie",
  prop: "pies_wanted",
  ingredients: [
    { group: "Crust", id: "cflour", name: "All-purpose flour (spooned & leveled), plus more for work surface", text: "1 and 1/2 cups (188g) all-purpose flour (spooned & leveled), plus more for work surface", q: 1.5, u: ["cup", "cups"] },
    { group: "Crust", id: "csugar", name: "Granulated sugar", text: "1 Tablespoon (12g) granulated sugar", q: 1, u: ["Tablespoon", "Tablespoons"] },
    { group: "Crust", id: "csalt", name: "Salt", text: "1/4 teaspoon salt", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { group: "Crust", id: "cbutter", name: "Cold unsalted butter, cubed", text: "1/2 cup (8 Tbsp; 113g) cold unsalted butter, cubed", q: 0.5, u: ["cup", "cups"] },
    { group: "Crust", id: "cwater", name: "Ice-cold water, plus more as needed", text: "1/4 cup (60g/ml) ice-cold water, plus more as needed", q: 0.25, u: ["cup", "cups"] },
    { id: "morewater", hidden: true, q: [1, 2], u: ["Tablespoon", "Tablespoons"] },
    { group: "Crust", id: "eggwash", name: "Egg wash", text: "egg wash: 1 large egg beaten with 1 Tablespoon (15g/ml) milk", q: 1, u: ["large egg", "large eggs"] },
    { id: "washmilk", hidden: true, q: 1, u: ["Tablespoon", "Tablespoons"] },
    { group: "Crumble Topping", id: "tbrown", name: "Packed light or dark brown sugar", text: "1/2 cup (100g) packed light or dark brown sugar", q: 0.5, u: ["cup", "cups"] },
    { group: "Crumble Topping", id: "tcinnamon", name: "Ground cinnamon", text: "1 teaspoon ground cinnamon", q: 1, u: ["teaspoon", "teaspoons"] },
    { group: "Crumble Topping", id: "tflour", name: "All-purpose flour (spooned & leveled)", text: "3/4 cup (94g) all-purpose flour (spooned & leveled)", q: 0.75, u: ["cup", "cups"] },
    { group: "Crumble Topping", id: "walnuts", name: "Chopped walnuts", text: "3/4 cup (95g) chopped walnuts", q: 0.75, u: ["cup", "cups"] },
    { group: "Crumble Topping", id: "tbutter", name: "Unsalted butter, melted and slightly cooled", text: "5 Tablespoons (71g) unsalted butter, melted and slightly cooled", q: 5, u: ["Tablespoon", "Tablespoons"] },
    { group: "Filling", id: "apples", name: "1/4-inch-thick apple slices (about 8 large peeled and cored apples)", text: "10 cups (1.25kg) 1/4-inch-thick apple slices (about 8 large peeled and cored apples)*", q: 10, u: ["cup", "cups"] },
    { group: "Filling", id: "fsugar", name: "Granulated sugar", text: "1/2 cup (100g) granulated sugar", q: 0.5, u: ["cup", "cups"] },
    { group: "Filling", id: "fflour", name: "All-purpose flour (spooned & leveled)", text: "1/4 cup (31g) all-purpose flour (spooned & leveled)", q: 0.25, u: ["cup", "cups"] },
    { group: "Filling", id: "lemon", name: "Fresh lemon juice", text: "1 Tablespoon (15g/ml) fresh lemon juice", q: 1, u: ["Tablespoon", "Tablespoons"] },
    { group: "Filling", id: "fcinnamon", name: "Ground cinnamon", text: "1 and 1/2 teaspoons ground cinnamon", q: 1.5, u: ["teaspoon", "teaspoons"] },
    { group: "Filling", id: "cloves", name: "Ground cloves", text: "1/4 teaspoon ground cloves", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { group: "Filling", id: "nutmeg", name: "Ground nutmeg", text: "1/4 teaspoon ground nutmeg", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { group: "Filling", id: "vanilla", name: "Pure vanilla extract", text: "1 teaspoon pure vanilla extract", q: 1, u: ["teaspoon", "teaspoons"] },
  ],
  steps: [
    "**Crust:** in a medium bowl, whisk together the flour ({cflour}), sugar ({csugar}) and salt ({csalt}). With a pastry cutter or 2 forks, cut in the butter ({cbutter}) until the mixture looks like coarse pea-sized crumbs. Add the water ({cwater}) and stir until the flour is moistened. If the dough seems dry, add {morewater} more water. Turn the dough out onto a lightly floured surface, work it into a ball by hand, and flatten it into a thick disc. Wrap in plastic wrap or parchment paper and refrigerate for at least 2 hours and up to 3 days.",
    "**Crumble topping:** in a medium bowl, combine the brown sugar ({tbrown}), cinnamon ({tcinnamon}), flour ({tflour}) and walnuts ({walnuts}). With a silicone spatula, stir in the melted butter ({tbutter}). The topping will be thick and crumbly. Refrigerate it while you continue.",
    "On a floured work surface, roll out the chilled dough disc, turning it about a quarter turn every few rolls, until you have a 12-inch circle. Carefully fit it into a 9-inch pie dish and tuck it in with your fingers so it is smooth. Trim the excess dough from the edges with a small paring knife. Flute the edges and brush them with the egg wash (the egg ({eggwash}) beaten with milk ({washmilk})). Refrigerate the crust.",
    "**Filling:** in a large bowl, using a silicone spatula or wooden spoon, combine the apples ({apples}), sugar ({fsugar}), flour ({fflour}), lemon juice ({lemon}), cinnamon ({fcinnamon}), cloves ({cloves}), nutmeg ({nutmeg}) and vanilla ({vanilla}), stirring until the apples are all coated.",
    "Preheat the oven to 400°F (204°C). Put a baking sheet on the bottom oven rack to catch any juices that bubble over.",
    "Spoon the apple filling into the crust, with no large gaps between the slices. It is a lot of filling. Sprinkle the cold crumble topping evenly over the apples.",
    "Bake for 20 minutes. Add a pie crust shield so the edges don't brown too quickly, and reduce the oven to 375°F (191°C). Bake 35 to 45 minutes more, until the crust is golden brown and juices are bubbling around the edges. If the crumble topping browns too much near the end, remove the shield and tent a large piece of aluminum foil over the whole pie.",
    "Cool the pie for at least 3 full hours at room temperature before serving, which lets the filling thicken. Serve with vanilla ice cream and salted caramel sauce, if desired. Cover leftovers and refrigerate for up to 5 days.",
  ],
});
```

## Notes

- **Make ahead and freezing:** a good pie to make 1 day ahead; after it cools, cover tightly and keep at room temperature. The crust dough can be made ahead and refrigerated for up to 5 days or frozen for up to 3 months. The baked and cooled pie freezes well for up to 3 months; thaw overnight in the refrigerator and bring to room temperature before serving. The prepared filling can be frozen for up to 3 months; thaw overnight in the refrigerator before using.
- **Apples:** you need about 8 large apples. Peel and slice them to a uniform thickness of about 1/4 inch, so you don't get some solid apples and some thin, mushy ones. For the best flavor, use a variety such as Granny Smith, Honeycrisp, Fuji and/or Pink Lady.
- **Foil pie crust shield:** cut a 14-inch square of aluminum foil and fold it in half. Cut a 5-inch semi-circle out of the folded edge, then unfold. Fit the foil over the crust edges, pressing it down at the sides and leaving the center of the pie exposed. Be careful, as the pie is hot.
- **2025 update:** the original version used half of a double-crust pie dough, fewer apples (8–10 cups) and 2 Tbsp lemon juice. The updated recipe uses a single all-butter pie crust, slightly more apples and less lemon juice. To make the original, use the author's pie crust recipe (saving the second half for another pie), reduce the apples to 8–10 cups, and increase the lemon juice to 2 Tbsp.
