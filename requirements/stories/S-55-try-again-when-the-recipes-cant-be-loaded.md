# S-55 Try again when the recipes can't be loaded

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 7
**Screens:** [Home](../mockups/home.html) (the failure state is described in plan.md under "States added by the database change"; it has no mockup)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Home page asks for the recipes and they can't be loaded (Supabase down, no network).

## Pre-conditions
- The Home page is open and JavaScript is on.

## Acceptance criteria
- S-55.1 Verify that when the recipes can't be loaded, the page shows "Couldn't load recipes." and a **Try again** button.
- S-55.2 Verify that while that message shows, the page shows no recipe cards.
- S-55.3 Verify that when the Visitor selects **Try again**, the page asks for the recipes again.
- S-55.4 Verify that when the recipes load after **Try again**, the page shows the Home page as S-54.2 describes and the message is gone.
- S-55.5 Verify that when the recipes still can't be loaded after **Try again**, the page still shows "Couldn't load recipes." and **Try again**.

- S-55.6 (new 2026-11-13) Verify that the site header still shows while the message shows.

## Post-conditions
- The Visitor sees the recipes, or the message with **Try again**. Nothing is saved.
