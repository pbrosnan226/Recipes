# S-72 Take a recipe off my Want to try list

**Workflow:** [W-12 Mark a recipe want to try](../workflows/W-12-mark-a-recipe-want-to-try.html), step 2
**Screens:** Recipe (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Member**: anyone signed in with an account (changed 2026-11-14) (primary)

## Trigger
The Member selects **On your list** on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open for a recipe the Member has marked Want to try.

## Acceptance criteria
- S-72.1 Verify that the Recipe page shows the button reading "On your list" for a recipe the Member has marked.
- S-72.2 Verify that when the Member selects **On your list**, the system deletes the Member's WANT_TO_TRY row for the recipe and the button returns to **Want to try**.
- S-72.3 Verify that the recipe then shows no **Want to try** badge on its card and no longer shows under the **Want to try** chip.
- S-72.4 Verify that when removing fails, the system keeps the mark, the button stays "On your list", and the page shows "Couldn't save. Try again."

## Post-conditions
- The recipe is no longer on the Member's Want to try list.
