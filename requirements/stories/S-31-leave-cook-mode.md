# S-31 Leave Cook mode

**Workflow:** [W-08 Use Cook mode](../workflows/W-08-use-cook-mode.html), step 3
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor selects **Leave cook mode**, or leaves the page.

## Pre-conditions
- Cook mode is on.

## Acceptance criteria
- S-31.1 Verify that when the Visitor selects **Leave cook mode**, the steps return to their normal size.
- S-31.2 Verify that when the Visitor selects **Leave cook mode**, the button reads **Cook mode**.
- S-31.3 Verify that when the Visitor selects **Leave cook mode**, the system releases the screen-awake request so the screen may sleep again.
- S-31.4 Verify that when the Visitor leaves the page (for example by selecting **Back to all recipes**), the screen-awake request is released.
- S-31.5 Verify that after leaving Cook mode, the Visitor can turn it on again as in S-29.

## Post-conditions
- Cook mode is off and the screen may sleep. Nothing is saved.
