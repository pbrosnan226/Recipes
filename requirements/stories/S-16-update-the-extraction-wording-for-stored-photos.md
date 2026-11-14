# S-16 Update the extraction wording for stored photos

**Workflow:** [W-04 Save a recipe's photo](../workflows/W-04-save-a-recipes-photo.html), steps 2 to 6 (the rules the Extractor follows)
**Screens:** None

## Actors
- **Extractor**: reads these rules each time it runs (primary)

## Trigger
Claude is asked to add a recipe or to convert existing photo links.

## Pre-conditions
- The project's `CLAUDE.md` and `.claude/skills/recipe-extract/SKILL.md` exist.

## Acceptance criteria
- S-16.1 Verify that `.claude/skills/recipe-extract/SKILL.md` tells the Extractor to download the source photo into `images/`, named after the note, with the extension of the type actually downloaded, stored as downloaded.
- S-16.2 Verify that the skill's note template shows the photo line as `![<dish>](images/<note name with spaces as %20>.<extension>)` instead of `![<dish>](<photo url>)`.
- S-16.3 Verify that the skill no longer says the photo is hot-linked, and no longer says to prefer full-size URLs or check that the photo URL returns 200 as a reason to link it.
- S-16.4 Verify that the skill tells the Extractor, when a photo can't be downloaded, to leave out the photo line and tell the Owner in chat which photo failed and why (replacing the Food Network "go without a photo" hot-link wording).
- S-16.5 Verify that the skill's list of what to include says to save the source photo as a file, not to link to it.
- S-16.6 Verify that `CLAUDE.md` says to capture the source photo as a file in `images/` and link it, in place of "a link to the source photo".
- S-16.7 Verify that the skill and `CLAUDE.md` don't tell the Extractor to resize or convert photos.
- S-16.8 Verify that nothing else in the skill or `CLAUDE.md` changes, except the "Testing (site)" section in `CLAUDE.md` that the PO approved on 2026-11-14.

## Post-conditions
- Future recipes added by the Extractor follow W-04.
