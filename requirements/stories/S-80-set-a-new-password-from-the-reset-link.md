# S-80 Set a new password from the reset link

**Workflow:** [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html), steps 7 and 8
**Screens:** Reset password, Sign in (no mockups: the Owner chose to skip them, answer 102)

## Actors
- **Visitor**: anyone who opens the site and isn't signed in (primary)

## Trigger
The Visitor opens the link in the password reset email.

## Pre-conditions
- The Visitor asked for a reset email (S-79) and it arrived.

## Acceptance criteria
- S-80.1 Verify that when the Visitor opens the link in the reset email, the system shows the Reset password page with the fields **New password** (with the helper "8+ characters") and **Confirm password**, the **Set password** button and **Back to sign in**.
- S-80.2 Verify that when the Visitor enters the same new password of 8 or more characters in both fields and selects **Set password**, the system changes the password and shows the Sign in page with "Password changed. Sign in with it."
- S-80.3 Verify that after the change, the Visitor can sign in with the new password and can't sign in with the old one.
- S-80.4 Verify that when the Visitor selects **Set password** with a new password under 8 characters, the system doesn't change the password, stays on the Reset password page and shows "Use 8+ characters." under **New password** in place of the helper.
- S-80.5 Verify that when the Visitor selects **Set password** with a **Confirm password** that doesn't match, the system doesn't change the password, stays on the Reset password page and shows "Passwords don't match." under **Confirm password**.
- S-80.6 Verify that when the Reset password page is opened without a valid reset link, the system shows "That link is not a password reset link." and **Back to sign in**, with no password fields.
- S-80.7 Verify that when the Visitor selects **Back to sign in**, the system shows the Sign in page.
- S-80.8 Verify that "Password changed. Sign in with it." stays on the Sign in page until the Visitor signs in or leaves the Sign in page.
- S-80.9 Verify that when the Visitor selects **Set password** with no network connection, the system doesn't change the password, keeps both fields filled and shows "No connection." above **Set password**.
- S-80.10 Verify that selecting **Set password** again after "No connection." tries to change the password again.
- S-80.11 Verify that when the Visitor selects **Set password** with a new password that is the same as the account's current password, the system doesn't change the password, stays on the Reset password page and shows "Use a new password." under **New password**.
- S-80.12 Verify that when the Visitor selects **Set password** and it fails for a reason other than no network connection, such as Supabase being down, the system doesn't change the password, keeps both fields filled and shows "Couldn't set password. Try again." above **Set password**.
- S-80.13 Verify that selecting **Set password** again after "Couldn't set password. Try again." tries to change the password again.

## Post-conditions
- The password is changed and the Sign in page is showing with "Password changed. Sign in with it."; or the Visitor is still on the Reset password page with the reason shown.
