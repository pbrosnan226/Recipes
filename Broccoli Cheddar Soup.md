---
source: https://www.seriouseats.com/broccoli-cheddar-cheese-soup-food-lab-recipe
site: "Serious Eats"
author: J. Kenji López-Alt
aliases:
  - Broccoli Cheese Soup
created: 2026-10-28
course: Soup
servings: 6
servings_wanted: 6
prep_time: 5 mins
cook_time: 50 mins
total_time: 55 mins
total_minutes: 55
tags:
  - recipe
---

A creamy, filling soup with broccoli flavor built in layers.

![Broccoli cheddar soup](images/Broccoli%20Cheddar%20Soup.jpg)

Servings: `INPUT[inlineSelect(option(3), option(6), option(9), option(12), option(18)):servings_wanted]` (the source makes 6)

```dataviewjs
await dv.view("scripts/scale", {
  base: 6,
  ingredients: [
    { id: "broccoli", name: "broccoli", text: "1 1/2 pounds (700 g) broccoli", q: 1.5, u: ["pound", "pounds"] },
    { id: "oil", name: "vegetable oil", text: "2 tablespoons (30 ml) vegetable oil", q: 2, u: ["tablespoon", "tablespoons"] },
    { id: "saltpepper", name: "kosher salt and freshly ground black pepper", text: "Kosher salt and freshly ground black pepper", s: "as written" },
    { id: "butter", name: "unsalted butter", text: "3 tablespoons (45 g) unsalted butter", q: 3, u: ["tablespoon", "tablespoons"] },
    { id: "onion", name: "onion", text: "1 medium onion, sliced (about 6 ounces; 170 g)", q: 1 },
    { id: "carrot", name: "carrot", text: "1 medium carrot, peeled and finely diced (about 4 ounces; 120 g)", q: 1 },
    { id: "garlic", name: "garlic", text: "3 medium cloves garlic, thinly sliced", q: 3, u: ["clove", "cloves"] },
    { id: "water", name: "water or chicken stock", text: "2 cups (475 ml) water, or homemade or store-bought low-sodium chicken stock", q: 2, u: ["cup", "cups"] },
    { id: "milk", name: "whole milk", text: "3 cups (700 ml) whole milk", q: 3, u: ["cup", "cups"] },
    { id: "potato", name: "russet potato", text: "1 small russet potato, peeled and sliced (about 4 ounces; 120 g)", q: 1 },
    { id: "cheddar", name: "sharp cheddar cheese", text: "12 ounces (340 g) sharp cheddar cheese, grated (see notes)", q: 12, u: ["ounce", "ounces"] },
    { id: "american", name: "deli-style American cheese", text: "8 ounces (240 g) deli-style American cheese, diced (see notes)", q: 8, u: ["ounce", "ounces"] },
    { id: "mustard", name: "mustard powder", text: "1 teaspoon (3 g) mustard powder", q: 1, u: ["teaspoon", "teaspoons"] },
    { id: "hotsauce", name: "hot sauce", text: "Dash of hot sauce, such as Frank's RedHot", s: "dash" },
  ],
  steps: [
    "Split the broccoli ({broccoli}) into florets and stems. Cut the florets into bite-size pieces and set them aside. Chop the stems roughly and keep them separate.",
    "Heat the oil ({oil}) in a large Dutch oven over high heat until it shimmers. Add the florets and leave them undisturbed until charred underneath, about 1 minute. Stir, season with salt and pepper, and keep cooking and stirring now and then until tender and charred in spots, about 1 minute more. Move to a rimmed baking sheet to cool.",
    "Put the Dutch oven back over medium heat. Add the butter ({butter}), onion ({onion}), carrot ({carrot}), and broccoli stems, and season with salt and pepper. Cook, stirring often, until tender but not browned, about 5 minutes, lowering the heat if needed. Add the garlic ({garlic}) and cook, stirring, until fragrant, about 30 seconds.",
    "Add the water or chicken stock ({water}), milk ({milk}), and potato ({potato}), and bring to a boil over high heat. Turn down to a bare simmer and cook, stirring now and then, until the broccoli and potato are completely tender, about 30 minutes.",
    "Toss both cheeses (cheddar {cheddar}, American {american}) with the mustard powder ({mustard}) in a large bowl. Blend the soup until completely smooth with an immersion blender, or in batches in a countertop blender, adding the cheese a handful at a time. Stir in the hot sauce ({hotsauce}) and adjust the salt and pepper. Stir in the reserved florets and pulse the blender a few more times, so a few pieces break down but most stay bite-size. Serve right away.",
  ],
});
```

## Notes

- Deli-style American cheese can be found at the supermarket deli counter.
- Any mix of cheddar, American, and other young, moist cheeses, such as Jack or colby, works.

## Nutrition

Per serving:

| Calories | Carbs | Fiber | Sugars | Protein | Fat | Sat. fat | Cholesterol | Vitamin C | Sodium | Calcium | Iron | Potassium |
| -------- | ----- | ----- | ------ | ------- | --- | -------- | ----------- | --------- | ------ | ------- | ---- | --------- |
| 615 | 29g | 5g | 13g | 30g | 44g | 23g | 115mg | 81mg | 1509mg | 1157mg | 2mg | 941mg |
