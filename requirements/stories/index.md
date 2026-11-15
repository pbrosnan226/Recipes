# Stories

S-01 to S-12 are built and are amended for the 2026-11-14 redesign (changed criteria are marked in each story). S-13 to S-19 are the photo-change stories. S-20 to S-37 are the redesign, courses and Cook mode stories. The Shopping list is deferred (see [todo.md](../todo.md)). Sign-in, accounts and favorites came back on 2026-11-14: S-21, S-24 to S-28 are rewritten and S-77 to S-80 are new. The Owner does all pushing and deploying, outside every story.

**2026-11-13, database-backed recipes:** S-38 to S-64 are new. The notes-at-build-time stories are marked Superseded where the change replaces them (S-01, S-02, S-03, S-04, S-13, S-14, S-15 and S-16); nothing is deleted or renumbered. Changed criteria are marked "(changed 2026-11-13)" in each story.

## [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-54 Load the recipes on the Home page from the database](S-54-load-the-recipes-on-the-home-page.md) (new 2026-11-13) | [Home](../mockups/home.html) |
| 1, 6 | [S-05 See the recipe list](S-05-see-the-recipe-list.md) (changed) | [Home](../mockups/home.html) |
| 2 | [S-20 Filter the recipe list by course](S-20-filter-the-list-by-course.md) (new; S-20.1 changed 2026-11-13: chips read from COURSE) | [Home](../mockups/home.html) |
| 3 | [S-06 Sort the recipe list](S-06-sort-the-recipe-list.md) (changed) | [Home](../mockups/home.html) |
| 4, 6 | [S-07 Search the recipe list](S-07-search-the-recipe-list.md) (changed 2026-11-13: ingredient names too; S-07.8 superseded by S-62) | [Home](../mockups/home.html) |
| 4 | [S-62 Search the recipe list by ingredient](S-62-search-the-recipe-list-by-ingredient.md) (new 2026-11-13) | [Home](../mockups/home.html) |
| 5 | [S-08 Filter the recipe list by a tag](S-08-filter-the-list-by-a-tag.md) (changed) | [Home](../mockups/home.html) |
| 7 | [S-55 Try again when the recipes can't be loaded](S-55-try-again-when-the-recipes-cant-be-loaded.md) (new 2026-11-13) | [Home](../mockups/home.html) (failure state not mocked up) |
| Without JavaScript | [S-56 Tell a Visitor without JavaScript to turn it on](S-56-tell-a-visitor-without-javascript-to-turn-it-on.md) (new 2026-11-13) | [Home](../mockups/home.html), [Recipe](../mockups/recipe.html) (state not mocked up) |

## [W-02 View a recipe](../workflows/W-02-view-a-recipe.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-57 Load a recipe on the Recipe page from the database](S-57-load-a-recipe-on-the-recipe-page.md) (new 2026-11-13) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 1 (can't load) | [S-58 Try again when a recipe can't be loaded](S-58-try-again-when-a-recipe-cant-be-loaded.md) (new 2026-11-13) | [Recipe](../mockups/recipe.html) (failure state not mocked up) |
| 1 (no such recipe) | [S-59 Say when a recipe isn't there](S-59-say-when-a-recipe-isnt-there.md) (new 2026-11-13) | [Recipe](../mockups/recipe.html) (state not mocked up) |
| 1 (old addresses) | [S-60 Redirect the old recipe addresses](S-60-redirect-the-old-recipe-addresses.md) (new 2026-11-13) | None |
| 1 | [S-09 View a recipe](S-09-view-a-recipe.md) (changed 2026-11-13: from the database and Storage) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html) |
| 2 | [S-10 Change the servings](S-10-change-the-servings.md) (changed 2026-11-13) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 2 | [S-61 Scale the amounts in the browser](S-61-scale-amounts-in-the-browser.md) (new 2026-11-13) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 3 | [S-37 Tick off an ingredient](S-37-tick-off-an-ingredient.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html), [Recipe: ingredient sub-headings](../mockups/recipe--sub-headings.html) |
| 4 | Cook mode: [S-29](S-29-turn-on-cook-mode.md). Favorite: [S-25](S-25-favorite-a-recipe.md) and [S-26](S-26-remove-a-favorite.md) (back in scope 2026-11-14) | [Recipe](../mockups/recipe.html) |
| 5 | [S-11 Open the list filtered to a recipe's tag](S-11-open-the-list-from-a-recipes-tag.md) (changed) | [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) |
| 6 | [S-12 Open the source or go back to the list](S-12-follow-the-source-or-go-back.md) (changed) | [Recipe](../mockups/recipe.html), [Home](../mockups/home.html) |

## [W-03 Publish the site](../workflows/W-03-publish-new-or-changed-recipes.html) (changed 2026-11-13: recipes no longer go through the build)
Step 1 (the Owner pushes to GitHub) is done by the Owner outside every story, and so is deploying.

| Step | Story | Screens |
|---|---|---|
| 2 | [S-04 Set up the Netlify build](S-04-set-up-the-netlify-build.md) (changed 2026-11-13; S-04.4 superseded; S-04.8 to S-04.11 new: old build kept under its own command, its tests out of the normal run) | None |
| 2, 3 | [S-63 Publish the page shell and the Supabase settings](S-63-publish-the-page-shell-and-the-supabase-settings.md) (new 2026-11-13) | [Home](../mockups/home.html), [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 4 | [S-64 Fail the build when the Supabase settings are missing](S-64-fail-the-build-when-the-supabase-settings-are-missing.md) (new 2026-11-13) | None |
| 4 (build fails) | [S-03 Keep the previous site live when the build fails](S-03-keep-the-previous-site-when-the-build-fails.md) (changed 2026-11-13; S-03.1 and S-03.2 superseded by S-64) | None |
| 3 (redirect rule) | [S-60 Redirect the old recipe addresses](S-60-redirect-the-old-recipe-addresses.md) | None |
| Superseded 2026-11-13 | [S-01 Read the recipe notes and skip unreadable ones](S-01-read-recipe-notes-and-skip-unreadable-ones.md): by S-43 and S-44 (the rules are reused by the import) | None |
| Superseded 2026-11-13 | [S-02 Produce and publish the list and recipe pages](S-02-produce-and-publish-the-site.md): partly, by S-54, S-57, S-61 and S-63 (S-02.6 to S-02.8 still apply) | None |
| Superseded 2026-11-13 | [S-13 Copy photo files into the site](S-13-copy-photo-files-into-the-site.md): by S-44, S-51, S-05.11 and S-09.2 | None |

## [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html) (changed 2026-11-13: was Save a recipe's photo)
Step 9 (the Owner opens the site) is the Owner's, outside every story; S-54.5 and S-57.7 cover that the recipe is there with no push and no rebuild.

| Step | Story | Screens |
|---|---|---|
| 1 to 3, 8 | [S-48 Check a recipe before saving it](S-48-check-a-recipe-before-saving-it.md) (new 2026-11-13) | None |
| 4 | [S-49 Save a recipe and its parts in one all-or-nothing save](S-49-save-a-recipe-and-its-parts-in-one-all-or-nothing-save.md) (new 2026-11-13) | None |
| 4 (same name) | [S-50 Don't overwrite a recipe with the same name without the Owner's OK](S-50-dont-overwrite-a-recipe-without-the-owners-ok.md) (new 2026-11-13; same name or slug clash) | None |
| 5, 6 | [S-51 Upload the recipe's photo to Storage](S-51-upload-the-recipes-photo-to-storage.md) (new 2026-11-13) | None |
| 5, 7 | [S-52 Keep the recipe without a photo and tell the Owner](S-52-keep-the-recipe-without-a-photo-and-tell-the-owner.md) (new 2026-11-13) | None |
| Course | [S-34 Give new recipes a course](S-34-give-new-recipes-a-course.md) (changed 2026-11-13) | None |
| Rules the Extractor follows | [S-53 Update the extraction wording for the database](S-53-update-the-extraction-wording-for-the-database.md) (new 2026-11-13; supersedes [S-16](S-16-update-the-extraction-wording-for-stored-photos.md)) | None |
| Superseded 2026-11-13 | [S-14 Save a recipe's photo when adding a recipe](S-14-save-a-recipes-photo.md): by S-48 to S-52 | None |
| Superseded 2026-11-13 | [S-15 Save the recipe without a photo when the download fails](S-15-tell-the-owner-when-a-photo-cant-be-downloaded.md): by S-52 | None |

## [W-05 Convert existing photo links to stored files](../workflows/W-05-convert-existing-photo-links.html) (one time; done 2026-11-14, history)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-17 List the existing photo links and get the Owner's confirmation](S-17-list-the-existing-photo-links-and-confirm.md) | None |
| 3 to 6 | [S-18 Download the existing photos and replace the links](S-18-download-the-existing-photos-and-replace-the-links.md) | None |
| 6, 7 | [S-19 Report the converted photos and the failures](S-19-report-the-converted-photos-and-failures.md) | None |

## Sign-in, accounts and favorites (back in scope 2026-11-14)
The sign-in, Create account, Forgot password and Reset password pages have no mockups: the Owner chose to skip them (answer 102). Workout's screens and wording are the reference. S-22 and S-23 (email-link sign-in) were never written and stay unused. The Supabase settings rule for the build is S-64.

### [W-06 Sign in, sign out and reset a password](../workflows/W-06-sign-in.html)
| Step | Story | Screens |
|---|---|---|
| 1, 3, 4 (header) | [S-21 Show Sign in or Sign out in the header](S-21-show-sign-in-or-sign-out-in-the-header.md) (rewritten 2026-11-14) | [Home](../mockups/home.html), [Recipe](../mockups/recipe.html); header not mocked up |
| 1 to 3 | [S-78 Sign in](S-78-sign-in.md) (new 2026-11-14) | Sign in (no mockup), [Home](../mockups/home.html) |
| 4 | [S-24 Sign out and stay signed in](S-24-sign-out-and-stay-signed-in.md) (rewritten 2026-11-14) | [Home](../mockups/home.html), [Recipe](../mockups/recipe.html) |
| 5, 6 | [S-79 Request a password reset email](S-79-request-a-password-reset-email.md) (new 2026-11-14) | Sign in, Forgot password (no mockups) |
| 7, 8 | [S-80 Set a new password from the reset link](S-80-set-a-new-password-from-the-reset-link.md) (new 2026-11-14) | Reset password, Sign in (no mockups) |

### [W-14 Create an account](../workflows/W-14-create-an-account.html)
| Step | Story | Screens |
|---|---|---|
| 1 to 3 | [S-77 Create an account](S-77-create-an-account.md) (new 2026-11-14) | Sign in, Create account (no mockups), [Home](../mockups/home.html) |

### [W-07 Favorite a recipe](../workflows/W-07-favorite-a-recipe.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-25 Favorite a recipe](S-25-favorite-a-recipe.md) (rewritten 2026-11-14) | [Recipe](../mockups/recipe.html); button not mocked up |
| 2 | [S-26 Remove a favorite](S-26-remove-a-favorite.md) (rewritten 2026-11-14) | [Recipe](../mockups/recipe.html); button not mocked up |
| 3 | [S-27 See my favorites](S-27-see-my-favorites.md) (rewritten 2026-11-14) | [Home](../mockups/home.html); Favorites view not mocked up |
| 3 (none) | [S-28 See that there are no favorites yet](S-28-see-that-there-are-no-favorites-yet.md) (rewritten 2026-11-14) | [Home](../mockups/home.html); state not mocked up |

### Reserved numbers, not built
| Workflow | Story | Status |
|---|---|---|
| Supabase | [S-35 Read the Supabase settings from the build settings](S-35-read-the-supabase-settings-from-the-build-settings.md) (changed 2026-11-14: the build fails when the settings are missing, see S-64; covers sign-in too) | Not built; covered by S-63 and S-64 |
| Supabase | S-36 Set up Supabase (number reserved, never written; the recipes schema setup is W-10, S-38 to S-42) | Deferred |

## [W-08 Use Cook mode](../workflows/W-08-use-cook-mode.html)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-29 Turn on Cook mode](S-29-turn-on-cook-mode.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 2 (tab returns) | [S-30 Keep the screen awake when the tab returns](S-30-keep-the-screen-awake-when-the-tab-returns.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |
| 3 | [S-31 Leave Cook mode](S-31-leave-cook-mode.md) (new) | [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) |

## [W-09 Assign courses to recipes](../workflows/W-09-assign-courses-to-recipes.html) (one time; done 2026-11-14, history)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-32 Propose a course for each existing note](S-32-propose-a-course-for-each-existing-note.md) (new) | None |
| 3 | [S-33 Write the confirmed courses into the notes](S-33-write-the-confirmed-courses-into-the-notes.md) (new) | None |
| New recipes | [S-34 Give new recipes a course](S-34-give-new-recipes-a-course.md) (changed 2026-11-13: the course is saved to the database) | None |
| Build reads course | [S-01](S-01-read-recipe-notes-and-skip-unreadable-ones.md) (S-01.15 to S-01.18; superseded 2026-11-13, the import reuses them) | None |

## [W-10 Set up the recipes schema in Supabase](../workflows/W-10-set-up-the-recipes-schema.html) (one time, new 2026-11-13)
| Step | Story | Screens |
|---|---|---|
| 1 to 3 | [S-38 Show the SQL for the recipes schema and get the Owner's approval](S-38-show-the-recipes-schema-sql-and-get-approval.md) | None |
| 4 | [S-39 Apply the recipes schema and check it](S-39-apply-the-recipes-schema-and-check-it.md) | None |
| 4 | [S-40 The database enforces the data model's rules](S-40-the-database-enforces-the-data-models-rules.md) | None |
| 2, 4 | [S-41 Give everyone read-only access to recipes and photos](S-41-give-everyone-read-only-access-to-recipes-and-photos.md) | None |
| 5 | [S-42 Hand over the settings to the Owner](S-42-hand-over-the-settings-to-the-owner.md) | None |

## [W-11 Import the existing notes](../workflows/W-11-import-the-existing-notes.html) (one time, new 2026-11-13)
| Step | Story | Screens |
|---|---|---|
| 1, 2 | [S-43 Read the notes and get the Owner's confirmation to import](S-43-read-the-notes-and-get-the-owners-confirmation.md) | None |
| 3 | [S-44 Import the confirmed recipes into the database](S-44-import-the-confirmed-recipes-into-the-database.md) | None |
| 4 | [S-45 Compare every imported recipe with the current built site](S-45-compare-every-imported-recipe-with-the-current-built-site.md) | None |
| 5 | [S-46 Fix the differences and compare again](S-46-fix-the-differences-and-compare-again.md) | None |
| 6 | [S-47 Write the guide to retiring the notes](S-47-write-the-guide-to-retiring-the-notes.md) (new 2026-11-13) | None |

## Want to try and ratings (S-65 to S-76, new 2026-11-13)
(changed 2026-11-14) Sign-in is planned (W-06, W-14; S-77 to S-80) and the recipes are in Supabase; build these after the sign-in stories. A Member is anyone signed in with an account. None of these screens is mocked up.

### [W-01 Browse the recipe list](../workflows/W-01-browse-the-recipe-list.html) (added parts)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-65 Show the average rating on a recipe card](S-65-show-the-average-rating-on-a-card.md) | None (not mocked up) |
| 1 | [S-66 Show my own rating or Want to try badge on a recipe card](S-66-show-my-rating-or-want-to-try-badge-on-a-card.md) | None (not mocked up) |
| 2 | [S-68 Filter the recipe list by Want to try or Rated](S-68-filter-the-list-by-want-to-try-or-rated.md) (also W-12 step 3) | None (not mocked up) |
| 3 | [S-67 Sort the recipe list by rating](S-67-sort-the-recipe-list-by-rating.md) | None (not mocked up) |

### [W-02 View a recipe](../workflows/W-02-view-a-recipe.html) (added parts)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-69 Show the average rating on the Recipe page](S-69-show-the-average-rating-on-the-recipe-page.md) | None (not mocked up) |
| 1 (signed out) | [S-70 Hide the want-to-try and rating parts from signed-out Visitors](S-70-hide-the-personal-parts-from-signed-out-visitors.md) (also W-01, W-12, W-13) | None (not mocked up) |

### [W-12 Mark a recipe want to try](../workflows/W-12-mark-a-recipe-want-to-try.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-71 Mark a recipe Want to try](S-71-mark-a-recipe-want-to-try.md) | None (not mocked up) |
| 2 | [S-72 Take a recipe off my Want to try list](S-72-take-a-recipe-off-my-want-to-try-list.md) | None (not mocked up) |
| 3 | [S-68](S-68-filter-the-list-by-want-to-try-or-rated.md) (see W-01 above) | None (not mocked up) |

### [W-13 Rate a recipe](../workflows/W-13-rate-a-recipe.html)
| Step | Story | Screens |
|---|---|---|
| 1 | [S-73 Rate a recipe](S-73-rate-a-recipe.md) | None (not mocked up) |
| 2 | [S-74 Change my rating](S-74-change-my-rating.md) | None (not mocked up) |
| 3 | [S-75 Remove my rating](S-75-remove-my-rating.md) | None (not mocked up) |
| 4 | [S-76 Update the average when a rating changes](S-76-update-the-average-when-a-rating-changes.md) | None (not mocked up) |
