# S-15 Save the recipe without a photo when the download fails

**Workflow:** [W-04 Save a recipe's photo](../workflows/W-04-save-a-recipes-photo.html), steps 3 and 6
**Screens:** None (chat and files)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: is told in chat

## Trigger
The Extractor's download of the photo fails (blocked, dead link).

## Pre-conditions
- The Extractor has the photo's address from the recipe page.

## Acceptance criteria
- S-15.1 Verify that when the download fails, the Extractor still saves the recipe note.
- S-15.2 Verify that the note has no photo line and no external photo address.
- S-15.3 Verify that no file for that recipe is left in `images/`.
- S-15.4 Verify that the Extractor tells the Owner in chat which photo couldn't be downloaded (recipe name and photo address) and why.
- S-15.5 Verify that the rest of the note is the same as it would be with a photo.

## Post-conditions
- The recipe note is saved without a photo, and the Owner knows why.
