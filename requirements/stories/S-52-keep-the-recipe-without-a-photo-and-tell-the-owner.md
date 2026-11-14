# S-52 Keep the recipe without a photo and tell the Owner

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 5 and 7, and the edge cases (no photo from the source, upload fails)
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: is told in chat

## Trigger
The photo download fails (blocked, dead link), the upload fails after the recipe is saved, or the recipe page gives no photo.

## Pre-conditions
- The recipe is saved in the database (S-49).

## Acceptance criteria
- S-52.1 Verify that when the photo download fails, the recipe stays saved.
- S-52.2 Verify that when the photo download fails, the recipe's photo path is empty and no file for that recipe is left in the Storage bucket.
- S-52.3 Verify that when the photo download fails, the Extractor tells the Owner in chat which photo couldn't be downloaded (recipe name and photo address) and why.
- S-52.4 Verify that when the upload fails after the recipe is saved (for example because the environment variable isn't set), the recipe stays saved with an empty photo path, and the Extractor tells the Owner in chat which photo couldn't be uploaded and why.
- S-52.5 Verify that when the recipe page gives no photo, the Extractor downloads and uploads nothing, leaves the photo path empty, and tells the Owner in chat that the recipe has no photo.
- S-52.6 Verify that the rest of the recipe is saved the same as it would be with a photo.
- S-52.7 Verify that a recipe saved without a photo shows on the site without a photo (S-05.11, S-09.18).
- S-52.9 (new 2026-11-13) Verify that when the recipe replaces an existing one (S-50.4) and has no new photo, the old photo file is left in the bucket, the photo path is empty, and the Extractor names the old file in chat (S-50.8).
- S-52.8 Verify that no message to the Owner contains the service key.

## Post-conditions
- The recipe is saved without a photo, and the Owner knows why.
