# S-09 View a recipe

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 1
**Screens:** [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html) (changed 2026-11-14: replace Recipe page)

## Actors
- **Visitor**: anyone who opens the site (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor selects a recipe's card on the Home page (S-05), or opens the recipe's address `/recipe?name=<slug>` (changed 2026-11-13; see S-57).

## Pre-conditions
- The site is live and the recipe is in the database (changed 2026-11-13: the recipe is loaded from Supabase when the page opens, S-57).

## Acceptance criteria
- S-09.1 Verify that the Recipe page shows the recipe's name as the page heading.
- S-09.2 (changed 2026-11-13; changed again 2026-11-13: from Storage) Verify that the Recipe page shows the recipe's photo from the file at the recipe's photo path in the Storage bucket, when the recipe has a photo path and the file exists.
- S-09.3 Verify that the Recipe page shows the recipe's description, when the recipe has one.
- S-09.4 (changed 2026-11-13: the RECIPE_TAG position order) Verify that the Recipe page shows every tag of the recipe, including `recipe`, in the order the recipe lists them.
- S-09.5 Verify that the Recipe page shows the times as written, in boxes labeled **Prep**, **Cook** and **Total**.
- S-09.6 Verify that a time box is left out when that time is empty, and the whole times row is left out when all three are empty.
- S-09.7 (changed 2026-11-13: the recipe's serving options and servings label) Verify that the Recipe page shows a servings dropdown with the options the recipe defines (each with its label as written), in position order, set to what the source makes (the recipe's base amount), and that the label before the dropdown is the recipe's servings label as written (for example Servings, Makes, Pies).
- S-09.8 Verify that the text "(the source makes N)", with N what the source makes, appears next to the servings dropdown of a recipe that scales by servings.
- S-09.9 (changed 2026-11-14) Verify that the **Ingredients** section is a list with one row per ingredient that is not hidden, in the note's order, each row showing a checkbox and the ingredient's amount and name scaled to the dropdown's value, where the first N is what the source makes.
- S-09.10 (removed 2026-11-14: the column headings it described no longer exist; the number is not reused)
- S-09.11 (changed 2026-11-14) Verify that an ingredient group the note names gets its own sub-heading row above its ingredients in the list, that a sub-heading row has no checkbox, and that ingredients without a group appear with no sub-heading row.
- S-09.12 Verify that an ingredient marked hidden is left out of the **Ingredients** list.
- S-09.13 (removed 2026-11-14: the **As written** column is dropped; the number is not reused)
- S-09.14 (changed 2026-11-14) Verify that the **Method** section (was Steps) shows the steps in order, numbered, with each ingredient key in braces replaced by that ingredient's amount at the dropdown's servings.
- S-09.15 (changed 2026-11-13: nesting by level) Verify that the Notes section shows the author's notes in order, that a note with level 1 is shown indented under the nearest earlier note with level 0, and that the section is left out when the recipe has none.
- S-09.16 (changed 2026-11-14) Verify that the **Nutrition** section is collapsible and closed when the page loads, that when the Visitor selects **Nutrition** it opens to show the basis line as written and each nutrient's name with its amount as written, and that the section is left out when the recipe has no nutrition table.
- S-09.17 (changed 2026-11-14) Verify that the Recipe page shows a link to the source labeled "Original recipe at <site>, by <author>", that the label shows the source URL in place of the site when the recipe has no site, and that the label has no "by <author>" when the recipe has no author.
- S-09.18 (changed 2026-11-14: **Back to list** is now **Back to all recipes**; adds course and times) Verify that the page shows a **Back to all recipes** link and that a recipe with no photo (including one whose photo file is missing in the Storage bucket) (changed 2026-11-13: was "missing at build time"), no description, no tags, no notes, no nutrition table, no course or no times simply omits those parts.
- S-09.19 (changed 2026-11-14) Verify that on a phone-sized screen (about 390 px wide) the Recipe page shows its content in one column, and all parts that are shown are readable and usable without zooming or sideways scrolling.
- S-09.20 (changed 2026-11-14) Verify that in light mode the page uses the cream (#F7F6EE) background with the sage green (#3F6B4F) accent, and that when the device is set to dark mode the page uses the dark version of that palette shown in the approved mockups (background #141A16, accent #8DBE9D); headings use Fraunces and body text uses Inter, from font files stored in the repo and published with the site, so no page loads a font from another site.
- S-09.21 (new 2026-11-14) Verify that the Recipe page shows the recipe's course above its name when the recipe has a course.
- S-09.22 (new 2026-11-14; changed 2026-11-14: favorites are back in scope) Verify that the Recipe page shows a **Cook mode** button (S-29), and shows the **Favorite** or **Favorited** button only to a signed-in Member (S-25, S-26), never to a Visitor who isn't signed in.
- S-09.23 (new 2026-11-14) Verify that the servings dropdown, the source makes text and the times are shown together in the recipe's header block, next to the photo on a wide screen.

## Post-conditions
- The Visitor sees the whole recipe at the source's servings. Nothing is saved.
