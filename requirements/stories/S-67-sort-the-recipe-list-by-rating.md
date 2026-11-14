# S-67 Sort the recipe list by rating

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 3 (added 2026-11-13)
**Screens:** Home (None, not mocked up)
**Status:** Blocked on sign-in (W-06) and the Supabase migration; not built until both exist.

## Actors
- **Visitor**: anyone who opens the site (primary)
- **Member**: an invited person who is signed in

## Trigger
The Visitor or Member chooses **Rating** in the **Sort by** control.

## Pre-conditions
- The Home page is open.

## Acceptance criteria
- S-67.1 Verify that the **Sort by** control offers **Rating** in addition to **Name** and **Site** (S-06.1).
- S-67.2 Verify that when a Visitor who isn't signed in chooses **Rating**, the system sorts the cards by average rating, highest first.
- S-67.3 Verify that when a Member chooses **Rating**, the system sorts the cards by the Member's own rating, highest first, and not by the average.
- S-67.4 Verify that cards with the same value are in recipe-name order, A to Z, ignoring upper and lower case.
- S-67.5 Verify that for a Visitor, recipes with no ratings come last, in recipe-name order, A to Z.
- S-67.6 Verify that for a Member, recipes the Member hasn't rated come last, in recipe-name order, A to Z, even when they have an average.
- S-67.7 Verify that when the search text, the course chip or the second chip row changes, the cards keep **Rating** as the sort.

## Post-conditions
- The cards show in the chosen order. Nothing is saved.
