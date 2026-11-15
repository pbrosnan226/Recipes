---
source: https://sallysbakingaddiction.com/peanut-butter-banana-chocolate-chip-oatmeal-bars/
site: "Sally's Baking Addiction"
author: Sally
created: 2026-11-13
course: Breakfast
cuisine: American
servings: 16
servings_wanted: 16
prep_time: 10 mins
cook_time: 25 mins
total_time: 2 hours
total_minutes: 120
tags:
  - recipe
  - oatmeal bars
  - peanut butter bars
---

Quick, easy oatmeal bars that can be adapted many ways; a firmer take on the author's baked oatmeal.

![Peanut Butter Banana Chocolate Chip Oatmeal Bars](images/Peanut%20Butter%20Banana%20Chocolate%20Chip%20Oatmeal%20Bars.jpg)

Servings: `INPUT[inlineSelect(option(8), option(16), option(24), option(32), option(48)):servings_wanted]` (the source makes 16 bars)

```dataviewjs
await dv.view("scripts/scale", {
  base: 16,
  noun: "bars",
  nounOne: "bar",
  ingredients: [
    { id: "bananas", name: "mashed bananas", text: "1 cup (230g) mashed bananas (about 3 medium or 2 large ripe bananas)", q: 1, u: ["cup", "cups"] },
    { id: "pb", name: "creamy or crunchy peanut butter", text: "1/2 cup (125g) creamy or crunchy peanut butter*", q: 0.5, u: ["cup", "cups"] },
    { id: "sugar", name: "coconut sugar or brown sugar", text: "1/4 cup (50g) coconut sugar or brown sugar", q: 0.25, u: ["cup", "cups"] },
    { id: "applesauce", name: "unsweetened applesauce", text: "1/4 cup (60g) unsweetened applesauce*", q: 0.25, u: ["cup", "cups"] },
    { id: "milk", name: "almond milk (or any nondairy milk)", text: "1/2 cup (120ml) almond milk (or any nondairy milk)", q: 0.5, u: ["cup", "cups"] },
    { id: "oats", name: "old-fashioned whole oats or quick oats (not instant)", text: "2 and 1/2 cups (213g) old-fashioned whole oats or quick oats (not instant)", q: 2.5, u: ["cup", "cups"] },
    { id: "powder", name: "baking powder", text: "1 teaspoon baking powder", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "salt", name: "salt", text: "1/2 teaspoon salt", q: 0.5, u: ["teaspoon", "teaspoons"] },
    { id: "cinnamon", name: "ground cinnamon", text: "1 teaspoon ground cinnamon", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "vanilla", name: "pure vanilla extract", text: "1 teaspoon pure vanilla extract", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "chips", name: "semi-sweet chocolate chips", text: "1 cup (180g) semi-sweet chocolate chips (use dairy free for vegan)", q: 1, u: ["cup", "cups"] },
  ],
  steps: [
    "Preheat the oven to 350°F (177°C). Line a 9-inch square baking pan with parchment, leaving enough overhang on the sides to lift the bars out later. Set aside.",
    "In a large bowl or stand mixer bowl, mash the bananas ({bananas}). On medium speed, beat or whisk in the rest of the ingredients in the order listed: peanut butter ({pb}), sugar ({sugar}), applesauce ({applesauce}), almond milk ({milk}), oats ({oats}), baking powder ({powder}), salt ({salt}), cinnamon ({cinnamon}), vanilla ({vanilla}), and chocolate chips ({chips}). The batter will be a little thick but still pourable.",
    "Spoon or pour the batter evenly into the pan and bake 25-28 minutes, until the center is set. It will still look fairly soft.",
    "Cool in the pan at room temperature for 30-60 minutes, then refrigerate for 1 hour until chilled. The bars are hard to cut unless chilled.",
    "Lift the bars out using the parchment overhang and cut them. Drizzling melted peanut butter over each is optional. The parchment is always a little moist from soaking up moisture from the bars.",
    "Cover leftover bars tightly and refrigerate for up to 10 days.",
  ],
});
```

## Notes

- **Freezing:** Freeze the squares in single layers between sheets of parchment in a freezer-friendly container for up to 3 months. Thaw overnight in the refrigerator.
- **Peanut butter:** Any nut butter works (peanut, almond, cashew), whether natural, homemade, or processed.
- **Applesauce:** The author used to make these with 1 egg instead of the applesauce but likes the applesauce flavor a bit better. An egg or a flax egg can be used instead. For a flax egg, mix 1 Tbsp ground flax with 3 Tbsp warm water and let it gel for 10 minutes, then use it in place of the applesauce.
- **Oats:** Use certified gluten free oats to make the bars gluten free.
- **Chocolate chips:** Skip them, or swap in peanut butter chips, chopped nuts, or raisins, alone or combined.
- **Vegan:** Use dairy-free chocolate chips and nondairy milk.
- **Gluten free:** Make sure the oats are certified gluten free.
