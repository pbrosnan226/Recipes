# S-12 Open the source or go back to the list

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 6 (changed 2026-11-14: was step 4)
**Screens:** [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) (changed 2026-11-14: replace Recipe page and Recipe list)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor selects the source link or **Back to all recipes** (changed 2026-11-14: was **Back to list**) on a Recipe page.

## Pre-conditions
- A Recipe page is open.

## Acceptance criteria
- S-12.1 Verify that when the Visitor selects the source link, the system opens the recipe's original page (its source URL).
- S-12.2 (changed 2026-11-14) Verify that when the Visitor selects **Back to all recipes**, the system opens the Home page as in S-05 (all recipes, **All** chip, sorted by name, A to Z, empty search box).
- S-12.3 (changed 2026-11-14) Verify that **Back to all recipes** appears at the top of the Recipe page (it no longer appears at the bottom in the approved mockups).

## Post-conditions
- The Visitor is on the source page or on the Home page.
