# S-75 Remove my rating

**Workflow:** [W-13 Rate a recipe](../workflows/W-13-rate-a-recipe.html), step 3
**Screens:** Recipe (None, not mocked up)
**Status:** Blocked on sign-in (W-06) and the Supabase migration; not built until both exist.

## Actors
- **Member**: an invited person who is signed in (primary)

## Trigger
The Member selects **Remove rating** on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open for a recipe the Member has rated.

## Acceptance criteria
- S-75.1 Verify that the Recipe page shows **Remove rating** only when the Member has rated the recipe.
- S-75.2 Verify that when the Member selects **Remove rating**, the system deletes the Member's RATING for the recipe and the row shows empty stars.
- S-75.3 Verify that after the rating is removed the recipe is unmarked: the system doesn't bring back a Want to try mark, and the Recipe page shows the **Want to try** button again.
- S-75.4 Verify that the recipe no longer shows "Your rating" on its card and no longer shows under the **Rated** chip.
- S-75.5 Verify that when removing fails, the system keeps the rating, the row keeps the rating, **Remove rating** stays, and the page shows "Couldn't save. Try again."

## Post-conditions
- The Member has no RATING and no WANT_TO_TRY row for the recipe.
