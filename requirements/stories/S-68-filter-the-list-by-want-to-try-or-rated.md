# S-68 Filter the recipe list by Want to try or Rated

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 2 (added 2026-11-13); [W-12 Mark a recipe want to try](../workflows/W-12-mark-a-recipe-want-to-try.html), step 3
**Screens:** Home (None, not mocked up)
**Status:** (changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build after the sign-in stories.

## Actors
- **Member**: anyone signed in with an account (changed 2026-11-14) (primary)

## Trigger
The Member selects **All**, **Want to try** or **Rated** in the second chip row on the Home page.

## Pre-conditions
- The Member is signed in.
- The Home page is open.

## Acceptance criteria
- S-68.1 Verify that the second chip row has the chips **All**, **Want to try** and **Rated**, and that **All** is selected when the page opens.
- S-68.2 Verify that when the Member selects **Want to try**, the system shows only the recipes the Member has marked Want to try.
- S-68.3 Verify that when the Member selects **Rated**, the system shows only the recipes the Member has rated.
- S-68.4 Verify that when the Member selects **All** in the second chip row, the system shows recipes regardless of the Member's marks and ratings.
- S-68.5 Verify that the second chip row combines with the course chips, the **Sort by** control and the search box: the cards shown are those matching all of them, in the chosen order.
- S-68.6 Verify that when **Want to try** is selected, the course chip is **All** and the search box is empty, and the Member has no recipe marked Want to try, the page shows no cards and shows "Nothing on your Want to try list yet."
- S-68.7 Verify that when **Rated** is selected, the course chip is **All** and the search box is empty, and the Member has rated no recipe, the page shows no cards and shows "You haven't rated any recipes yet."
- S-68.8 Verify that when **Want to try** or **Rated** is selected and a course chip other than **All** or search text empties the list, the page shows no cards and shows "Nothing matches that. Try another word."
- S-68.9 Verify that the recipe count updates to the number of cards shown.
- S-68.10 Verify that selecting a chip in the second chip row doesn't leave the Home page and doesn't change the search box.

## Post-conditions
- The grid shows the matching recipes. Nothing is saved; reloading the page returns to **All**.
