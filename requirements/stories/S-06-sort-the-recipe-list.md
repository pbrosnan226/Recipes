# S-06 Sort the recipe list

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 3 (changed 2026-11-14: was step 2)
**Screens:** [Home](../mockups/home.html) (changed 2026-11-14: replaces Recipe list)

## Actors
- **Visitor** (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor changes the **Sort by** control (changed 2026-11-14: was selecting a column header).

## Pre-conditions
- The Home page is open.

## Acceptance criteria
- S-06.1 (changed 2026-11-14) Verify that the **Sort by** control offers **Name** and **Site**, and that when the Visitor chooses one, the system sorts the cards by that value, A to Z.
- S-06.2 (removed 2026-11-14: there is no reverse order; the number is not reused)
- S-06.3 (removed 2026-11-14: there is no sort by tags; the number is not reused)
- S-06.4 Verify that sorting ignores upper and lower case.
- S-06.5 (changed 2026-11-14) Verify that when sorted by **Site**, recipes with no site come last.
- S-06.6 (changed 2026-11-14) Verify that the cards can't be sorted by prep, cook or total time, and that no card shows an author.
- S-06.7 (changed 2026-11-14) Verify that when the search text, the selected course chip or a tag selection changes, the cards keep the current sort.
- S-06.8 (new 2026-11-14) Verify that when sorted by **Site**, recipes with the same site are in recipe-name order, A to Z.

## Post-conditions
- The cards show in the chosen order. Nothing is saved; reloading the page returns to **Name**, A to Z.
