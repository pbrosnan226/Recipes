# S-13 Copy photo files into the site

**Superseded 2026-11-13 by S-44 (uploading the existing photos to Storage), S-51 (uploading new photos), S-05.11 and S-09.2 (showing them from Storage).** The Build no longer reads the notes or `images/` and copies no photo (S-63.3). S-13.1 to S-13.6 are superseded by S-44.8 to S-44.10 and S-05.11/S-09.18; S-13.7 is superseded by S-44.13. The criteria are kept for history.

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), steps 3 and 5
**Screens:** None (build log only; the photo appears on the [Recipe page](../mockups/recipe-page.html), see S-09)

## Actors
- **Build**: Netlify's build (primary)

## Trigger
The Build has read the recipe notes (S-01) and is producing the site (S-02).

## Pre-conditions
- S-01 has produced readable recipes, each with a photo file path or none.

## Acceptance criteria
- S-13.1 Verify that for each readable recipe with a photo file path, the Build copies that file from `images/` into the produced site unchanged (same bytes, no resizing or conversion).
- S-13.2 (changed 2026-11-14: also the card on Home) Verify that the produced Recipe page and the Home card of such a recipe refer to the copied file in the site, not to the photo's source site.
- S-13.3 Verify that a recipe whose photo file does not exist in `images/` is still built, with no photo.
- S-13.4 Verify that for a recipe whose photo file does not exist, the build log has a line starting `NOTE` that names the recipe and the missing file.
- S-13.5 Verify that a missing photo file does not skip the note, stop the build or fail it.
- S-13.6 Verify that a recipe with no photo line produces no `NOTE` line and no copied file.
- S-13.7 Verify that the Build never changes, renames or deletes any file in `images/` in the repo.

## Post-conditions
- Every found photo file is in the produced site next to its recipe page.
- Every recipe with a missing photo file is on the site without a photo and named in the build log.
