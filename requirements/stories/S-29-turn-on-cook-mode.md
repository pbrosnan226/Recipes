# S-29 Turn on Cook mode

**Workflow:** [W-08 Use Cook mode](../workflows/W-08-use-cook-mode.html), steps 1 and 2
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor selects **Cook mode** on a Recipe page.

## Pre-conditions
- A Recipe page is open and Cook mode is off.

## Acceptance criteria
- S-29.1 Verify that the **Cook mode** button is available to every Visitor, with no sign-in.
- S-29.2 Verify that when the Visitor selects **Cook mode**, the text of the steps in the **Method** section becomes larger than it is in normal view.
- S-29.3 Verify that when Cook mode turns on, the button reads **Leave cook mode**.
- S-29.4 Verify that when Cook mode turns on, the system asks the browser to keep the screen awake.
- S-29.5 Verify that when the browser can't keep the screen awake, Cook mode still turns on with the larger steps and the button reading **Leave cook mode**.
- S-29.6 Verify that on a phone-sized screen the larger steps are readable without sideways scrolling.
- S-29.7 Verify that Cook mode is off every time a Recipe page is loaded, and isn't remembered between visits.

## Post-conditions
- The steps are larger and the screen is kept awake where the browser allows it. Nothing is saved.
