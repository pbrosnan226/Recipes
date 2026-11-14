# S-20 Filter the recipe list by course

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 2
**Screens:** [Home](../mockups/home.html)

## Actors
- **Visitor**: anyone who opens the site (primary)

## Trigger
The Visitor selects a course chip on the Home page.

## Pre-conditions
- The Home page is open.

## Acceptance criteria
- S-20.1 (changed 2026-11-13: the chips are read from the COURSE table) Verify that the course chips are **All** followed by the courses read from the COURSE table in position order (**Breakfast**, **Main**, **Side**, **Soup**, **Dessert** and **Sauce**), and that **All** is selected when the page opens.
- S-20.2 Verify that when the Visitor selects a course chip, the system shows only the recipes whose course is that course, and shows that chip as the one selected.
- S-20.3 Verify that only one chip is selected at a time.
- S-20.4 Verify that when the Visitor selects **All**, the system shows recipes of every course, including recipes with no course.
- S-20.5 Verify that a recipe with no course is shown only under **All**.
- S-20.6 Verify that the chips combine with the search box and the **Sort by** control: the cards shown are those of the selected course that match the search text, in the chosen order.
- S-20.7 Verify that when no recipe has the selected course (with the current search text), the page shows no cards and shows "Nothing matches that. Try another word."
- S-20.8 Verify that the recipe count updates to the number of cards shown.
- S-20.9 Verify that selecting a chip doesn't leave the Home page and doesn't change the search box.

## Post-conditions
- The grid shows the recipes of the selected course. Nothing is saved; reloading the page returns to **All**.
