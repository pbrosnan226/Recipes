# S-01 Read the recipe notes and skip unreadable ones

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), steps 3 and 4
**Screens:** None (build log only)

## Actors
- **Build**: Netlify's build, run when the repo changes on GitHub (primary)

## Trigger
The build has started (S-04).

## Pre-conditions
- The repo checkout holds the vault's notes in its root.

## Acceptance criteria
- S-01.1 Verify that the Build treats a note as a recipe only when it is in the repo root and is tagged `recipe`.
- S-01.2 Verify that the Build ignores a note tagged `recipe` that is in a sub-folder.
- S-01.3 Verify that the Build ignores a root note that is not tagged `recipe`.
- S-01.4 Verify that the Build takes each recipe's name from the note's file name (without `.md`).
- S-01.5 Verify that the Build reads from each readable note its source, site, author, description, photo (changed 2026-11-13: the stored image file's path, see S-01.13), course (changed 2026-11-14, see S-01.15), created date, servings (or batches) and the choices of the servings dropdown, times, tags, ingredients, steps, notes and nutrition table, as the ERD defines them.
- S-01.6 Verify that the Build keeps a recipe's tags in the order the note lists them, and includes the `recipe` tag.
- S-01.7 Verify that the Build skips a recipe note that is missing a required field (source, created date, what the source makes, or servings/batches noun).
- S-01.8 Verify that the Build skips a recipe note whose properties are broken (can't be parsed).
- S-01.9 Verify that the Build skips a recipe note whose ingredient block or steps block is malformed.
- S-01.10 Verify that for each skipped note the build log names the note and says why it was skipped.
- S-01.11 Verify that after skipping a note the Build continues reading the remaining notes.
- S-01.12 (changed 2026-11-14: adds no course) Verify that a recipe note with no photo, no notes, no nutrition table, no description, no site, no times, no tags or no course is still read, not skipped.
- S-01.13 (new 2026-11-13) Verify that when a recipe note's photo line is a Markdown image pointing to a file in `images/` (for example `![French Toast](images/French%20Toast.jpg)`), the Build takes the decoded path (`images/French Toast.jpg`) as the recipe's photo file.
- S-01.14 (new 2026-11-13) Verify that when a recipe note's photo line is a Markdown image pointing to an `http` or `https` address, the Build reads the recipe with no photo, does not skip the note, and writes a build log line starting `NOTE` that names the note and says its photo is an external address.
- S-01.15 (new 2026-11-14) Verify that when a recipe note has a `course` property whose value is one of Breakfast, Main, Side, Soup, Dessert or Sauce, the Build takes it as the recipe's course.
- S-01.16 (new 2026-11-14) Verify that a recipe note with no `course` property is read with no course, and that the recipe then appears on the Home page only under the chip **All**.
- S-01.17 (new 2026-11-14) Verify that when a recipe note's `course` value is not one of the six (or is empty, or holds more than one value), the Build reads the recipe with no course, does not skip the note, and writes a build log line starting `NOTE` that names the note and says its course isn't valid.
- S-01.18 (new 2026-11-14) Verify that the Build offers the course list Breakfast, Main, Side, Soup, Dessert, Sauce, in that order, for the course chips, whatever courses the notes use.
- S-01.19 (deferred 2026-11-14, see todo.md: search by ingredient; the number is reserved)

## Post-conditions
- Every readable recipe note is available to S-02 as a recipe.
- Every skipped note is named, with its reason, in the build log.
