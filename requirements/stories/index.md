# Stories

S-01 to S-12 are built and are amended for the 2026-11-14 redesign (changed criteria are marked in each story). S-13 to S-19 are the photo-change stories, not yet built. The Shopping list, sign-in, favorites, Supabase and search by ingredient are deferred (see [todo.md](../todo.md)); their story numbers are reserved and marked Deferred. The Owner does all pushing and deploying, outside every story.

## [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html)
| Step | Story | Screens |
|---|---|---|
| 1, 6 | [S-05 See the recipe list](S-05-see-the-recipe-list.md) (changed) | [Home](../mockups/home.html) |
| 2 | [S-20 Filter the recipe list by course](S-20-filter-the-list-by-course.md) (new) | [Home](../mockups/home.html) |
| 3 | [S-06 Sort the recipe list](S-06-sort-the-recipe-list.md) (changed) | [Home](../mockups/home.html) |
| 4, 6 | [S-07 Search the recipe list](S-07-search-the-recipe-list.md) (changed: name, site and tags only; S-07.8 deferred) | [Home](../mockups/home.html) |
| 5 | [S-08 Filter the recipe list by a tag](S-08-filter-the-list-by-a-tag.md) (changed) | [Home](../mockups/home.html) |

## [W-02 View a recipe](../workflows/W-02-view-a-recipe.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-09 View a recipe](S-09-view-a-recipe.md) (changed) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html) |
| 2 | [S-10 Change the servings](S-10-change-the-servings.md) (changed) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 3 | [S-37 Tick off an ingredient](S-37-tick-off-an-ingredient.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html) |
| 4 | Cook mode: [S-29](S-29-turn-on-cook-mode.md). The Favorite part of this step is deferred. | [Recipe](../mockups/recipe.html) |
| 5 | [S-11 Open the list filtered to a recipe's tag](S-11-open-the-list-from-a-recipes-tag.md) (changed) | [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) |
| 6 | [S-12 Open the source or go back to the list](S-12-follow-the-source-or-go-back.md) (changed) | [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) |

## [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html)
Step 1 (the Owner pushes to GitHub) is done by the Owner outside every story, and so is deploying.

| Step | Story | Screens |
|---|---|---|
| 2 | [S-04 Set up the Netlify build](S-04-set-up-the-netlify-build.md) (changed) | None |
| 3, 4 | [S-01 Read the recipe notes and skip unreadable ones](S-01-read-recipe-notes-and-skip-unreadable-ones.md) (changed: course; S-01.19 deferred) | None |
| 5, 6 | [S-02 Produce and publish the list and recipe pages](S-02-produce-and-publish-the-site.md) (changed) | [Home](../mockups/home.html), [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 5 (build fails) | [S-03 Keep the previous site live when the build fails](S-03-keep-the-previous-site-when-the-build-fails.md) | None |
| 3, 5 (photos) | [S-13 Copy photo files into the site](S-13-copy-photo-files-into-the-site.md) (changed) | None |

## [W-04 Save a recipe's photo](../workflows/W-04-save-a-recipes-photo.html)
Step 7 (the Owner pushes) is done by the Owner outside every story.

| Step | Story | Screens |
|---|---|---|
| 1 to 5 | [S-14 Save a recipe's photo when adding a recipe](S-14-save-a-recipes-photo.md) | None |
| 3, 6 | [S-15 Save the recipe without a photo when the download fails](S-15-tell-the-owner-when-a-photo-cant-be-downloaded.md) | None |
| 2 to 6 (rules) | [S-16 Update the extraction wording for stored photos](S-16-update-the-extraction-wording-for-stored-photos.md) | None |

## [W-05 Convert existing photo links to stored files](../workflows/W-05-convert-existing-photo-links.html)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-17 List the existing photo links and get the Owner's confirmation](S-17-list-the-existing-photo-links-and-confirm.md) | None |
| 3 to 6 | [S-18 Download the existing photos and replace the links](S-18-download-the-existing-photos-and-replace-the-links.md) | None |
| 6, 7 | [S-19 Report the converted photos and the failures](S-19-report-the-converted-photos-and-failures.md) | None |

## W-06 Sign in and W-07 Favorite a recipe (Deferred 2026-11-14, see [todo.md](../todo.md))
Not built now. Do not build any story below.

| Workflow | Story | Status |
|---|---|---|
| W-06 | [S-21 Show Sign in or Sign out in the header](S-21-show-sign-in-or-sign-out-in-the-header.md) | Deferred |
| W-06 | S-22 Request a sign-in link, S-23 Open the sign-in link (numbers reserved, never written) | Deferred |
| W-06 | [S-24 Sign out and stay signed in](S-24-sign-out-and-stay-signed-in.md) | Deferred |
| W-07 | [S-25 Favorite a recipe](S-25-favorite-a-recipe.md) | Deferred |
| W-07 | [S-26 Remove a favorite](S-26-remove-a-favorite.md) | Deferred |
| W-07 | [S-27 See my favorites](S-27-see-my-favorites.md) | Deferred |
| W-07 | [S-28 See that there are no favorites yet](S-28-see-that-there-are-no-favorites-yet.md) | Deferred |
| Supabase | [S-35 Read the Supabase settings from the build settings](S-35-read-the-supabase-settings-from-the-build-settings.md) | Deferred |
| Supabase | S-36 Set up Supabase (number reserved, never written) | Deferred |

## [W-08 Use Cook mode](../workflows/W-08-use-cook-mode.html)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-29 Turn on Cook mode](S-29-turn-on-cook-mode.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 2 (tab returns) | [S-30 Keep the screen awake when the tab returns](S-30-keep-the-screen-awake-when-the-tab-returns.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 3 | [S-31 Leave Cook mode](S-31-leave-cook-mode.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |

## [W-09 Assign courses to recipes](../workflows/W-09-assign-courses-to-recipes.html)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-32 Propose a course for each existing note](S-32-propose-a-course-for-each-existing-note.md) (new) | None |
| 3 | [S-33 Write the confirmed courses into the notes](S-33-write-the-confirmed-courses-into-the-notes.md) (new) | None |
| New recipes | [S-34 Give new recipes a course](S-34-give-new-recipes-a-course.md) (new) | None |
| Build reads course | [S-01](S-01-read-recipe-notes-and-skip-unreadable-ones.md) (S-01.15 to S-01.18) | None |
