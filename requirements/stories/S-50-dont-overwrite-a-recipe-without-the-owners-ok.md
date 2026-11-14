# S-50 Don't overwrite a recipe without the Owner's OK

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), edge case (same name, or a different name with the same slug)
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: says OK or not

## Trigger
The recipe the Owner asked to add has the same name as a recipe already in the database, or a different name with the same slug.

## Pre-conditions
- The recipe passed the checks (S-48).

## Acceptance criteria
- S-50.1 (changed 2026-11-13: also a slug clash) Verify that the Extractor tells the Owner which existing recipe it clashes with (same name, or a different name with the same slug) and asks for the Owner's OK before it changes anything.
- S-50.2 Verify that until the Owner says OK, the Extractor changes nothing in the database and nothing in Storage.
- S-50.3 Verify that when the Owner doesn't say OK, the Extractor saves nothing and the existing recipe is unchanged.
- S-50.4 (written 2026-11-13) Verify that when the Owner says OK, the Extractor replaces the whole existing recipe (its data and all its parts) with the new one in one all-or-nothing save (S-49).
- S-50.5 (new 2026-11-13) Verify that when the Owner says OK and a photo is uploaded (S-51), it overwrites the existing recipe's photo file.
- S-50.8 (new 2026-11-13) Verify that when the Owner says OK and the new recipe has no photo (the download or upload fails, or the source gives none), the old photo file stays in the Storage bucket unused, the recipe's photo path is empty, and the Extractor names the old file in chat so the Owner can delete it.
- S-50.6 (new 2026-11-13) Verify that when the replace fails part way, the existing recipe is left as it was and the Owner is told (S-49.8).
- S-50.7 (new 2026-11-13) Verify that a recipe that clashes with no existing name or slug is saved without asking.

## Post-conditions
- The existing recipe is unchanged unless the Owner said OK, in which case it is entirely the new recipe.
