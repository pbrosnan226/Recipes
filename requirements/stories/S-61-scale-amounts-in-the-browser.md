# S-61 Scale the amounts in the browser

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 2
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
A Recipe page shows a recipe, or the Visitor changes its servings dropdown (S-10).

## Pre-conditions
- A Recipe page has loaded a recipe and its ingredient rows (S-57).

## Acceptance criteria
- S-61.1 Verify that the amounts in the **Ingredients** list and in the steps are computed in the browser from the recipe's ingredient rows, and that changing the dropdown makes no request to Supabase or to a server of the site's own.
- S-61.2 Verify that an ingredient with a quantity is scaled by the chosen servings divided by the recipe's base amount.
- S-61.3 Verify that an ingredient with fixed text shows that text unchanged at every size, in place of any quantity.
- S-61.4 Verify that the scaled amount is written with the fraction glyphs and rounding of `scripts/scale/view.js`: for example 0.5 reads "½", 1⅓ reads "1 ⅓", 1/16 reads "1/16", and 0.3 reads "about ¼".
- S-61.5 Verify that a range (a quantity and a high quantity) shows as the low amount, an en dash and the high amount, without "about" on the low amount.
- S-61.6 Verify that the unit is the singular form when the scaled amount is 1 or less, and the plural form when it is more than 1 (for a range, by the high amount), for ingredients that have both forms.
- S-61.7 Verify that an ingredient with grams before shows "Ng / amount", where N is the grams scaled and rounded to a whole number.
- S-61.8 Verify that lead text (such as "up to") is shown before the scaled amount.
- S-61.9 Verify that an ingredient marked hidden is left out of the **Ingredients** list and its scaled amount is still used in the steps.
- S-61.10 Verify that each `{key}` in a step is replaced by the scaled amount of that ingredient, and that a `{key}` that is not one of the ingredients' keys is left as written.
- S-61.11 Verify that for every recipe in the database and every servings option it offers, the amounts in the **Ingredients** list and in the steps are identical to what `scripts/scale/view.js` produces for the same ingredient data and servings.
- S-61.12 Verify that the browser code is separate from `scripts/scale/view.js`, which is not loaded in the browser and is not changed.

## Post-conditions
- The page shows amounts for the chosen servings. Nothing is saved.
