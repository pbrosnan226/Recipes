# S-40 The database enforces the data model's rules

**Workflow:** [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html), step 4 (the tables from the ERD)
**Screens:** None

## Actors
- **Supabase**: refuses writes that break a rule (primary)
- **Owner**: writes through Claude with the service key, or in the Supabase dashboard

## Trigger
A row is written to a table in the `recipes` schema.

## Pre-conditions
- The schema has been applied (S-39).

## Acceptance criteria
- S-40.1 Verify that the database refuses a RECIPE that has no name, slug, source_url, created date, base_amount or amount_noun.
- S-40.2 Verify that the database refuses a RECIPE_ALIAS without a recipe or alias; a SERVING_OPTION without a recipe, position or amount; a RECIPE_INGREDIENT without a recipe, position, ingredient_key, name or text_as_written; a STEP without a recipe, position or text; a RECIPE_NOTE without a recipe, position, level or text; a RECIPE_TAG without a position; a NUTRIENT without a recipe, position, name or amount; a COURSE without a name or position; and a TAG without a name.
- S-40.3 Verify that the database refuses a second RECIPE with the same name, and a second RECIPE with the same slug.
- S-40.4 Verify that the database refuses a second COURSE with the same name, and a second TAG with the same name.
- S-40.5 Verify that the database refuses two ingredients with the same ingredient_key in one recipe, and accepts the same ingredient_key in two different recipes.
- S-40.6 Verify that the database refuses a second RECIPE_TAG row for the same recipe and tag.
- S-40.7 Verify that a RECIPE_INGREDIENT saved without a value for hidden is saved with hidden false.
- S-40.8 Verify that the database accepts a RECIPE with no course, and refuses a RECIPE whose course_id is not an existing COURSE.
- S-40.9 Verify that when a RECIPE is deleted, its aliases, tag links, serving options, ingredients, steps, notes and nutrients are deleted with it, and its TAGs and COURSE are not.
- S-40.10 Verify that the database accepts a RECIPE with no servings_label, and refuses a RECIPE_NOTE whose level is neither 0 nor 1.

## Post-conditions
- A write that breaks a rule changes nothing.
