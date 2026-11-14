# S-58 Try again when a recipe can't be loaded

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), error branch of step 1
**Screens:** [Recipe](../mockups/recipe.html) (the failure state is described in plan.md under "States added by the database change"; it has no mockup)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Recipe page asks for the recipe and it can't be loaded (Supabase down, no network).

## Pre-conditions
- A Recipe page address is open and JavaScript is on.

## Acceptance criteria
- S-58.1 Verify that when the recipe can't be loaded, the page shows "Couldn't load recipes." and a **Try again** button.
- S-58.2 Verify that while that message shows, the page shows no recipe content.
- S-58.3 Verify that when the Visitor selects **Try again**, the page asks for the same recipe again.
- S-58.4 Verify that when the recipe loads after **Try again**, the page shows the recipe as S-57.3 describes and the message is gone.
- S-58.5 Verify that when the recipe still can't be loaded after **Try again**, the page still shows "Couldn't load recipes." and **Try again**.
- S-58.6 Verify that a request that fails is told apart from a request that succeeds and finds no recipe: only the failure shows "Couldn't load recipes." (the other case is S-59).

- S-58.7 (new 2026-11-13) Verify that the site header still shows while the message shows.

## Post-conditions
- The Visitor sees the recipe, or the message with **Try again**. Nothing is saved.
