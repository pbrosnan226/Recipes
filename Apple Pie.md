---
source: https://sallysbakingaddiction.com/apple-pie-recipe/
site: "Sally's Baking Addiction"
author: Sally
aliases:
  - My Best Apple Pie Recipe
created: 2026-11-12
course: Dessert
cuisine: American
servings: 8
servings_wanted: 8
prep_time: 3 hours
cook_time: 1 hour 5 minutes
total_time: 7 hours
total_minutes: 420
tags:
  - recipe
  - apple pie
---

A lattice-topped apple pie with a filling that is pre-cooked briefly on the stove for juicier, more flavorful apples.

![Slice of apple pie](images/Apple%20Pie.jpg)

Servings: `INPUT[inlineSelect(option(8), option(16)):servings_wanted]` (the source makes 8, and says it serves 8-10)

```dataviewjs
await dv.view("scripts/scale", {
  base: 8,
  ingredients: [
    { id: "crust", name: "Homemade Pie Crust or All Butter Pie Crust", text: "Homemade Pie Crust or All Butter Pie Crust (both recipes make 2 crusts, 1 for bottom and 1 for top)", q: 2, u: ["pie crust", "pie crusts"] },
    { id: "apples", name: "1/4-inch-thick apple slices (about 8 large peeled and cored apples)", text: "10 cups (1250g) 1/4-inch-thick apple slices (about 8 large peeled and cored apples)*", q: 10, u: ["cup", "cups"] },
    { id: "sugar", name: "Granulated sugar (or packed brown sugar)", text: "1/2 cup (100g) granulated sugar (or packed brown sugar)", q: 0.5, u: ["cup", "cups"] },
    { id: "flour", name: "All-purpose flour (spooned & leveled)", text: "1/4 cup (31g) all-purpose flour (spooned & leveled)", q: 0.25, u: ["cup", "cups"] },
    { id: "lemon", name: "Lemon juice", text: "1 Tablespoon (15ml) lemon juice", q: 1, u: ["Tablespoon", "Tablespoons"] },
    { id: "cinnamon", name: "Ground cinnamon", text: "1 and 1/2 teaspoons ground cinnamon", q: 1.5, u: ["teaspoon", "teaspoons"] },
    { id: "allspice", name: "Ground allspice", text: "1/4 teaspoon ground allspice", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { id: "nutmeg", name: "Ground nutmeg", text: "1/4 teaspoon ground nutmeg", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { id: "eggwash", name: "Egg wash", text: "egg wash: 1 large egg beaten with 1 Tablespoon (15ml) milk", q: 1, u: ["large egg", "large eggs"] },
    { id: "washmilk", hidden: true, q: 1, u: ["Tablespoon", "Tablespoons"] },
    { id: "coarse", name: "Coarse sugar for sprinkling on crust (optional)", text: "optional: coarse sugar for sprinkling on crust", s: "optional" },
  ],
  steps: [
    "Prepare either pie crust recipe ({crust}) through step 5. The dough needs to be refrigerated for at least 2 hours before using.",
    "On a floured work surface, roll out one of the chilled dough discs, keeping the other in the refrigerator. Turn the dough about a quarter turn every few rolls until you have a 12-inch circle. Carefully fit it into a 9-inch pie dish that is 1.5 to 2 inches deep. Tuck it in with your fingers so it is smooth, and put the pie shell in the refrigerator while you make the filling.",
    "In a large bowl, stir the apple slices ({apples}), sugar ({sugar}), flour ({flour}), lemon juice ({lemon}), cinnamon ({cinnamon}), allspice ({allspice}) and nutmeg ({nutmeg}) together until thoroughly combined.",
    "Pour the apple filling into a very large skillet or Dutch oven. Cook over medium heat, stirring gently, until the apples begin to soften, about 5 minutes. Remove from the heat and let cool slightly. This step is optional, but the author finds it makes the filling juicier and more flavorful by starting to soften the apples.",
    "Preheat the oven to 400°F (204°C).",
    "Spoon the filling into the crust; it's fine if it's still warm. It will seem like a lot of apples. Pile them high and tightly together.",
    "Take the other chilled disc of dough from the refrigerator and roll it into a 12-inch circle. Using a pastry wheel, sharp knife or pizza cutter, cut strips of dough; for the pie pictured, the author cut 12 1-inch-wide strips. Thread the strips over and under one another to weave a lattice, pulling strips back as needed. Trim the excess dough with a small paring knife or kitchen shears. Fold the overhang back toward the center of the pie and pinch the edges to join the top and bottom crusts. Crimp or flute the edges to seal.",
    "Lightly brush the top crust with the egg wash (the egg ({eggwash}) beaten with milk ({washmilk})). Sprinkle with coarse sugar ({coarse}), if using. Optionally, refrigerate the pie for 20–30 minutes to help set the lattice's shape.",
    "Bake the pie on the middle oven rack for 25 minutes, with a baking sheet on the bottom rack to catch any bubbling-over juices. After 25 minutes, leave the pie in the oven, reduce the temperature to 375°F (190°C), and add a pie crust shield (see Notes for a homemade one) to keep the edges from over-browning. Continue baking until the pie is golden brown and the filling bubbles through the lattice, 35–45 more minutes. For precision, the filling should reach about 200°F (93°C) on an instant-read thermometer. If the top browns too much near the end, remove the shield and tent a whole piece of foil over the pie.",
    "Take the pie out of the oven, set it on a cooling rack, and cool at least 3 hours before slicing and serving; the filling will be too juicy if the pie is warm when sliced.",
    "Cover and store leftover pie at room temperature for up to 1 day or in the refrigerator for up to 5 days.",
  ],
});
```

## Notes

- **Make ahead and freezing:** to make it a day ahead, cool the pie, cover tightly, and keep it at room temperature. The crust dough can be made ahead and refrigerated for up to 5 days or frozen for up to 3 months. The baked pie freezes for up to 3 months; thaw overnight in the refrigerator and bring to room temperature before serving. The prepared filling can also be frozen for up to 3 months; thaw overnight in the refrigerator before using.
- **Apples:** the author usually uses 4 Granny Smith and 4 Honeycrisp apples.
- **Foil pie crust shield:** cut a 14-inch square of aluminum foil and fold it in half. Cut a 5-inch semi-circle out of the folded edge, then unfold. Fit the foil over the crust edges, pressing it down at the sides and leaving the center of the pie exposed. Be careful, as the pie is hot.
