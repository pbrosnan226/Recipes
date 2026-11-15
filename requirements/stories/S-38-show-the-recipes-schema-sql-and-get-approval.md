# S-38 Show the SQL for the recipes schema and get the Owner's approval

**Workflow:** [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html), steps 1 to 3
**Screens:** None (chat)

## Actors
- **Claude**: sets up the database through the Supabase connector (primary)
- **Owner**: confirms the project and approves the SQL

## Trigger
The Owner asks Claude to set up the database.

## Pre-conditions
- The Supabase connector is available to Claude.
- The ERD (`requirements/erd.md`) is approved.

## Acceptance criteria
- S-38.1 Verify that Claude lists the Supabase projects through the connector and asks the Owner to confirm the Gambling App project (id `wbeaswhbzkqmxcsweisu`).
- S-38.2 Verify that Claude runs no SQL and creates nothing until the Owner has confirmed the project.
- S-38.3 Verify that Claude shows the Owner the SQL for the `recipes` schema before any of it is applied.
- S-38.4 Verify that the SQL creates the schema `recipes` and a table for each entity in the ERD (RECIPE, COURSE, RECIPE_ALIAS, TAG, RECIPE_TAG, SERVING_OPTION, RECIPE_INGREDIENT, STEP, RECIPE_NOTE, NUTRIENT) with the columns, required fields, unique keys and relationships the ERD gives.
- S-38.5 Verify that the SQL gives everyone using the public key read-only access to the tables, and creates a Storage bucket for photos that anyone can read.
- S-38.6 Verify that the SQL creates or changes nothing outside the `recipes` schema and the photo bucket.
- S-38.7 Verify that when the Owner approves the SQL, Claude goes on to apply it (S-39), and that Claude applies none of it before the Owner approves.
- S-38.8 Verify that when the Owner doesn't approve, Claude changes the SQL, shows it again and applies none of it.
- S-38.9 Verify that every later change to the `recipes` schema or the photo bucket is also shown to the Owner as SQL and approved by the Owner before Claude applies it.
- S-38.10 Verify that the SQL also creates the six COURSE rows Breakfast, Main, Side, Soup, Dessert and Sauce, with positions 1 to 6.

## Post-conditions
- The Owner has approved the SQL, or Claude has revised it and shown it again. Nothing is applied yet.
