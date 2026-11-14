# S-32 Propose a course for each existing note

**Workflow:** [W-09 Assign courses to recipes](../workflows/W-09-assign-courses-to-recipes.html), steps 1 and 2
**Screens:** None (chat)

## Actors
- **Owner**: keeps the vault and confirms the courses (primary)
- **Extractor**: the `recipe-extract` skill, run by Claude

## Trigger
The Owner asks Claude to add courses to the existing notes.

## Pre-conditions
- The vault holds recipe notes (24 at the time of the plan) and none has a `course` property yet.

## Acceptance criteria
- S-32.1 Verify that the Extractor lists every recipe note in the vault root tagged `recipe`, with one proposed course for each.
- S-32.2 Verify that each proposed course is exactly one of Breakfast, Main, Side, Soup, Dessert or Sauce.
- S-32.3 Verify that the Extractor writes nothing to any note before the Owner confirms.
- S-32.4 Verify that the Owner can confirm all proposed courses, or change the course of any note.
- S-32.5 Verify that when the Owner changes some courses, the Extractor shows the updated list and asks the Owner to confirm again.
- S-32.6 Verify that the Extractor treats the courses as confirmed only when the Owner confirms them.

## Post-conditions
- The Owner has confirmed one course for every recipe note. No note has been changed yet.
