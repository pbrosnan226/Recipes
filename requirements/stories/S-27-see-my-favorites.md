# S-27 See my favorites

**Workflow:** [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html), step 3
**Screens:** [Home](../mockups/home.html) (the mockup doesn't show the Favorites view)

## Actors
- **Member**: a signed-in person (primary)

## Trigger
The Member selects **Favorites** in the header.

## Pre-conditions
- The Member is signed in.
- The Member has at least one favorite (for none, see S-28).

## Acceptance criteria
- S-27.1 Verify that when the Member selects **Favorites** in the header, the system shows the Home page titled "Your favorites."
- S-27.2 Verify that the Favorites view shows a card only for each recipe the Member has favorited, and no other recipe.
- S-27.3 Verify that the Favorites view shows the same course chips, **Sort by** control and search box as the Home page.
- S-27.4 Verify that when the Member selects a course chip in the Favorites view, only their favorites of that course show.
- S-27.5 Verify that when the Member changes the **Sort by** control in the Favorites view, the favorites reorder.
- S-27.6 Verify that when the Member types in the search box in the Favorites view, only their favorites that match the text show.
- S-27.7 Verify that a favorited recipe that no longer exists on the site isn't shown.
- S-27.8 Verify that each Member sees only their own favorites, never another account's.
- S-27.9 Verify that when the Visitor isn't signed in and opens the Favorites address, the system shows the normal Home page (S-24.6).
- S-27.10 Verify that when the Member has favorites but a course chip or the search text leaves none showing in the Favorites view, the system shows "Nothing matches that. Try another word." and not "No favorites yet."

## Post-conditions
- The Member sees their favorites. Nothing is saved.
