# S-49 Save a recipe and its parts in one all-or-nothing save

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), step 4
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Supabase**: holds the recipe
- **Owner**: is told if the save fails

## Trigger
The recipe passed every check (S-48).

## Pre-conditions
- The recipe passed S-48.
- The recipe's name and slug are not already in the database, or the Owner has said OK (S-50).

## Acceptance criteria
- S-49.1 Verify that the Extractor saves the recipe to the `recipes` schema with the recipe data the ERD defines (source, archived address, site, author, description, created date, what the source makes and its noun, times, total minutes, nutrition basis and course).
- S-49.2 Verify that the Extractor saves the recipe's name as the name the Owner gives the dish, and its slug as that name in lowercase with spaces and punctuation turned into hyphens.
- S-49.3 Verify that the Extractor saves the recipe's aliases, tag links, serving options, ingredients, steps, notes and nutrients together with the recipe, or none of them.
- S-49.4 (changed 2026-11-13: tag position) Verify that each tag is saved once: a tag that already exists is linked, not created again, and each link has a position that keeps the order the recipe lists its tags.
- S-49.11 (new 2026-11-13) Verify that the recipe is saved with its servings label as the source writes it, and its notes with level 0, or level 1 for a sub-note listed under the note before it, the first note being level 0.
- S-49.12 (new 2026-11-13) Verify that the recipe's course is linked to the existing COURSE row of that name, and that the Extractor creates no COURSE.
- S-49.5 Verify that times, nutrient amounts, the nutrition basis line and ingredient text are saved as the source writes them, with no conversion.
- S-49.6 Verify that `total_minutes` is the total time in whole minutes, and is empty when the source gives no total time.
- S-49.7 Verify that when the save fails part way, no row of that recipe or of its parts is left in the database.
- S-49.8 Verify that when the save fails, the Extractor tells the Owner in chat that the save failed and why, and downloads and uploads no photo.
- S-49.9 Verify that the Extractor saves the recipe before it downloads the photo.
- S-49.10 Verify that the Extractor writes no note and saves no file in `images/` for the recipe.

## Post-conditions
- The recipe and all its parts are saved, or nothing of it is saved and the Owner knows why.
