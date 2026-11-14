# S-74 Change my rating

**Workflow:** [W-13 Rate a recipe](../workflows/W-13-rate-a-recipe.html), step 2
**Screens:** Recipe (None, not mocked up)
**Status:** Blocked on sign-in (W-06) and the Supabase migration; not built until both exist.

## Actors
- **Member**: an invited person who is signed in (primary)

## Trigger
The Member taps or clicks a star in the half-star row on a recipe they have already rated.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open for a recipe the Member has rated.

## Acceptance criteria
- S-74.1 Verify that when the Member taps or clicks a half or a whole of a star that gives a different rating from their current one, the system replaces the Member's RATING for the recipe with the new value and the row shows the new rating.
- S-74.2 Verify that the Member still has only one RATING for the recipe after the change.
- S-74.3 Verify that when the Member taps or clicks the half or whole that gives their current rating, nothing changes and nothing is saved.
- S-74.4 Verify that when saving fails, the system keeps the old rating, the row returns to the old rating, and the page shows "Couldn't save. Try again."

## Post-conditions
- The Member's RATING for the recipe holds the new value.
