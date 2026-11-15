# S-21 Show Sign in or Sign out in the header

**Workflow:** [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html), steps 1, 3 and 4; [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html), step 3
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html) (the header is shared by every page; the mockups show the signed-out header without **Sign in**)

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)
- **Member**: a signed-in person

## Trigger
Any page of the site opens.

## Pre-conditions
- None.

## Acceptance criteria
- S-21.1 Verify that when the Visitor isn't signed in, the header shows a **Sign in** link and no **Favorites** link and no **Sign out**.
- S-21.2 Verify that when the Visitor selects **Sign in** in the header, the system shows the Sign in page (S-78).
- S-21.3 Verify that when the Member is signed in, the header shows a **Favorites** link and **Sign out** and no **Sign in** link.
- S-21.4 Verify that the signed-in header shows no email address and no name.
- S-21.5 Verify that when the Member selects **Favorites** in the header, the system shows the Favorites view (S-27).
- S-21.6 Verify that when the Member selects **Sign out** in the header, the system signs the Member out (S-24).
- S-21.7 Verify that in both states the header still shows the site name **Recipes** and the **Browse** link that opens the Home page.

## Post-conditions
- The header shows the links that match whether the person is signed in.
