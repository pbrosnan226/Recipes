# S-17 List the existing photo links and get the Owner's confirmation

**Workflow:** [W-05 Convert existing photo links to stored files](../workflows/W-05-convert-existing-photo-links.html), steps 1 and 2
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: confirms in chat

## Trigger
The Owner asks Claude to store the photos of the existing notes.

## Pre-conditions
- Recipe notes exist in the vault root; some have an external photo line.

## Acceptance criteria
- S-17.1 Verify that the Extractor lists, for each note with an external photo line, the note's name and the photo's source address.
- S-17.2 Verify that notes without a photo line are not listed as photos to download.
- S-17.3 Verify that the Extractor asks the Owner to confirm the download of the listed photos.
- S-17.4 Verify that the Extractor downloads nothing and changes no note before the Owner confirms.
- S-17.5 Verify that when the Owner doesn't confirm, the Extractor changes nothing.

## Post-conditions
- The Owner has seen the list; with confirmation, S-18 may start.
