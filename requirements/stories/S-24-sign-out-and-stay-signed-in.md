# S-24 Sign out and stay signed in

**Workflow:** [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html), step 4 and the stay-signed-in edge case
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html) (no mockup shows the signed-in header or the personal parts)

## Actors
- **Member**: a signed-in person (primary)

## Trigger
The Member selects **Sign out** in the header, or closes the site and opens it again.

## Pre-conditions
- The Member is signed in.

## Acceptance criteria
- S-24.1 Verify that when the Member selects **Sign out**, the system signs them out at once, with no confirm.
- S-24.2 Verify that after **Sign out** the page the Member was on stays open at the same address, now in its signed-out view, and the header shows **Sign in** and no **Favorites** or **Sign out**.
- S-24.3 Verify that when the Member selects **Sign out** on the Home page, the page no longer shows the second chip row (**All**, **Want to try**, **Rated**) or the cards' personal parts (S-70).
- S-24.4 Verify that when the Member selects **Sign out** on a Recipe page, the page no longer shows the **Favorite** or **Favorited** button, the **Want to try** button, the half-star row or **Remove rating**, and still shows the average rating.
- S-24.5 Verify that when the Member selects **Sign out** on the Favorites view, the system shows the normal Home page.
- S-24.6 Verify that when the Visitor opens the Favorites address while signed out, the system shows the normal Home page.
- S-24.7 Verify that a Member who closes the site and opens it again on the same device is still signed in, with the header showing **Favorites** and **Sign out**.
- S-24.8 Verify that the Member stays signed in on the device until they select **Sign out**.
- S-24.9 Verify that after **Sign out**, closing the site and opening it again on the same device shows the signed-out view.

## Post-conditions
- The Member is signed out and the page shows its signed-out view; or the Member is still signed in on this device.
