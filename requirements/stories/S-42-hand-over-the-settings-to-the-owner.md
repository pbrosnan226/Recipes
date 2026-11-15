# S-42 Hand over the settings to the Owner

**Workflow:** [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html), step 5
**Screens:** None (chat)

## Actors
- **Claude**: gives the settings (primary)
- **Owner**: adds the project address and public key to the Netlify settings, and the service key to an environment variable on their Mac

## Trigger
The schema, access rules and photo bucket have been applied and checked (S-39).

## Pre-conditions
- S-39 has finished without an error.

## Acceptance criteria
- S-42.1 Verify that Claude gives the Owner the project address.
- S-42.2 Verify that Claude gives the Owner the public read-only key.
- S-42.3 Verify that Claude tells the Owner to add the project address and the public key to the Netlify settings the build reads (S-63).
- S-42.4 Verify that Claude gives the Owner the steps to put the service key in an environment variable on the Owner's Mac, and names the variable.
- S-42.5 Verify that those steps do not need Claude to see the service key, and that Claude never reads, asks for or prints the service key.
- S-42.6 Verify that Claude does not add the settings to Netlify and does not set the environment variable itself.

## Post-conditions
- The Owner has the project address, the public key and the steps for the service key.
