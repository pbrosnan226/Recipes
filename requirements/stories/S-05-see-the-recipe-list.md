# S-05 See the recipe list

**Workflow:** [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html), steps 1 and 6 (changed 2026-11-14: was steps 1 and 5)
**Screens:** [Home](../mockups/home.html) (changed 2026-11-14: replaces Recipe list)

## Actors
- **Visitor**: anyone who opens the site (primary) (changed 2026-11-14: was Owner)

## Trigger
The Visitor opens the site's address.

## Pre-conditions
- The site is live with at least one recipe in the database (changed 2026-11-13: the recipes are loaded from Supabase when the page opens, S-54).

## Acceptance criteria
- S-05.1 (changed 2026-11-14) Verify that the Visitor sees the site name **Recipes**, the page title "Everything we cook.", a search box, the course chips, a **Sort by** control, a recipe count and a grid of recipe cards.
- S-05.2 (changed 2026-11-14; changed 2026-11-13: per recipe in the database) Verify that the grid has one card per recipe in the database.
- S-05.3 (changed 2026-11-14) Verify that the page starts with the cards sorted by recipe name, A to Z, the chip **All** selected, **Name** chosen in the **Sort by** control and the search box empty.
- S-05.4 (changed 2026-11-14) Verify that each card shows the recipe's photo, the recipe's course label (when the recipe has a course), the recipe's name and the recipe's tags.
- S-05.5 (changed 2026-11-14) Verify that when the Visitor selects a card's photo or name, the system opens that recipe's page.
- S-05.6 (changed 2026-11-14) Verify that every tag of a recipe appears on its card as its own clickable tag, including the tag `recipe`, in the order the recipe lists them (changed 2026-11-13: the RECIPE_TAG position order, was "the note lists them").
- S-05.7 (removed 2026-11-14: the table and its **Site** column are replaced by cards; the number is not reused)
- S-05.8 (changed 2026-11-14) Verify that a recipe with no tags shows no tags on its card.
- S-05.9 (changed 2026-11-14) Verify that the Home page works on a phone-sized screen: the title, search box, chips, **Sort by** control and cards are usable without zooming and without sideways scrolling.
- S-05.10 (changed 2026-11-14) Verify that in light mode the page uses the cream (#F7F6EE) background with the sage green (#3F6B4F) accent, and that when the device is set to dark mode the page uses the dark version of that palette shown in the approved mockups (background #141A16, accent #8DBE9D); headings use Fraunces and body text uses Inter, from font files stored in the repo and published with the site, so no page loads a font from another site.
- S-05.11 (new 2026-11-14; changed 2026-11-13: the photo comes from Storage, not from a copy made at build time) Verify that a card shows the recipe's photo from the file at the recipe's photo path in the Storage bucket, and that a recipe with no photo path, or whose photo file is missing in the bucket, shows a plain tinted box in the photo's place.
- S-05.13 (new 2026-11-14; changed 2026-11-14: sign-in is back in scope) Verify that the header shows the site name **Recipes** and a **Browse** link that opens the Home page, plus a **Sign in** link when the Visitor isn't signed in, or **Favorites** and **Sign out** links when a Member is signed in (S-21).
- S-05.12 (new 2026-11-14) Verify that the recipe count shows the number of cards shown, as "N recipes", or "1 recipe" when there is one.

## Post-conditions
- The Visitor sees all recipes. Nothing is saved.
