# S-46 Fix the differences and compare again

**Workflow:** [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html), step 5
**Screens:** None (chat)

## Actors
- **Claude**: fixes the import and compares again (primary)
- **Owner**: is told

## Trigger
The comparison (S-45) finds at least one difference.

## Pre-conditions
- The differences have been listed (S-45.10).

## Acceptance criteria
- S-46.1 Verify that Claude lists the differences to the Owner before it fixes them.
- S-46.2 Verify that Claude fixes the import so the stored data matches the current built site, and does not change any note or any file in `images/`.
- S-46.3 Verify that fixing the import creates no duplicate recipe, tag, course or photo file (S-44.12).
- S-46.4 Verify that after fixing, Claude compares every recipe again as in S-45, not only the recipes that differed.
- S-46.5 Verify that Claude repeats the fix and the comparison until no difference is left.
- S-46.6 Verify that when no difference is left, Claude reports that the import is identical, and goes on to write the guide (S-47).
- S-46.7 (new 2026-11-13) Verify that a recipe that failed to import is saved again as part of the fix (S-44.16), and compared again.

## Post-conditions
- The database matches the current built site, or the Owner has been told what still differs.
