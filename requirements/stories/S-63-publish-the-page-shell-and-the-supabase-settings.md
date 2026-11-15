# S-63 Publish the page shell and the Supabase settings

**Workflow:** [W-03 Publish the site](../workflows/W-03-publish-new-or-changed-recipes.html), steps 2 and 3
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html)

## Actors
- **Build**: Netlify's build, run when the repo changes on GitHub (primary)
- **Owner**: pushes and sets the Netlify settings, outside this story

## Trigger
The Owner pushes site code changes to GitHub and the Build starts on the push (S-04).

## Pre-conditions
- The Owner has added the project address and the public read-only key to the Netlify settings (S-42).

## Acceptance criteria
- S-63.1 Verify that the Build publishes the Home page, the one Recipe page (`/recipe`), the styles, the scripts and the font files.
- S-63.2 Verify that the Build publishes the Supabase settings (the project address and the public read-only key) taken from the Netlify settings, in a form the pages' scripts read.
- S-63.3 Verify that the Build reads no recipe: it reads no note and no file in `images/` and makes no request to Supabase.
- S-63.4 Verify that the Build produces no page for any single recipe.
- S-63.5 Verify that the Build publishes the redirect rule for the old recipe addresses (S-60).
- S-63.6 Verify that the published files hold no key other than the public read-only key.
- S-63.7 Verify that the published site saves nothing.
- S-63.8 Verify that every published page contains a `noindex` robots directive (restates S-02.6).
- S-63.9 Verify that the published site includes a `robots.txt` that disallows all crawling (restates S-02.7).
- S-63.10 Verify that a recipe added to Supabase needs no push and no build to show on the site.
- S-63.11 (new 2026-11-13) Verify that the build Netlify runs does not run the old note-reading build (S-04.8, S-04.9).

## Post-conditions
- The new site is live; it reads recipes from Supabase when a page is opened.
