# S-85 Apply the confirmed tag cleanup and report

**Workflow:** [W-15 Clean up the recipe tags](../workflows/W-15-clean-up-the-recipe-tags.html), steps 3, 4 and 5
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: is told the result
- **Supabase**: holds the tags

## Trigger
The Owner confirms the old-to-new table (S-84).

## Pre-conditions
- The Owner has confirmed the table.

## Acceptance criteria
- S-85.1 Verify that the Extractor applies the table in one all-or-nothing change.
- S-85.2 Verify that a renamed tag is renamed on every recipe that had it.
- S-85.3 Verify that a dropped tag is removed from every recipe that had it.
- S-85.4 Verify that when two tags of one recipe become the same tag, the recipe keeps one link to it, at the position of the first one it had.
- S-85.5 Verify that each missing course tag in the table is added to its recipe.
- S-85.6 Verify that each recipe's tags are numbered again with no gaps, starting at 1.
- S-85.7 Verify that a recipe with a course has its course tag first and its other tags in their current order.
- S-85.8 Verify that no recipe is deleted and no recipe field other than its tags changes.
- S-85.9 Verify that the Extractor reports the tags renamed, merged, dropped and added, and how many recipes changed.
- S-85.10 Verify that when the change fails part way, nothing is changed and the Extractor tells the Owner.

## Post-conditions
- The confirmed table is applied and reported, or nothing was changed and the Owner has been told.
