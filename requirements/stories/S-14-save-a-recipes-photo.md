# S-14 Save a recipe's photo when adding a recipe

**Workflow:** [W-04 Save a recipe's photo](../workflows/W-04-save-a-recipes-photo.html), steps 1 to 5
**Screens:** None (chat and files)

## Actors
- **Owner**: shares the recipe link
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)

## Trigger
The Owner asks Claude to add a recipe from a link (step 1).

## Pre-conditions
- The Owner has shared a recipe link.
- The Extractor has read the recipe page and found the photo's address (step 2).

## Acceptance criteria
- S-14.1 Verify that the Extractor downloads the photo from the address found on the recipe page.
- S-14.2 Verify that the Extractor saves the file in the `images/` folder in the vault root, creating the folder if it doesn't exist.
- S-14.3 Verify that the saved file is named after the recipe note, with the extension of the file type actually downloaded (for example `images/French Toast.jpg` for `French Toast.md` when a JPEG was downloaded, `images/French Toast.webp` when a WebP was downloaded).
- S-14.4 Verify that the saved file is exactly as downloaded: not resized, converted or edited.
- S-14.5 Verify that the note's photo line is a standard Markdown image with the dish name as alt text and the path to the saved file with spaces written as `%20` (for example `![French Toast](images/French%20Toast.jpg)`).
- S-14.6 Verify that the note's photo line is in the place the note template gives the photo, and the note holds no other address for the photo.
- S-14.7 Verify that when the recipe page gives no photo, the Extractor writes no photo line, saves no file in `images/`, and tells the Owner in chat that the recipe has no photo.

## Post-conditions
- The note and its image file are saved in the repo, not pushed. The Owner pushes (W-03) outside this story.
