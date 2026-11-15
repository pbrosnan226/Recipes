# S-73 Rate a recipe

**Workflow:** [W-13 Rate a recipe](../workflows/W-13-rate-a-recipe.html), step 1
**Screens:** Recipe (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Member**: anyone signed in with an account (changed 2026-11-14) (primary)

## Trigger
The Member taps or clicks a star in the half-star row on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open for a recipe the Member hasn't rated. The recipe may or may not be marked Want to try.

## Acceptance criteria
- S-73.1 Verify that the Recipe page shows the Member a row of five stars, empty when the Member hasn't rated the recipe.
- S-73.2 Verify that when the Member taps or clicks the left half of a star, the system saves a RATING of that star number minus 0.5 (for example the left half of the fourth star saves 3.5).
- S-73.3 Verify that when the Member taps or clicks the right half of a star, the system saves a RATING of that star number (for example the right half of the fourth star saves 4).
- S-73.4 Verify that after saving, the row shows the Member's rating as filled stars, a half star for a half rating, and empty stars for the rest.
- S-73.5 Verify that when the Member rates a recipe marked Want to try, the system deletes the Member's WANT_TO_TRY row for it, and the **Want to try** button is no longer shown.
- S-73.6 Verify that a recipe that isn't marked Want to try can be rated.
- S-73.7 Verify that when saving fails, the system doesn't keep the rating, the row returns to its old state, the Want to try mark is unchanged, and the page shows "Couldn't save. Try again."
- S-73.8 Verify that the rating belongs to the Member alone: other Members see it only inside the average.
- S-73.9 Verify that the star row is operated by tapping or clicking only and has no keyboard control.

## Post-conditions
- The Member has one RATING for the recipe, and no WANT_TO_TRY row for it.
