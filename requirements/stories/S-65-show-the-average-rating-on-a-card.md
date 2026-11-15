# S-65 Show the average rating on a recipe card

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 1 (added 2026-11-13)
**Screens:** Home (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Visitor**: anyone who opens the site (primary)
- **Member**: anyone signed in with an account (changed 2026-11-14) (sees the same average)

## Trigger
The Visitor opens the Home page.

## Pre-conditions
- The Home page has loaded its recipes (S-54).
- Some recipes have RATING rows and some have none.

## Acceptance criteria
- S-65.1 Verify that each recipe card shows the average of all RATING `stars` for that recipe, to one decimal, followed by the number of ratings in brackets, for example "4.5 (3)".
- S-65.2 Verify that a card for a recipe with no ratings shows "No ratings yet".
- S-65.3 Verify that a Visitor who isn't signed in sees the average on the cards.
- S-65.4 Verify that the card doesn't show who gave which rating.

## Post-conditions
- Nothing is saved.
