---
source: https://sallysbakingaddiction.com/triple-chocolate-layer-cake/
site: "Sally's Baking Addiction"
author: Sally
aliases:
  - Deliciously Moist Chocolate Layer Cake
created: 2026-11-13
course: Dessert
cuisine: American
servings: 12
servings_wanted: 12
prep_time: 30 mins
cook_time: 25 mins
total_time: 4 hours
total_minutes: 240
tags:
  - recipe
  - cake
  - chocolate cake
---

A moist, fudgy-yet-light chocolate layer cake topped with chocolate buttercream and chocolate chips; it can also be made as a sheet cake.

![Triple Chocolate Layer Cake](images/Triple%20Chocolate%20Layer%20Cake.jpg)

Servings: `INPUT[inlineSelect(option(6), option(12), option(18), option(24), option(36)):servings_wanted]` (the source makes 12, and also says "serves 12-16")

```dataviewjs
await dv.view("scripts/scale", {
  base: 12,
  ingredients: [
    { id: "flour", name: "all-purpose flour", text: "1 and 3/4 cups (219g) all-purpose flour (spooned & leveled)", q: 1.75, u: ["cup", "cups"] },
    { id: "cocoa", name: "unsweetened natural cocoa powder", text: "3/4 cup (64g) unsweetened natural cocoa powder", q: 0.75, u: ["cup", "cups"] },
    { id: "sugar", name: "granulated sugar", text: "1 and 3/4 cups (350g) granulated sugar", q: 1.75, u: ["cup", "cups"] },
    { id: "soda", name: "baking soda", text: "2 teaspoons baking soda", q: 2, u: ["teaspoon", "teaspoons"] },
    { id: "powder", name: "baking powder", text: "1 teaspoon baking powder", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "salt", name: "salt", text: "1 teaspoon salt", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "espresso", name: "espresso powder (optional)", text: "2 teaspoons espresso powder (optional)", q: 2, u: ["teaspoon", "teaspoons"] },
    { id: "oil", name: "vegetable oil", text: "1/2 cup (113g/120ml) vegetable oil (or canola oil or melted coconut oil)", q: 0.5, u: ["cup", "cups"] },
    { id: "eggs", name: "eggs", text: "2 large eggs, at room temperature", q: 2, u: ["large egg", "large eggs"] },
    { id: "vanilla", name: "pure vanilla extract", text: "2 teaspoons pure vanilla extract", q: 2, u: ["teaspoon", "teaspoons"] },
    { id: "buttermilk", name: "buttermilk", text: "1 cup (240g/ml) buttermilk, at room temperature", q: 1, u: ["cup", "cups"] },
    { id: "coffee", name: "hot coffee or hot water", text: "1 cup (240g/ml) freshly brewed strong hot coffee or hot water", q: 1, u: ["cup", "cups"] },
    { id: "butter", name: "unsalted butter", text: "1 and 1/4 cups (282g) unsalted butter, softened to room temperature", q: 1.25, u: ["cup", "cups"] },
    { id: "csugar", name: "confectioners' sugar", text: "3 and 1/2 cups (420g) confectioners' sugar", q: 3.5, u: ["cup", "cups"] },
    { id: "fcocoa", name: "unsweetened cocoa powder (frosting)", text: "3/4 cup (64g) unsweetened cocoa powder (natural or Dutch-process)", q: 0.75, u: ["cup", "cups"] },
    { id: "cream", name: "heavy cream", text: "3–5 Tablespoons (45–75g/ml) heavy cream (or half-and-half or milk), at room temperature", q: [3, 5], u: ["Tablespoon", "Tablespoons"] },
    { id: "fvanilla", name: "pure vanilla extract (frosting)", text: "1 teaspoon pure vanilla extract", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "fsalt", name: "salt (frosting)", text: "1/4 teaspoon salt", q: 0.25, u: ["teaspoon", "teaspoons"] },
    { id: "chips", name: "semi-sweet chocolate chips (optional, for decoration)", text: "optional for decoration: semi-sweet chocolate chips", s: "optional, for decoration" },
  ],
  steps: [
    "Preheat the oven to 350°F (177°C). Grease two 9-inch cake pans, line them with parchment rounds, and grease the parchment too.",
    "Whisk the flour ({flour}), cocoa powder ({cocoa}), sugar ({sugar}), baking soda ({soda}), baking powder ({powder}), salt ({salt}), and espresso powder ({espresso}, if using) in a large bowl and set aside. With a mixer (or a whisk), mix the oil ({oil}), eggs ({eggs}), and vanilla ({vanilla}) on medium-high speed until combined. Mix in the buttermilk ({buttermilk}). Add the dry ingredients and the hot coffee or water ({coffee}) and whisk or beat on low speed until fully combined. The batter is thin.",
    "Divide the batter evenly between the pans. Bake 23–26 minutes, until a toothpick in the center comes out clean. The cooled cakes may sink slightly in the center even when fully baked, which is normal.",
    "Cool the cakes in their pans on a rack for 1 hour. Run a knife around the edges, take the cakes out of the pans, peel off the parchment, and let them finish cooling on the rack.",
    "For the frosting, beat the butter ({butter}) with a paddle attachment on medium speed for about 2 minutes, until creamy. Add the confectioners' sugar ({csugar}), cocoa powder ({fcocoa}), 3 Tablespoons of the heavy cream, vanilla ({fvanilla}), and salt ({fsalt}). Beat on low for 30 seconds, then on high for 1 full minute without over-whipping. If it's too thin, add 1/4 cup more confectioners' sugar or cocoa powder; if too thick, add 1–2 more Tablespoons of cream. Taste, and add another pinch of salt if desired.",
    "If the cooled cakes are domed, slice a thin layer off the tops with a serrated knife to level them, and discard the trimmings or crumble them over the finished cake. Set one layer on a cake stand or plate and cover the top with frosting. Add the second layer and spread the remaining frosting over the top and sides. Garnish with chocolate chips if desired.",
    "Refrigerate the cake uncovered for at least 30–60 minutes before slicing so it sets. Then serve, or keep refrigerating for up to 4–6 hours before serving. It can be served at room temperature or chilled.",
    "Cover leftover cake tightly and refrigerate for up to 5 days.",
  ],
});
```

