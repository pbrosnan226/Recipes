---
source: https://www.recipetineats.com/honey-garlic-chicken/
site: "RecipeTin Eats"
author: Nagi
aliases:
  - Honey Garlic Chicken Breast
created: 2026-09-24
course: Mains
cuisine: Western
servings: 4
servings_wanted: 4
prep_time: 4 minutes
cook_time: 8 minutes
total_time: 12 minutes
tags:
  - recipe
  - chicken
  - quick
---

Chicken breast cut into steaks, dusted with flour, seared, then finished in a honey, garlic, soy and vinegar sauce. The flour gives the sauce a crust to cling to.

![Honey garlic chicken breast](https://www.recipetineats.com/tachyon/2020/02/Honey-Garlic-Chicken-Breast_5-SQ.jpg)

Servings: `INPUT[inlineSelect(option(2), option(4), option(6), option(8), option(12)):servings_wanted]` (the source makes 4)

```dataviewjs
await dv.view("scripts/scale", {
  base: 4,
  ingredients: [
    { id: "chicken", name: "Chicken breast, boneless and skinless", text: "500g / 1 lb (2 pieces)", pre: 500, q: 1, u: "lb" },
    { id: "steaks", hidden: true, q: 4, u: ["steak", "steaks"] },
    { id: "saltpepper", name: "Salt and pepper", text: "to taste", s: "to taste" },
    { id: "flour", name: "Flour (see notes)", text: "¼ cup", q: 0.25, u: ["cup", "cups"] },
    { id: "butter", name: "Unsalted butter", text: "3½ tbsp (50g), or 2½ tbsp olive oil", q: 3.5, u: "tbsp" },
    { id: "garlic", name: "Garlic cloves, minced", text: "2", q: 2 },
    { id: "vinegar", name: "Apple cider vinegar (or another clear vinegar)", text: "1½ tbsp", q: 1.5, u: "tbsp" },
    { id: "soy", name: "Soy sauce, light or all purpose (see notes)", text: "1 tbsp", q: 1, u: "tbsp" },
    { id: "honey", name: "Honey (or maple syrup)", text: "⅓ cup", q: 1 / 3, u: ["cup", "cups"] },
  ],
  steps: [
    "Cut the breasts ({chicken}) in half horizontally to make {steaks} in total. Sprinkle each side with salt and pepper.",
    "Put the flour ({flour}) in a shallow dish. Coat the chicken in flour and shake off the excess.",
    "Melt most of the butter ({butter}) in a large skillet over high heat, holding back about 1 tsp for later.",
    "Put the chicken in the skillet and cook 2 to 3 minutes until golden. Turn and cook the other side for 1 minute.",
    "Turn the heat down slightly, to medium-high.",
    "Make a bit of room in the pan, add the garlic ({garlic}), and top it with the remaining dab of butter. Stir the garlic briefly once the butter melts.",
    "Add the vinegar ({vinegar}), soy sauce ({soy}) and honey ({honey}). Stir or shake the pan to combine. Bring the sauce to a simmer, then simmer for 1 minute, or until slightly thickened.",
    "Turn the chicken to coat it in the sauce. If the sauce gets too thick, add a touch of water and stir.",
    "Take it off the stove immediately. Plate the chicken and drizzle the remaining sauce over the top.",
  ],
});
```

## Notes

- **Gluten free:** use cornflour/cornstarch in place of the flour. It won't brown quite as evenly, but once it's covered in sauce you won't know the difference.
- **Soy sauce:** light or all-purpose soy sauce suits this recipe. Nagi doesn't recommend dark soy sauce — the flavour will dominate. The bottle label will say if it's dark.
- **Other proteins:** this sauce suits any protein you can sear in a pan, including chops, steaks and cutlets. Follow the recipe as written, including dusting with flour, and just adjust the cooking time — the trick is to add the garlic and the sauce ingredients before the protein is cooked through, so it finishes cooking as the sauce reduces to a syrupy consistency.
    - **Tofu:** use firm tofu, cut into "steaks" about 0.75cm / ¼ inch thick. Pat dry, spray or rub with oil, sprinkle with salt and pepper, then coat lightly with flour. Coat the base of a skillet with oil over medium-high heat and cook the tofu 1 minute each side until crispy, then remove to paper towels. Make the sauce in a small saucepan or skillet using just 2 tbsp (30g) butter instead of 3½ tbsp, following the recipe from step 5, and serve over the crispy tofu.
    - **Prawns/shrimp:** use large prawns, thawed, drained well and patted dry if frozen. Coat lightly with flour as in the recipe, sear 1 minute on the first side, then just 30 seconds on the other, before carrying on from step 5.
    - **Fish:** cook as for the chicken breast. Nagi rates this sauce highly with fish, and suggests it for economical fish because the flavour is strong — for expensive fish she'd let the fish come through with a more delicate sauce.
- The nutrition below assumes you scrape every drop of sauce out of the pan.

## Nutrition

Per serving (166 g), approximate (calculated automatically by the source site):

| Calories | Carbs | Protein | Fat  | Sat. fat | Sugar | Sodium |
| -------- | ----- | ------- | ---- | -------- | ----- | ------ |
| 323 kcal | 23 g  | 28 g    | 13 g | 7 g      | 21 g  | 400 mg |
