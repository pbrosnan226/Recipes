# S-81 Follow the tag rules when adding a recipe

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 3 and 4
**Screens:** None (chat)

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: asks for the recipe

## Trigger
The Owner asks Claude to add a recipe from a link.

## Pre-conditions
- The `recipe-extract` skill is in use.

## Acceptance criteria
- S-81.1 Verify that the skill has a Tags section naming the kinds of tag in this order, when they apply: course, protein, cuisine, healthy, holiday.
- S-81.2 Verify that the skill says the course tag is the lowercase course word, the same as the recipe's course, and comes first.
- S-81.3 Verify that the skill says a protein tag is added only when the source states it or it is plainly the main one.
- S-81.4 Verify that the skill says a cuisine tag comes from the source.
- S-81.5 Verify that the skill says a healthy tag is added only when the source itself calls the recipe healthy, light, low-calorie or similar.
- S-81.6 Verify that the skill says a holiday tag is added only when the source names the holiday.
- S-81.7 Verify that the skill says other tags are allowed after those when they help find the recipe, for example a diet or a method.
- S-81.8 Verify that the skill says a tag is redundant, and not saved, when it repeats another tag of the recipe (a synonym, or the same word singular and plural), repeats the course, is the dish's own name or part of it, or is `recipe` or `recipes`.
- S-81.9 Verify that the skill says tags are lowercase and singular, with hyphens for a multiword tag.
- S-81.10 Verify that the skill says a kind with nothing to say adds no tag, and that no filler tag is added.
- S-81.11 Verify that the skill says that before saving, the Extractor lists the existing tags (S-83) and reuses one that already means the same.
- S-81.12 Verify that the skill's line "Tags in order" no longer contradicts these rules.

## Post-conditions
- The skill's instructions state the tag rules.
