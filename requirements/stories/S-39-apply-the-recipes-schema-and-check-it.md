# S-39 Apply the recipes schema and check it

**Workflow:** [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html), step 4
**Screens:** None (chat)

## Actors
- **Claude**: applies the SQL through the Supabase connector (primary)
- **Supabase**: runs the SQL
- **Owner**: reads the result, or the error

## Trigger
The Owner approves the SQL (S-38).

## Pre-conditions
- The Owner has approved the SQL and the project.

## Acceptance criteria
- S-39.1 Verify that Claude applies exactly the SQL the Owner approved, with the Supabase connector.
- S-39.2 Verify that after applying, Claude checks that the `recipes` schema has a table for each entity in the ERD and tells the Owner the result.
- S-39.3 Verify that after applying, Claude checks that the read-only access rules and the photo bucket exist and tells the Owner the result.
- S-39.4 Verify that Claude creates, changes or reads nothing outside the `recipes` schema and the photo bucket.
- S-39.5 Verify that when a connector call fails, Claude stops, applies nothing further and reports the error to the Owner.
- S-39.6 Verify that Claude never reads or prints the service key.
- S-39.7 Verify that after applying, the COURSE table holds exactly the six rows Breakfast, Main, Side, Soup, Dessert and Sauce with positions 1 to 6, and Claude tells the Owner the result.

## Post-conditions
- The schema, the access rules and the photo bucket exist, or the Owner has been told the error.
