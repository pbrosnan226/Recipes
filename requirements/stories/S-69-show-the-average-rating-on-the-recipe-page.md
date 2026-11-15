# S-69 Show the average rating on the Recipe page

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 1 (added 2026-11-13)
**Screens:** Recipe (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Visitor**: anyone who opens the site (primary)
- **Member**: anyone signed in with an account (changed 2026-11-14) (sees the same average)

## Trigger
The Visitor opens a recipe's page.

## Pre-conditions
- The recipe has loaded (S-57).

## Acceptance criteria
- S-69.1 Verify that the Recipe page shows the average of all RATING `stars` for the recipe, to one decimal, followed by the number of ratings in brackets, for example "4.5 (3)".
- S-69.2 Verify that a recipe with no ratings shows "No ratings yet".
- S-69.3 Verify that a Visitor who isn't signed in sees the average.
- S-69.4 Verify that the page doesn't show who gave which rating.

## Post-conditions
- Nothing is saved.
