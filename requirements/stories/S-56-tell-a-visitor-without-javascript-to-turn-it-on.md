# S-56 Tell a Visitor without JavaScript to turn it on

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), edge cases (without JavaScript), and [W-02 View a recipe](../workflows/W-02-view-a-recipe.html)
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html) (the JavaScript-off state is described in plan.md under "States added by the database change"; it has no mockup)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor opens a page of the site in a browser with JavaScript off.

## Pre-conditions
- JavaScript is off in the Visitor's browser.

## Acceptance criteria
- S-56.1 (changed 2026-11-13: the header stays) Verify that with JavaScript off, the Home page shows the site header and, as its only content, "Turn on JavaScript to see recipes."
- S-56.2 (changed 2026-11-13: the header stays) Verify that with JavaScript off, the Recipe page shows the site header and, as its only content, "Turn on JavaScript to see recipes."
- S-56.3 Verify that with JavaScript off, no recipe name, card or recipe content is shown on either page.
- S-56.4 Verify that with JavaScript on, the message "Turn on JavaScript to see recipes." is not shown.

## Post-conditions
- The Visitor knows to turn on JavaScript. Nothing is saved.
