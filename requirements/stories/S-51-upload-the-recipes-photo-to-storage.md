# S-51 Upload the recipe's photo to Storage

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 5 and 6
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Supabase**: stores the photo file
- **Owner**: keeps the service key in an environment variable

## Trigger
The recipe has been saved (S-49) and the recipe page gave a photo address.

## Pre-conditions
- The recipe is saved in the database.
- The service key is in an environment variable on the Owner's Mac (S-42).

## Acceptance criteria
- S-51.1 Verify that the Extractor downloads the photo from the address found on the recipe page.
- S-51.2 Verify that the Extractor uploads the file to the Storage bucket exactly as downloaded: not resized, converted or edited.
- S-51.3 Verify that the uploaded file is named after the recipe, with the extension of the file type actually downloaded (for example `French Toast.jpg` when a JPEG was downloaded, `French Toast.webp` when a WebP was downloaded).
- S-51.4 Verify that after the upload the Extractor sets the recipe's photo path to the uploaded file's path in the bucket.
- S-51.5 Verify that the recipe keeps no address of the photo on the source site.
- S-51.6 Verify that the upload uses the service key from the environment variable.
- S-51.7 Verify that the Extractor never reads the service key and never prints it in chat, in a command, in a file or in a log.
- S-51.8 Verify that the Extractor saves no photo file in `images/`.
- S-51.9 Verify that after the upload, the photo shows on the recipe's card on the Home page and on its Recipe page, with no push and no rebuild.

## Post-conditions
- The photo is in Storage and the recipe's photo path points to it.
