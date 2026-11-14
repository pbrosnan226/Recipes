# S-02 Produce and publish the list and recipe pages

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), steps 5 and 6
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) (changed 2026-11-14: replace Recipe list and Recipe page)

## Actors
- **Build**: Netlify's build (primary)
- **Owner**: sees the result on the next page load

## Trigger
The Build has finished reading the notes (S-01) and at least one recipe is readable.

## Pre-conditions
- S-01 has produced a set of readable recipes.

## Acceptance criteria
- S-02.1 (changed 2026-11-14) Verify that the Build produces one Home page that has a card for every readable recipe.
- S-02.2 Verify that the Build produces one Recipe page for every readable recipe.
- S-02.3 (changed 2026-11-14) Verify that the Build produces no page for a skipped note, and the Home page has no card for it.
- S-02.4 (changed 2026-11-14) Verify that the site is static: the produced pages are plain files and need no server of the site's own and the site saves nothing (sign-in and favorites are deferred, see todo.md).
- S-02.5 Verify that the Build publishes the produced site when the build succeeds.
- S-02.6 Verify that every produced page contains a `noindex` robots directive.
- S-02.7 Verify that the produced site includes a `robots.txt` that disallows all crawling.
- S-02.8 Verify that the Build never pushes to GitHub and never deploys on its own beyond Netlify's own publish of a successful build.
- S-02.9 Verify that when the Owner loads the site after a successful build, the Owner sees the new or changed recipes.
- S-02.10 (new 2026-11-13) Verify that the published site contains the photo files copied by S-13, so no page depends on the photo's source site.
- S-02.11 (new 2026-11-14) Verify that on the published Home page, the course chips, **Sort by** control, search and tag selection work using only the published files, with no request to a server of the site's own.
- S-02.12 (new 2026-11-14) Verify that each Recipe page carries the data it needs to rescale ingredients and steps for every servings option, without a request to a server of the site's own.

## Post-conditions
- The new site is live with a list and a page for each readable recipe.
- A recipe note that changed shows its new content; a recipe note that was removed or skipped is gone.
