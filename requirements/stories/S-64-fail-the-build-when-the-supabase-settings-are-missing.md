# S-64 Fail the build when the Supabase settings are missing

**Workflow:** [W-03 Publish the site](../workflows/W-03-publish-new-or-changed-recipes.html), step 4
**Screens:** None

## Actors
- **Build**: Netlify's build (primary)
- **Owner**: adds the settings and pushes again (outside every story)

## Trigger
The build has started and the project address or the public read-only key is missing from the Netlify settings.

## Pre-conditions
- A previous successful site is live.

## Acceptance criteria
- S-64.1 Verify that when the project address is missing or empty, the build fails (non-zero exit status).
- S-64.2 Verify that when the public read-only key is missing or empty, the build fails (non-zero exit status).
- S-64.3 Verify that the build log says which setting is missing, and does not print the key.
- S-64.4 Verify that when the build fails, the Build produces nothing for publishing.
- S-64.5 Verify that when the build fails, the previously published site stays live and unchanged.
- S-64.6 Verify that after the Owner adds the missing settings and pushes again, the build succeeds (S-63).

## Post-conditions
- The previous site is still live, and the build log shows which setting was missing.
