# S-07 Search the recipe list

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), steps 4 and 6 (changed 2026-11-14: were steps 3 and 5)
**Screens:** [Home](../mockups/home.html) (changed 2026-11-14: replaces Recipe list)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor types in the search box.

## Pre-conditions
- The Home page is open.

## Acceptance criteria
- S-07.1 Verify that the Visitor can type text in the search box.
- S-07.2 (changed 2026-11-14; changed 2026-11-13: ingredient names are searched too, see S-62) Verify that as the Visitor types, the system updates the cards without a button press, showing only recipes whose name, site, tags or ingredient names contain the text.
- S-07.3 Verify that search ignores upper and lower case.
- S-07.4 (changed 2026-11-14) Verify that when the search box is empty, search hides no recipe (the cards shown are those of the selected course chip).
- S-07.5 (changed 2026-11-14) Verify that when the Visitor clears the search box, the system restores the cards the selected chip allows.
- S-07.6 (changed 2026-11-14) Verify that when no recipe matches, the page shows no cards and shows "Nothing matches that. Try another word."
- S-07.7 (changed 2026-11-14) Verify that the "Nothing matches that. Try another word." message is hidden when at least one recipe matches.
- S-07.8 (deferred 2026-11-14, see todo.md: search by ingredient; the number is reserved) (Superseded 2026-11-13 by S-62: search by ingredient is now in scope; the number is not reused)
- S-07.9 (new 2026-11-14) Verify that search combines with the selected course chip: only recipes of that course that match the text are shown.
- S-07.10 (new 2026-11-14) Verify that the recipe count updates to the number of cards shown.

## Post-conditions
- The grid shows the matching recipes. Nothing is saved.
