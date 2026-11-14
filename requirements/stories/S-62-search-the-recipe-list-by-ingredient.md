# S-62 Search the recipe list by ingredient

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 4
**Screens:** [Home](../mockups/home.html) (the look is unchanged)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor types in the search box.

## Pre-conditions
- The Home page is open with the recipes loaded (S-54).

## Acceptance criteria
- S-62.1 Verify that as the Visitor types, the cards shown include every recipe that has an ingredient whose name contains the text, as well as those whose name, site or tags contain it (S-07.2).
- S-62.2 Verify that the match on ingredient names ignores upper and lower case.
- S-62.3 Verify that an ingredient marked hidden is not matched.
- S-62.4 Verify that only the ingredient's name is searched: text found only in an ingredient's text as written (such as its amount or unit), its group name, a step or a note doesn't make a recipe match.
- S-62.5 Verify that ingredient search combines with the selected course chip and the **Sort by** control, as S-07.9 and S-06.7 describe.
- S-62.6 Verify that the recipe count and the "Nothing matches that. Try another word." message follow the cards shown (S-07.6, S-07.10).
- S-62.7 Verify that searching by ingredient needs no further request after the recipes are loaded.

## Post-conditions
- The grid shows the matching recipes. Nothing is saved.
