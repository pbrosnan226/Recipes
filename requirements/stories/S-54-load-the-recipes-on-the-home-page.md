# S-54 Load the recipes on the Home page from the database

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), step 1
**Screens:** [Home](../mockups/home.html)

## Actors
- **Visitor**: anyone who opens the site (primary)
- **Supabase**: sends the recipes

## Trigger
The Visitor opens the site's address.

## Pre-conditions
- The site is live with the Supabase settings published (S-63).
- JavaScript is on in the Visitor's browser.
- The recipes are in the database (S-44, S-49).

## Acceptance criteria
- S-54.1 Verify that when the Home page opens, the page asks Supabase for the recipes with the project address and the public read-only key from the published settings.
- S-54.2 Verify that once the recipes are loaded, the Home page shows one card for each recipe the database holds, sorted by recipe name, A to Z, with the chip **All** selected, **Name** chosen in the **Sort by** control and the search box empty (S-05.3).
- S-54.3 Verify that each card shows the recipe's course label, name, tags and photo as S-05.4 describes, taken from the database.
- S-54.4 Verify that the page makes no request that writes to Supabase, and that no key other than the public read-only key is in the page or its requests.
- S-54.5 Verify that a recipe added to the database shows as a card the next time the Home page is loaded, with no push to GitHub and no rebuild.
- S-54.6 Verify that a recipe deleted from the database no longer shows as a card the next time the Home page is loaded.
- S-54.7 Verify that the chips, the **Sort by** control, the search and the tag selection work on the recipes already loaded, with no further request to a server of the site's own.

- S-54.8 (new 2026-11-13) Verify that while the recipes are loading, the page shows nothing extra: no card, no message and no loading indicator.
- S-54.9 (new 2026-11-13) Verify that when the database holds no recipes, the Home page shows no cards and shows "Nothing matches that. Try another word."
- S-54.10 (new 2026-11-13) Verify that the site header (the site name **Recipes** and the **Browse** link) shows while loading, once loaded, and when the recipes can't be loaded.
- S-54.11 (new 2026-11-13) Verify that the course chips are read from the COURSE table in position order (S-20.1).

## Post-conditions
- The Visitor sees all the recipes in the database. Nothing is saved.
