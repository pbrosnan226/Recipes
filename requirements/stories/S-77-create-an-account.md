# S-77 Create an account

**Workflow:** [W-14 Create an account](../workflows/W-14-create-an-account.html), steps 1 to 3
**Screens:** Sign in, Create account (no mockups: the Owner chose to skip them, answer 102), [Home](../mockups/home.html)

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)
- **Member**: the Visitor once the account exists and they are signed in

## Trigger
The Visitor selects **Create account** on the Sign in page.

## Pre-conditions
- The Visitor is signed out and the Sign in page is showing.
- The Visitor's email doesn't have an account yet.

## Acceptance criteria
- S-77.1 Verify that when the Visitor selects **Create account** on the Sign in page, the system shows the Create account page with the fields **Email**, **Password** (with the helper "8+ characters") and **Confirm password**, the **Create account** button and the link "Have an account? **Sign in**".
- S-77.2 Verify that when the Visitor enters an email that has no account, a password of 8 or more characters and the same password in **Confirm password**, then selects **Create account**, the system creates the account, signs the Visitor in and shows the Home page.
- S-77.3 Verify that after the account is created the header shows **Favorites** and **Sign out** and no **Sign in** link.
- S-77.4 Verify that the system doesn't send a confirmation email when it creates an account.
- S-77.5 Verify that the Visitor needs no invitation: any email with no account can create one.
- S-77.6 Verify that when the Visitor selects **Create account** with an email that already has an account, the system doesn't create an account and shows "Email already has an account. **Sign in**" under **Email**.
- S-77.7 Verify that when the Visitor selects **Sign in** in that error, the system shows the Sign in page.
- S-77.8 Verify that when the Visitor selects **Create account** with **Email** empty or not a valid email address (for example "sam@example"), the system doesn't create an account, stays on the Create account page and shows "Enter a valid email." under **Email**.
- S-77.9 Verify that when the Visitor selects **Create account** with a password under 8 characters, the system doesn't create an account, stays on the Create account page and shows "Use 8+ characters." under **Password** in place of the helper.
- S-77.10 Verify that when the Visitor selects **Create account** with a **Confirm password** that doesn't match **Password**, the system doesn't create an account, stays on the Create account page and shows "Passwords don't match." under **Confirm password**.
- S-77.11 Verify that when the Visitor selects **Create account** with no network connection, the system doesn't create an account, keeps what the Visitor entered and shows "No connection." above the **Create account** button.
- S-77.12 Verify that when the Visitor selects **Create account** and it fails for a reason other than no network connection, the system doesn't create an account, keeps what the Visitor entered and shows "Couldn't create account. Try again." above the **Create account** button.
- S-77.13 Verify that when the Visitor selects **Sign in** in "Have an account? **Sign in**", the system shows the Sign in page.
- S-77.14 Verify that the new account can also sign in to Workout and the Gambling App, since the three share the same Supabase accounts.

## Post-conditions
- The account exists, no confirmation email was sent, and the Visitor is signed in as a Member with the Home page showing; or the Visitor is still on the Create account page with the reason shown.