## Notes

- **Make ahead and freezing:** Make the cake through step 4. Wrap the cooled layers tightly and refrigerate up to 2 days or freeze up to 3 months. Bring to room temperature, then continue with step 5. The buttercream can be made 2–3 days ahead; cover and refrigerate, and bring to room temperature before using. The frosted cake freezes up to 3 months; thaw overnight in the refrigerator, then serve cold or at room temperature.
- **3-layer cake:** Divide the batter between three 8-inch pans in step 1 and bake 22–25 minutes, until a toothpick comes out clean. The frosting is enough for 3 layers. For extra frosting, multiply the buttercream ingredients by 1.5.
- **Cocoa powder:** Use natural cocoa powder in the cake, not Dutch-process. Either kind works in the frosting, since it has no leavening.
- **Buttermilk:** Required. To make a substitute, put 2 teaspoons white vinegar or lemon juice in a liquid measuring cup, add room-temperature whole milk up to 1 cup, stir, and let sit 5 minutes. Lower-fat or nondairy milks work in a pinch, but the cake will be less moist and rich.
- **Sour cream version:** Cut the buttermilk and hot coffee to 1/2 cup (120g/ml) each and add 3/4 cup (180g) room-temperature full-fat sour cream with the wet ingredients. The crumb is slightly sturdier, and holds up under fondant.
- **Batter amount:** The recipe makes about 6 cups of batter.
- **Room-temperature ingredients:** Bring all refrigerated items to room temperature so the batter mixes evenly.
- **Espresso powder / coffee:** They deepen the chocolate flavor and won't make the cake taste like coffee. Decaf is fine, and instant coffee powder can replace the espresso powder in the same amount. Without coffee, leave out the espresso powder and use hot water.
- **Bundt pan:** Use the author's chocolate cream cheese Bundt cake recipe without the cream cheese filling, reducing the buttermilk there to 1/4 cup and increasing the sour cream to 1 cup.
- **9×13-inch pan:** Same oven temperature, about 35–40 minutes of baking.
- Adapted from Ina Garten, originally from Hershey's.
