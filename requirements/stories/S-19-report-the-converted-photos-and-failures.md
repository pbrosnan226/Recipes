# S-19 Report the converted photos and the failures

**Workflow:** [W-05 Convert existing photo links to stored files](../workflows/W-05-convert-existing-photo-links.html), steps 6 and 7
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: reads the report

## Trigger
The conversion (S-18) has gone through every listed note.

## Pre-conditions
- Every listed note was tried.

## Acceptance criteria
- S-19.1 Verify that the report lists, for each file saved, its name, its source address and its size.
- S-19.2 Verify that the report lists each note whose download failed, with the reason (for example blocked).
- S-19.3 Verify that every listed note appears in the report exactly once, either as saved or as failed.
- S-19.4 Verify that the report doesn't summarize the recipes' contents.

## Post-conditions
- The Owner knows which photos are stored and which notes have none. Pushing (W-03) is left to the Owner.
