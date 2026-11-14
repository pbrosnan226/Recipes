# S-11 Open the list filtered to a recipe's tag

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 5 (changed 2026-11-14: was step 3; continues at [W-01](../workflows/W-01-browse-the-recipe-list.html) step 5)
**Screens:** [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) (changed 2026-11-14: replace Recipe page and Recipe list)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor selects a tag on a Recipe page.

## Pre-conditions
- A Recipe page with at least one tag is open.

## Acceptance criteria
- S-11.1 Verify that each tag on the Recipe page is clickable.
- S-11.2 (changed 2026-11-14) Verify that when the Visitor selects a tag, the system opens the Home page.
- S-11.3 (changed 2026-11-14) Verify that the Home page opened this way has the tag in the search box.
- S-11.4 (changed 2026-11-14) Verify that the Home page opened this way shows only the recipes that match that tag, with the chip **All** selected, sorted by name, A to Z.

## Post-conditions
- The Visitor is on the Home page filtered to the tag.
