# S-43 Read the notes and get the Owner's confirmation to import

**Workflow:** [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html), steps 1 and 2
**Screens:** None (chat)

## Actors
- **Claude**: reads the notes and lists them (primary)
- **Owner**: confirms the import

## Trigger
The Owner asks Claude to import the notes.

## Pre-conditions
- The schema from W-10 exists (S-39).

## Acceptance criteria
- S-43.1 Verify that Claude reads every recipe note with the existing note reader (`site/lib/read.js`, the one the build used), and that the notes treated as recipes are those S-01.1 to S-01.3 select (in the repo root and tagged `recipe`).
- S-43.2 Verify that Claude lists to the Owner the name of every recipe it will import.
- S-43.3 Verify that Claude lists to the Owner every note it can't read, with the reason the reader gives.
- S-43.4 Verify that Claude saves nothing to the database and uploads nothing to Storage until the Owner confirms the import.
- S-43.5 Verify that when the Owner doesn't confirm, Claude stops and nothing is imported.
- S-43.6 Verify that a note that can't be read is not imported and is reported again in Claude's final report.
- S-43.7 Verify that reading the notes changes no note and no file in `images/`.
- S-43.8 (new 2026-11-13) Verify that Claude lists to the Owner the names of the recipes to import that already exist in the database, and says that confirming the import replaces them.
- S-43.9 (new 2026-11-13) Verify that Claude replaces an existing recipe only if its name is on the list the Owner confirmed, and leaves every other existing recipe unchanged.

## Post-conditions
- The Owner has seen what will be imported and what can't be read, and has confirmed or stopped the import.
