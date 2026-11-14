# S-33 Write the confirmed courses into the notes

**Workflow:** [W-09 Assign courses to recipes](../workflows/W-09-assign-courses-to-recipes.html), step 3
**Screens:** None

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: pushes the changes outside every story

## Trigger
The Owner has confirmed all the proposed courses (S-32).

## Pre-conditions
- Every recipe note has a confirmed course.

## Acceptance criteria
- S-33.1 Verify that the Extractor writes a `course` property in each recipe note, holding the confirmed course spelled as in the list (Breakfast, Main, Side, Soup, Dessert or Sauce).
- S-33.2 Verify that each note gets exactly one `course` value.
- S-33.3 Verify that the Extractor changes nothing else in any note (properties, ingredients, steps, notes, nutrition and photo line are as before).
- S-33.4 Verify that after this story every recipe note has a `course` that the Build reads (S-01.15).
- S-33.5 Verify that the Extractor doesn't push, commit or deploy.

## Post-conditions
- Every recipe note carries its confirmed `course`.
