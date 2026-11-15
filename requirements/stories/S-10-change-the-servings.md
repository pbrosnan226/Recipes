# S-10 Change the servings

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 2
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) (changed 2026-11-14: replace Recipe page)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor changes the servings dropdown on a Recipe page.

## Pre-conditions
- A Recipe page is open.

## Acceptance criteria
- S-10.1 (changed 2026-11-13: the recipe's serving options in position order, not the note's) Verify that the Visitor can choose any option the recipe defines in the servings dropdown.
- S-10.2 (changed 2026-11-14; changed 2026-11-13: computed in the browser, see S-61) Verify that when the Visitor chooses an option, the system rescales the amounts in the **Ingredients** list and the amounts quoted in the steps, without leaving the page.
- S-10.3 Verify that an ingredient with a quantity is scaled by chosen servings divided by what the source makes.
- S-10.4 Verify that an ingredient with only fixed text shows that text at every size.
- S-10.5 (changed 2026-11-13: the browser code reproduces view.js, see S-61.11; "note data" is now the recipe's ingredient rows) Verify that the amounts shown, including fraction glyphs (such as ¼, ½, ⅓), the word "about" for approximate amounts, ranges, "Ng / amount" pairs, any lead text such as "up to", and singular or plural units, are identical to what `scripts/scale/view.js` shows for the same ingredient data and servings.
- S-10.6 (changed 2026-11-14: the **As written** column is dropped) Verify that the nutrition values don't change when the dropdown changes.
- S-10.7 Verify that text in the steps that isn't an ingredient key doesn't change.
- S-10.8 (changed 2026-11-13: the recipe, not the note, defines the options) Verify that a recipe that scales by batches shows the batch dropdown the recipe defines and rescales the same way.
- S-10.9 Verify that the dropdown starts at what the source makes every time the page is loaded, and the choice isn't remembered between visits.

## Post-conditions
- The page shows amounts for the chosen servings. Nothing is saved.
