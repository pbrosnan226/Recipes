# S-25 Favorite a recipe

**Workflow:** [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html), step 1
**Screens:** [Recipe](../mockups/recipe.html) (the mockup doesn't show the **Favorite** button)

## Actors
- **Member**: a signed-in person (primary)

## Trigger
The Member selects **Favorite** on a recipe's page.

## Pre-conditions
- The Member is signed in.
- The Recipe page is open.
- The recipe isn't one of the Member's favorites.

## Acceptance criteria
- S-25.1 Verify that the Recipe page shows the Member a **Favorite** button when the recipe isn't one of their favorites.
- S-25.2 Verify that when the Member selects **Favorite**, the system saves a FAVORITE row for the Member and the recipe with the time added, and the button shows **Favorited**.
- S-25.3 Verify that the recipe is still shown as **Favorited** after the page is reloaded.
- S-25.4 Verify that the recipe then shows in the Member's Favorites view (S-27).
- S-25.5 Verify that when saving fails, the system doesn't keep the favorite, the button returns to **Favorite** and the page shows "Couldn't save. Try again."
- S-25.6 Verify that favoriting a recipe doesn't change the Member's Want to try mark or rating for it, and that the Member can favorite a recipe whether or not they have marked or rated it.
- S-25.7 Verify that the favorite belongs to the Member alone: another Member doesn't see it.
- S-25.8 Verify that the Recipe page shows a Visitor who isn't signed in no **Favorite** button.

## Post-conditions
- The recipe is one of the Member's favorites.
