# S-41 Give everyone read-only access to recipes and photos

**Workflow:** [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html), steps 2 and 4 (the access rules and the photo bucket)
**Screens:** None

## Actors
- **Supabase**: answers requests made with the public read-only key (primary)
- **Visitor**: whose browser uses the public key

## Trigger
A request is made to the project with the public read-only key.

## Pre-conditions
- The schema, access rules and photo bucket have been applied (S-39).

## Acceptance criteria
- S-41.1 Verify that a request with the public key can read every table in the `recipes` schema.
- S-41.2 Verify that a request with the public key to insert, update or delete a row in any table in the `recipes` schema is refused and changes nothing.
- S-41.3 Verify that a photo file in the photo bucket can be read with the public key.
- S-41.4 Verify that a request with the public key to upload, replace or delete a file in the photo bucket is refused and changes nothing.
- S-41.5 Verify that the access rules Claude created give the public key nothing except reading the `recipes` tables and the photo bucket.

## Post-conditions
- Anyone can read recipes and photos; nobody can write with the public key.
