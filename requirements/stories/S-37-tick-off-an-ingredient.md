# S-37 Tick off an ingredient

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 3
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor ticks the checkbox of an ingredient on a Recipe page.

## Pre-conditions
- A Recipe page is open.

## Acceptance criteria
- S-37.1 Verify that every ingredient row has a checkbox, and every checkbox is unticked when the page loads.
- S-37.2 Verify that when the Visitor ticks an ingredient's checkbox, the system strikes that ingredient through.
- S-37.3 Verify that when the Visitor unticks it, the strike-through is removed.
- S-37.4 Verify that sub-heading rows have no checkbox and can't be struck through.
- S-37.5 Verify that ticking an ingredient doesn't change any amount or any step.
- S-37.6 Verify that ticks are not remembered: after the page is reloaded, every checkbox is unticked, and nothing is saved on the device or anywhere else.
- S-37.7 Verify that a tick stays when the Visitor changes the servings dropdown.

## Post-conditions
- The ticked ingredients are struck through until the page is reloaded.
