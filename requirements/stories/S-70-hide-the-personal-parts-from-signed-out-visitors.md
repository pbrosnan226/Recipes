# S-70 Hide the want-to-try and rating parts from signed-out Visitors

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), steps 1 and 2 (added 2026-11-13); [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 1 (added 2026-11-13); [W-12](../workflows/W-12-mark-a-recipe-want-to-try.html) and [W-13](../workflows/W-13-rate-a-recipe.html), errors and edge cases
**Screens:** Home, Recipe (None, not mocked up)
**Status:** Blocked on sign-in (W-06) and the Supabase migration; not built until both exist.

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)
- **Member**: an invited person who is signed in

## Trigger
The Visitor opens the Home page or a Recipe page.

## Pre-conditions
- The Visitor isn't signed in.

## Acceptance criteria
- S-70.1 Verify that the Home page shows a Visitor who isn't signed in no second chip row (**All**, **Want to try**, **Rated**).
- S-70.2 Verify that a Visitor who isn't signed in sees no "Your rating" text and no **Want to try** badge on the cards.
- S-70.3 Verify that the Recipe page shows a Visitor who isn't signed in no **Want to try** button, no half-star row and no **Remove rating** button.
- S-70.4 Verify that a Visitor who isn't signed in still sees the average rating on the cards and on the Recipe page (S-65, S-69).
- S-70.5 Verify that when a Member is signed in, the second chip row, the cards' personal parts and the Recipe page controls are shown (S-66, S-68, S-71, S-73).

## Post-conditions
- Nothing is saved.
