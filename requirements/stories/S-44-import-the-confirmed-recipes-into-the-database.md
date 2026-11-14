# S-44 Import the confirmed recipes into the database

**Workflow:** [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html), step 3
**Screens:** None (chat)

## Actors
- **Claude**: saves the recipes and uploads the photos (primary)
- **Supabase**: holds the recipes and the photo files

## Trigger
The Owner confirms the import (S-43).

## Pre-conditions
- The schema, access rules and photo bucket exist (S-39).
- The Owner has confirmed the list of recipes to import.

## Acceptance criteria
- S-44.1 Verify that for each confirmed recipe, Claude saves to the `recipes` schema all the recipe data S-01.5 lists, as the ERD defines it.
- S-44.2 Verify that each recipe's name is the note's file name without `.md`, and its slug is the name in lowercase with spaces and punctuation turned into hyphens (for example `french-toast` for French Toast).
- S-44.3 (changed 2026-11-13: notes with level) Verify that each recipe's aliases, serving options (position, amount, label), ingredients, steps, notes and nutrients are saved in the order the note gives them, and that each note is saved with level 0, or level 1 when the note lists it as a nested bullet under the note before it.
- S-44.15 (new 2026-11-13) Verify that each recipe's servings label is saved as the note writes it (for example Servings, Makes, Pies, Batch size).
- S-44.4 Verify that each ingredient is saved with its key, name, text as written, group, quantity (and the high end of a range), singular and plural unit, fixed text, lead text, grams before and whether it is hidden, as the note's ingredient block gives them.
- S-44.5 Verify that each recipe's tags are saved as one TAG row per distinct tag name, shared between recipes, including the tag `recipe`, and linked to the recipe with a position that keeps the order the note lists them (changed 2026-11-13).
- S-44.6 Verify that a recipe with a valid course is saved linked to that existing COURSE row (the import creates no COURSE), and a recipe with no valid course is saved with no course.
- S-44.7 Verify that times, nutrient amounts, the nutrition basis line and ingredient text are saved as the note writes them, with no conversion.
- S-44.8 Verify that for each recipe whose photo file exists in `images/`, Claude uploads that file to the Storage bucket with the same bytes and the same file name (for example `French Toast.jpg`), and sets the recipe's photo path to that file name.
- S-44.9 Verify that a recipe whose photo file is missing in `images/` is still imported with an empty photo path, and that Claude reports the recipe and the missing file to the Owner.
- S-44.10 Verify that a recipe whose note has no photo line is imported with an empty photo path and nothing is uploaded for it.
- S-44.11 Verify that each recipe is saved all together with its parts, or not at all.
- S-44.12 (changed 2026-11-13) Verify that running the import again replaces an existing recipe only when its name is on the list the Owner confirmed (S-43.9), replaces it whole and all-or-nothing, overwrites its photo file in Storage, and creates no second recipe, tag, course or photo file.
- S-44.16 (new 2026-11-13) Verify that when saving a recipe or uploading its photo fails (other than a photo file missing in `images/`, S-44.9), Claude reports the recipe and the failure to the Owner, leaves nothing of that recipe part-saved, and carries on with the next recipe.
- S-44.17 (new 2026-11-13) Verify that when a replace fails, the recipe stays as it was before (the old one entirely).
- S-44.13 Verify that the import changes, renames and deletes no note and no file in `images/`.
- S-44.14 Verify that Claude does not import a note that could not be read.

## Post-conditions
- Every confirmed recipe is in the database, with its photo in Storage where the note had one.
