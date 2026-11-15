# S-60 Redirect the old recipe addresses

**Workflow:** [W-02 View a recipe](../workflows/W-02-view-a-recipe.html), step 1, and [W-03 Publish the site](../workflows/W-03-publish-new-or-changed-recipes.html), step 3 (the redirect rule)
**Screens:** None

## Actors
- **Visitor**: opens an old bookmarked or shared address (primary)
- **Build**: publishes the redirect rule

## Trigger
The Visitor opens an old address `/recipes/<slug>.html`.

## Pre-conditions
- The site is live.

## Acceptance criteria
- S-60.1 Verify that opening `/recipes/<slug>.html` takes the Visitor to `/recipe?name=<slug>` with the same slug (for example `/recipes/french-toast.html` to `/recipe?name=french-toast`).
- S-60.2 Verify that for every recipe the current built site publishes a page for, its old address leads to that recipe's page on the new site.
- S-60.3 Verify that the redirect is a Netlify rule in the repo's `netlify.toml` and is published with the site.
- S-60.4 Verify that the new site publishes no page at `/recipes/<slug>.html`: the old address is only a redirect.
- S-60.5 Verify that an old address whose slug matches no recipe in the database ends on "That recipe isn't here." (S-59).

## Post-conditions
- Old addresses still reach their recipes.
