# S-57 Load a recipe on the Recipe page from the database

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 1
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Visitor**: anyone who opens the site (primary)
- **Supabase**: sends the recipe

## Trigger
The Visitor selects a recipe's card on the Home page, or opens the address `/recipe?name=<slug>`.

## Pre-conditions
- The site is live with the Supabase settings published (S-63).
- JavaScript is on in the Visitor's browser.

## Acceptance criteria
- S-57.1 Verify that when the Visitor selects a card, the system opens `/recipe?name=<slug>`, where `<slug>` is that recipe's slug (for example `/recipe?name=french-toast`).
- S-57.2 Verify that the Recipe page asks Supabase, with the public read-only key, for the recipe whose slug is the name in the address, together with its course, tags, serving options, ingredients, steps, notes and nutrients.
- S-57.3 Verify that the page then shows the recipe as S-09 describes, taken from the database.
- S-57.4 Verify that opening `/recipe?name=<slug>` directly (typed, bookmarked or reloaded) shows the same recipe as selecting its card.
- S-57.5 Verify that one Recipe page serves every recipe: the site publishes no separate page for each recipe.
- S-57.6 Verify that the page makes no request that writes to Supabase.
- S-57.7 Verify that a recipe changed in the Supabase dashboard shows its new content the next time its page is loaded, with no push and no rebuild.

- S-57.8 (new 2026-11-13) Verify that while the recipe is loading, the page shows nothing extra, and that the site header shows in every state.
- S-57.9 (new 2026-11-13) Verify that the servings dropdown shows the recipe's servings label and its serving options (S-09.7), and that tags show in their position order (S-09.4) and notes with their nesting (S-09.15).

## Post-conditions
- The Visitor sees the whole recipe at the source's servings. Nothing is saved.
