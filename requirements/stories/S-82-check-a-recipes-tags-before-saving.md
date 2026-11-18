# S-82 Check a recipe's tags before saving

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 3 and 8 (extends [S-48](S-48-check-a-recipe-before-saving-it.md))
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: is told what failed

## Trigger
The Extractor runs the checks on a recipe it has read (W-04 step 3).

## Pre-conditions
- The Extractor has built the recipe with its course and tags.

## Acceptance criteria
- S-82.1 Verify that the Extractor fails the check on a recipe with a tag that is not lowercase.
- S-82.2 Verify that the Extractor fails the check on a recipe with a tag `recipe` or `recipes`.
- S-82.3 Verify that the Extractor fails the check on a recipe with a course that has its lowercase course word as a tag anywhere other than first.
- S-82.4 Verify that the Extractor fails the check on a recipe with a course that has the course word as a tag more than once.
- S-82.5 Verify that the Extractor fails the check on a recipe with a course that has no course tag.
- S-82.6 Verify that the Extractor fails the check on a recipe with a tag that is the recipe's whole name, or two or more consecutive words of it, ignoring case and counting a hyphen as a space (`apple-pie` fails on Apple Pie).
- S-82.7 Verify that the Extractor passes a tag that is a single word of the recipe's name, other than the course word (`apple` and `pie` alone pass on Apple Pie, `chicken` passes on Chicken Parmesan).
- S-82.8 Verify that the Extractor fails the check on a recipe with two tags that are exactly the same.
- S-82.9 Verify that when a tag check fails, the Extractor saves nothing to the database and uploads nothing to Storage.
- S-82.10 Verify that when a tag check fails, the Extractor tells the Owner in chat which tag failed and which rule it broke.
- S-82.11 Verify that the Extractor does not fail the check for a tag only because it is not useful or is a synonym of another tag (those are the Extractor's own judgment, S-81).
- S-82.12 Verify that when every tag passes and every other check passes, the Extractor goes on to save the recipe (S-49).

## Post-conditions
- Every saved recipe has tags that pass these checks, or nothing is saved and the Owner has been told which tag failed.
