# S-45 Compare every imported recipe with the current built site

**Workflow:** [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html), step 4
**Screens:** None (chat)

## Actors
- **Claude**: runs the comparison and reports it (primary)
- **Owner**: reads the report

## Trigger
All confirmed recipes have been saved (S-44).

## Pre-conditions
- The imported recipes are in the database.
- The site as the old build produces it from the notes (the current built site) can still be produced.
- The browser scaling code (S-61) exists.

## Acceptance criteria
- S-45.1 Verify that Claude compares every imported recipe, not a sample, with the current built site.
- S-45.2 Verify that for every servings option each recipe offers, Claude compares the ingredients (the amounts the browser scaling code produces from the stored rows, the names, the group sub-headings, and that hidden ingredients are left out) with those on the current built site.
- S-45.3 Verify that for every servings option each recipe offers, Claude compares the steps, with their amounts filled in, with those on the current built site.
- S-45.4 (changed 2026-11-13: in order) Verify that Claude compares each recipe's tags, in order, with those on the current built site.
- S-45.5 Verify that Claude compares each recipe's course with that on the current built site.
- S-45.6 Verify that Claude compares each recipe's description with that on the current built site.
- S-45.7 Verify that Claude compares each recipe's prep, cook and total times with those on the current built site.
- S-45.8 Verify that Claude compares each recipe's nutrition (the basis line and each nutrient's name and amount) with that on the current built site.
- S-45.9 Verify that Claude compares each recipe's photo: whether it has one, and that the stored file has the same bytes as the file the current built site shows.
- S-45.10 Verify that for each difference Claude lists the recipe, what differs, the servings option where that applies, what the current built site shows and what the database gives.
- S-45.11 Verify that when there are no differences, Claude tells the Owner the import is identical, and says how many recipes and servings options were compared.
- S-45.12 Verify that the comparison changes nothing in the database, the notes, `images/` or the built site.
- S-45.13 (new 2026-11-13) Verify that Claude compares each recipe's name with that on the current built site.
- S-45.14 (new 2026-11-13) Verify that Claude compares each recipe's source link, site and author (the source link label "Original recipe at <site>, by <author>") with those on the current built site.
- S-45.15 (new 2026-11-13) Verify that Claude compares each recipe's notes, with their nesting, with those on the current built site.
- S-45.16 (new 2026-11-13) Verify that Claude compares each recipe's servings dropdown with that on the current built site: its label, its options with their labels, in order, and the option it starts at.
- S-45.17 (new 2026-11-13) Verify that a recipe that failed to import (S-44.16) counts as a difference and is listed.

## Post-conditions
- The Owner has the list of differences, or the report that the import is identical.
