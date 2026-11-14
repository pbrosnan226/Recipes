# S-18 Download the existing photos and replace the links

**Workflow:** [W-05 Convert existing photo links to stored files](../workflows/W-05-convert-existing-photo-links.html), steps 3 to 6
**Screens:** None (files and chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)

## Trigger
The Owner has confirmed the download of the listed photos (S-17).

## Pre-conditions
- The Owner confirmed the list.

## Acceptance criteria
- S-18.1 Verify that for each listed note the Extractor downloads the photo from its source address.
- S-18.2 Verify that each downloaded photo is saved in `images/`, named after the note, with the extension of the file type actually downloaded, exactly as downloaded (not resized or converted).
- S-18.3 Verify that the note's external photo line is replaced by a Markdown image with the dish name as alt text and the saved file's path with spaces written as `%20` (for example `![French Toast](images/French%20Toast.jpg)`), on the same line position.
- S-18.4 Verify that nothing else in the note changes.
- S-18.5 Verify that when a download fails, the Extractor saves no file for that note, removes that note's external photo line, and leaves the rest of the note unchanged.
- S-18.6 Verify that a failure of one note doesn't stop the Extractor from converting the remaining notes.
- S-18.7 Verify that after the conversion no note holds an external photo address.

## Post-conditions
- Every listed note has either a stored photo with a Markdown image to it, or no photo line.
