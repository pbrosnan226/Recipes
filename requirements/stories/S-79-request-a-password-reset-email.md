# S-79 Request a password reset email

**Workflow:** [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html), steps 5 and 6
**Screens:** Sign in, Forgot password (no mockups: the Owner chose to skip them, answer 102)

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)

## Trigger
The Visitor selects **Forgot password?** on the Sign in page.

## Pre-conditions
- The Visitor is signed out and the Sign in page is showing.

## Acceptance criteria
- S-79.1 Verify that when the Visitor selects **Forgot password?** on the Sign in page, the system shows the Forgot password page with the field **Email**, the **Send reset link** button and **Back to sign in**.
- S-79.2 Verify that when the Visitor enters the email of an account and selects **Send reset link**, the system sends a password reset email to it and shows "If it has an account, a link is on its way."
- S-79.3 Verify that when the Visitor enters an email that has no account and selects **Send reset link**, the system sends no email and shows the same message, "If it has an account, a link is on its way."
- S-79.4 Verify that when the hourly limit on emails has been reached and the Visitor selects **Send reset link**, the system sends nothing, stays on the Forgot password page and shows "Too many emails. Try again in an hour."
- S-79.5 Verify that when the Visitor selects **Send reset link** with no network connection, the system sends nothing, keeps the email and shows "No connection."
- S-79.6 Verify that when the Visitor selects **Send reset link** with **Email** empty or not a valid email address (for example "sam@"), the system sends nothing, stays on the Forgot password page and shows "Enter a valid email." under **Email**.
- S-79.7 Verify that when the Visitor selects **Back to sign in**, the system shows the Sign in page.
- S-79.8 Verify that when the Visitor selects **Send reset link** and it fails for a reason other than no network connection or the hourly limit, such as Supabase being down, the system sends nothing, keeps the email and shows "Couldn't send reset link. Try again."

## Post-conditions
- A reset email is on its way if the email has an account, or the Visitor is still on the Forgot password page with the reason shown.
