# S-30 Keep the screen awake when the tab returns

**Workflow:** [W-08 Use Cook mode](../workflows/W-08-use-cook-mode.html), step 2 and its edge case
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor returns to a Recipe page's tab after it was hidden, while Cook mode is on.

## Pre-conditions
- Cook mode is on (S-29) and the browser released the screen lock when the tab was hidden.

## Acceptance criteria
- S-30.1 Verify that when the Visitor returns to the tab while Cook mode is on, the system asks the browser to keep the screen awake again.
- S-30.2 Verify that when the Visitor returns to the tab while Cook mode is off, the system doesn't ask the browser to keep the screen awake.
- S-30.3 Verify that when the browser can't keep the screen awake, returning to the tab leaves the larger steps as they were.
- S-30.4 Verify that returning to the tab doesn't turn Cook mode off or change the button's label.

## Post-conditions
- The screen is kept awake again where the browser allows it, and Cook mode is still on.
