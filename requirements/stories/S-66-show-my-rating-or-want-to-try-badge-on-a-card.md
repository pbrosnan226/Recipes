# S-66 Show my own rating or Want to try badge on a recipe card

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 1 (added 2026-11-13)
**Screens:** Home (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Member**: anyone signed in with an account (changed 2026-11-14) (primary)

## Trigger
The Member opens the Home page.

## Pre-conditions
- The Member is signed in.
- The Home page has loaded its recipes (S-54).

## Acceptance criteria
- S-66.1 Verify that a card for a recipe the Member has rated shows the text "Your rating: " followed by their stars, for example "Your rating: 4.5".
- S-66.2 Verify that a card for a recipe the Member has marked Want to try and not rated shows a **Want to try** badge.
- S-66.3 Verify that a card for a recipe the Member has neither rated nor marked shows no "Your rating" text and no **Want to try** badge.
- S-66.4 Verify that a card shows either the Member's own rating or the **Want to try** badge, never both.
- S-66.5 Verify that every card still shows the average rating from S-65 as well.
- S-66.6 Verify that a Member sees only their own ratings and marks on the cards, not other people's.

## Post-conditions
- Nothing is saved.
