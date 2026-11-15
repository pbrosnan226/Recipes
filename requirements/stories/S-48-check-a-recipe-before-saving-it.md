# S-48 Check a recipe before saving it

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 1 to 3 and 8
**Screens:** None (chat)

## Actors
- **Owner**: shares the recipe link
- **Extractor**: the `recipe-extract` skill, run by Claude (primary)

## Trigger
The Owner asks Claude to add a recipe from a link (step 1).

## Pre-conditions
- The Owner has shared a recipe link.

## Acceptance criteria
- S-48.1 Verify that the Extractor reads the recipe page and finds the recipe's data and its photo address.
- S-48.2 Verify that the Extractor checks that the recipe has a source.
- S-48.3 Verify that the Extractor checks that the recipe has a created date.
- S-48.4 Verify that the Extractor checks that the recipe says what the source makes (an amount and servings or batches).
- S-48.5 Verify that the Extractor checks that the recipe has a valid course, one of Breakfast, Main, Side, Soup, Dessert or Sauce (the course is chosen as S-34 says).
- S-48.6 Verify that the Extractor checks that every ingredient has a quantity or fixed text.
- S-48.7 Verify that the Extractor checks that every `{key}` in a step is the key of an ingredient of that recipe.
- S-48.8 Verify that when every check passes, the Extractor goes on to save the recipe (S-49).
- S-48.9 Verify that when any check fails, the Extractor saves nothing to the database and uploads nothing to Storage.
- S-48.10 Verify that when any check fails, the Extractor tells the Owner in chat what failed the check.

## Post-conditions
- The recipe passed every check and goes on to be saved, or nothing is saved and the Owner has been told what failed.
