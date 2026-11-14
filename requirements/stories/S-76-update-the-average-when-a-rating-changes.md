# S-76 Update the average when a rating changes

**Workflow:** [W-13 Rate a recipe](../workflows/W-13-rate-a-recipe.html), step 4
**Screens:** Recipe (None, not mocked up)
**Status:** Blocked on sign-in (W-06) and the Supabase migration; not built until both exist.

## Actors
- **Member**: an invited person who is signed in (primary)

## Trigger
A rating the Member gives, changes or removes is saved.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open.

## Acceptance criteria
- S-76.1 Verify that after a rating is saved, the Recipe page shows the average of all ratings for the recipe, including the Member's, to one decimal, with the new count.
- S-76.2 Verify that after a rating is changed, the average reflects the new value and the count is unchanged.
- S-76.3 Verify that after the Member's only rating is removed, the page shows "No ratings yet"; after another rating is removed, the average and count omit it.
- S-76.4 Verify that when saving fails, the average and count stay as they were.

## Post-conditions
- The average and count on the Recipe page match the saved ratings.
