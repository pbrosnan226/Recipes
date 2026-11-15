# S-71 Mark a recipe Want to try

**Workflow:** [W-12 Mark a recipe want to try](../workflows/W-12-mark-a-recipe-want-to-try.html), step 1
**Screens:** Recipe (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Member**: anyone signed in with an account (changed 2026-11-14) (primary)

## Trigger
The Member selects **Want to try** on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open.
- The Member hasn't rated the recipe and hasn't marked it Want to try.

## Acceptance criteria
- S-71.1 Verify that the Recipe page shows the Member a **Want to try** button when the Member has neither rated nor marked the recipe.
- S-71.2 Verify that when the Member selects **Want to try**, the system saves a WANT_TO_TRY row for the Member and the recipe with the time added, and the button reads "On your list".
- S-71.3 Verify that the recipe then shows the **Want to try** badge on its Home card and under the **Want to try** chip (S-66, S-68).
- S-71.4 Verify that when saving fails, the system doesn't keep the mark, the button returns to **Want to try**, and the page shows "Couldn't save. Try again."
- S-71.5 Verify that the mark belongs to the Member alone: another Member doesn't see it.
- S-71.6 Verify that the Recipe page shows no **Want to try** button for a recipe the Member has rated.

## Post-conditions
- The recipe is on the Member's Want to try list.
