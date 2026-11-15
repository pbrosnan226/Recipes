# S-59 Say when a recipe isn't there

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), "No recipe with that name" branch of step 1
**Screens:** [Recipe](../mockups/recipe.html) (the missing-recipe state is described in plan.md under "States added by the database change"; it has no mockup)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor opens `/recipe?name=<slug>` and the database has no recipe with that slug (it was deleted or never existed), or opens `/recipe` with no `name` or an empty one (changed 2026-11-13).

## Pre-conditions
- JavaScript is on, and the request to Supabase succeeds.

## Acceptance criteria
- S-59.1 Verify that when no recipe has the slug in the address, the page shows "That recipe isn't here." and a **Back to all recipes** link.
- S-59.2 Verify that the page then shows no recipe content and no "Couldn't load recipes." message.
- S-59.3 Verify that when the Visitor selects **Back to all recipes**, the system opens the Home page as S-12.2 describes.

- S-59.4 (new 2026-11-13) Verify that opening `/recipe` with no `name`, or with an empty `name`, shows "That recipe isn't here." and the **Back to all recipes** link, and makes no request for a recipe.
- S-59.5 (new 2026-11-13) Verify that the site header still shows.

## Post-conditions
- The Visitor knows the recipe isn't there and can go back to the list. Nothing is saved.
