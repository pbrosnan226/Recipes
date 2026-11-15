# S-26 Remove a favorite

**Workflow:** [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html), step 2
**Screens:** [Recipe](../mockups/recipe.html) (the mockup doesn't show the **Favorited** button)

## Actors
- **Member**: a signed-in person (primary)

## Trigger
The Member selects **Favorited** on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open.
- The recipe is one of the Member's favorites.

## Acceptance criteria
- S-26.1 Verify that the Recipe page shows the Member a **Favorited** button when the recipe is one of their favorites.
- S-26.2 Verify that when the Member selects **Favorited**, the system deletes the Member's FAVORITE row for the recipe and the button shows **Favorite**.
- S-26.3 Verify that the recipe is still shown as **Favorite** after the page is reloaded.
- S-26.4 Verify that the recipe no longer shows in the Member's Favorites view (S-27).
- S-26.5 Verify that when removing fails, the system keeps the favorite, the button returns to **Favorited** and the page shows "Couldn't save. Try again."
- S-26.6 Verify that removing a favorite doesn't change the Member's Want to try mark or rating for the recipe.

## Post-conditions
- The recipe is no longer one of the Member's favorites.
