# S-08 Filter the recipe list by a tag

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 5 (changed 2026-11-14: was step 4)
**Screens:** [Home](../mockups/home.html) (changed 2026-11-14: replaces Recipe list)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor selects a tag on a recipe card (changed 2026-11-14: was a tag in the **Tags** column).

## Pre-conditions
- The Home page is open.

## Acceptance criteria
- S-08.1 Verify that when the Visitor selects a tag, the system fills the search box with that tag.
- S-08.2 Verify that when the Visitor selects a tag, the system filters the cards the same way as typing that tag in the search box.
- S-08.3 Verify that selecting a tag doesn't leave the Home page.
- S-08.4 Verify that the Visitor can then edit or clear the search box as in S-07.
- S-08.5 (new 2026-11-14) Verify that selecting a tag doesn't open the recipe and doesn't change the selected course chip or the **Sort by** choice.

## Post-conditions
- The search box holds the tag and the cards show the matching recipes.
