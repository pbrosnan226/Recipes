# S-47 Write the guide to retiring the notes

**Workflow:** [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html), step 6
**Screens:** None (a file in the repo)

## Actors
- **Claude**: writes the guide (primary)
- **Owner**: reads the report and the guide

## Trigger
The comparison finds no differences (S-46.6).

## Pre-conditions
- The import is identical to the current built site (S-45.11).

## Acceptance criteria
- S-47.1 Verify that Claude writes the guide at `requirements/retiring-the-notes.md`.
- S-47.2 Verify that the guide has a section for each of: the recipe notes, `images/`, `scripts/scale/view.js`, and the old build code (`site/build.js`, `site/lib/read.js`, `site/lib/scale.js`, `site/lib/render.js` and the build tests).
- S-47.3 Verify that each section says what removing that item would change, for the Owner (in Obsidian), for the site and for the tests.
- S-47.4 Verify that each section lists every dependency on that item: every file, command, test, setting or document in the repo that refers to it (found by searching the repo), and says what would break in each.
- S-47.5 Verify that each section says whether the new site (S-63) needs that item.
- S-47.6 Verify that the guide names the command the old note-reading build runs under (S-04.9) and says its tests are left out of the normal test run (S-04.10).
- S-47.7 Verify that writing the guide deletes, moves or changes no note, no file in `images/`, no `scripts/scale/view.js` and no old build code.
- S-47.8 Verify that Claude tells the Owner where the guide is.

## Post-conditions
- The guide exists at `requirements/retiring-the-notes.md`; nothing has been removed.
