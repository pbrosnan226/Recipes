# S-83 List the existing tags

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), before step 4
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Supabase**: holds the tags

## Trigger
The Extractor is about to save a recipe and needs to see which tags exist.

## Pre-conditions
- The recipe has been read.

## Acceptance criteria
- S-83.1 Verify that the Extractor can list the names of the existing tags, using a way that only reads the database.
- S-83.2 Verify that the list shows tag names only.
- S-83.3 Verify that the list does not show a tag that no recipe uses.
- S-83.4 Verify that listing the tags changes nothing in the database or in Storage.
- S-83.5 Verify that when the list can't be read, the Extractor saves nothing and tells the Owner in chat.

## Post-conditions
- The Extractor has the existing tag names to reuse; nothing was changed.
