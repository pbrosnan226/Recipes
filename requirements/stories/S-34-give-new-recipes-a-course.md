# S-34 Give new recipes a course

**Workflow:** [W-09 Assign courses to recipes](../workflows/W-09-assign-courses-to-recipes.html), edge case (new recipes get a course when they are added)
**Screens:** None

## Actors
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)
- **Owner**: answers when asked

## Trigger
The Owner asks Claude to add a recipe from a link.

## Pre-conditions
- The `recipe-extract` skill is in use.

## Acceptance criteria
- S-34.1 (Superseded 2026-11-13: recipes are saved to the database, not written as notes; the skill's wording is S-53) Verify that the note template in the `recipe-extract` skill has a `course` property.
- S-34.2 (changed 2026-11-13: the recipe's course in the database) Verify that when the source's own category is exactly the name of a course in the list (ignoring upper and lower case), the Extractor saves the recipe with that course.
- S-34.3 (changed 2026-11-13: the recipe's course in the database) Verify that when the source's category is not exactly a course name in the list, or the source gives none, the Extractor asks the Owner to choose one of Breakfast, Main, Side, Soup, Dessert or Sauce, and saves the recipe with the Owner's choice.
- S-34.4 (changed 2026-11-13) Verify that the Extractor never saves a recipe with a course outside the list.
- S-34.5 Verify that the skill's instructions state these rules.

## Post-conditions
- The new recipe has one course from the list (changed 2026-11-13: was "The new note has one `course` from the list").
