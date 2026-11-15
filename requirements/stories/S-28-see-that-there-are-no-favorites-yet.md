# S-28 See that there are no favorites yet

**Workflow:** [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html), step 3 (no favorites)
**Screens:** [Home](../mockups/home.html) (the mockup doesn't show the Favorites view or this state)

## Actors
- **Member**: a signed-in person (primary)

## Trigger
The Member selects **Favorites** in the header.

## Pre-conditions
- The Member is signed in.
- The Member has no favorites (none ever saved, or all removed).

## Acceptance criteria
- S-28.1 Verify that when the Member selects **Favorites** and has no favorites, the system shows the Home page titled "Your favorites." with the message "No favorites yet." and no cards.
- S-28.2 Verify that "No favorites yet." disappears and the cards show once the Member favorites a recipe (S-25) and opens the Favorites view again.
- S-28.3 Verify that a favorited recipe that no longer exists on the site doesn't count as a favorite: a Member whose only favorite is such a recipe sees "No favorites yet."

- S-28.4 Verify that "No favorites yet." shows only when the Member has no favorites at all; when a course chip or search leaves none showing, the Favorites view shows "Nothing matches that. Try another word." instead (S-27.10).

## Post-conditions
- The Member sees "No favorites yet." Nothing is saved.
