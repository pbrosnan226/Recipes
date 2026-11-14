# S-03 Keep the previous site live when the build fails

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), step 5 (build fails branch)
**Screens:** None

## Actors
- **Build**: Netlify's build (primary)
- **Owner**: fixes the problem and pushes again (outside every story)

## Trigger
The build has started and either finds no readable recipes or fails for another reason.

## Pre-conditions
- A previous successful site is live.

## Acceptance criteria
- S-03.1 Verify that when the Build finds no readable recipe notes, the build fails (non-zero exit status).
- S-03.2 Verify that when the build fails because no recipe is readable, the build log says no readable recipes were found and still names each skipped note with its reason.
- S-03.3 Verify that when the build fails, the Build produces nothing for publishing.
- S-03.4 Verify that when the build fails, the previously published site stays live and unchanged.
- S-03.5 Verify that when any other error stops the build, the build fails the same way and the previous site stays live.

## Post-conditions
- The previous site is still live.
- The build log shows why the build failed.
