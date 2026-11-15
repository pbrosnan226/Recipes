# S-78 Sign in

**Workflow:** [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html), steps 1 to 3
**Screens:** Sign in (no mockup: the Owner chose to skip it, answer 102), [Home](../mockups/home.html)

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)
- **Member**: the Visitor once they are signed in

## Trigger
The Visitor selects **Sign in** in the site header.

## Pre-conditions
- The Visitor has an account (made on this site, or in Workout or the Gambling App).
- The Visitor is signed out.

## Acceptance criteria
- S-78.1 Verify that when the Visitor selects **Sign in** in the header, the system shows the Sign in page with the title **Recipes**, the fields **Email** and **Password**, the **Sign in** button, **Forgot password?** and **Create account**.
- S-78.2 Verify that when the Visitor enters the email and password of an account and selects **Sign in**, the system signs them in and shows the Home page.
- S-78.3 Verify that the system shows the Home page after signing in whichever page the Visitor selected **Sign in** from.
- S-78.4 Verify that after signing in the header shows **Favorites** and **Sign out** and no **Sign in** link.
- S-78.5 Verify that an account created in Workout or the Gambling App can sign in here with the same email and password.
- S-78.6 Verify that when the Visitor selects **Sign in** with a wrong email or a wrong password, the system doesn't sign them in, keeps both fields filled and shows "Wrong email or password." above **Sign in**.
- S-78.7 Verify that when the Visitor selects **Sign in** with **Email** or **Password** empty, the system doesn't sign them in and shows "Wrong email or password." above **Sign in**.
- S-78.8 Verify that when the Visitor selects **Sign in** with no network connection, the system doesn't sign them in, keeps both fields filled and shows "No connection." above **Sign in**.
- S-78.9 Verify that when the Visitor selects **Sign in** and it fails for any other reason, the system doesn't sign them in, keeps both fields filled and shows "Couldn't sign in. Try again." above **Sign in**.
- S-78.10 Verify that selecting **Sign in** again after "No connection." or "Couldn't sign in. Try again." tries to sign in again.
- S-78.11 Verify that when the Visitor selects **Create account** on the Sign in page, the system shows the Create account page (S-77).
- S-78.12 Verify that when the Visitor selects **Forgot password?** on the Sign in page, the system shows the Forgot password page (S-79).
- S-78.13 Verify that a signed-in Member sees and changes only their own favorites, Want to try marks and ratings, never another account's.

## Post-conditions
- The Visitor is signed in as a Member and the Home page is showing; or the Visitor is still on the Sign in page with the reason shown.
