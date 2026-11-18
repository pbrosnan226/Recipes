# S-84 Propose the tag cleanup and get the Owner's confirmation

**Workflow:** [W-15 Clean up the recipe tags](../workflows/W-15-clean-up-the-recipe-tags.html), steps 1, 2 and 5
**Screens:** None (chat)

## Actors
- **Owner**: asks for the cleanup and confirms, changes or cancels (primary)
- **Extractor**: the `recipe-extract` skill, run by Claude

## Trigger
The Owner asks Claude to clean up the tags of the existing recipes.

## Pre-conditions
- The recipes are in the database.

## Acceptance criteria
- S-84.1 Verify that the Extractor reads every tag and the recipes that use it, changing nothing.
- S-84.2 Verify that the Extractor shows the whole old-to-new table, with every existing tag marked keep, rename (with the new name) or drop, and the recipes that use it.
- S-84.3 Verify that the Extractor proposes under the tag rules (S-81).
- S-84.4 Verify that the table shows the recipe's course as a tag to add for each recipe with a course that lacks it.
- S-84.5 Verify that the table adds no course tag to a recipe with no course.
- S-84.6 Verify that the table adds no protein, cuisine, healthy or holiday tag to any recipe.
- S-84.7 Verify that every new name in the table passes the same code checks as a new recipe (S-82).
- S-84.8 Verify that if a new name in the table would fail those checks, the Extractor tells the Owner which tag and changes nothing.
- S-84.9 Verify that the Extractor asks the Owner to confirm, ask for changes or cancel.
- S-84.10 Verify that when the Owner asks for changes, the Extractor shows a new table.
- S-84.11 Verify that nothing in the database changes until the Owner confirms.
- S-84.12 Verify that when the Owner cancels, the Extractor changes nothing and tells the Owner nothing was changed.

## Post-conditions
- The Owner has confirmed a table, or nothing was changed and the Owner has been told.
