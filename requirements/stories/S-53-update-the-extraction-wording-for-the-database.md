# S-53 Update the extraction wording for the database

**Workflow:** [W-04 Add a recipe to the database](../workflows/W-04-save-a-recipes-photo.html), steps 2 to 8 (the rules the Extractor follows)
**Screens:** None

## Actors
- **Extractor**: reads these rules each time it runs (primary)

## Trigger
Claude is asked to add a recipe from a link.

## Pre-conditions
- The project's `CLAUDE.md` and `.claude/skills/recipe-extract/SKILL.md` exist.

## Acceptance criteria
- S-53.1 Verify that `.claude/skills/recipe-extract/SKILL.md` tells the Extractor to save a recipe to the `recipes` schema in Supabase instead of writing a note in the vault root, in its description and its opening paragraph.
- S-53.2 Verify that the skill no longer contains the note template (the properties block, the Dataview block and the photo line `![<dish>](images/...)`), and instead lists what is saved: the recipe data, aliases, tags in order, serving options, ingredients, steps, notes with level, and nutrients, as the ERD defines them.
- S-53.3 Verify that the skill's servings section no longer tells the Extractor to write a Dataview or Meta Bind dropdown or to use `scripts/scale/view.js`, and instead tells it to save the servings label and the serving options (the choices of the dropdown) and to save each ingredient's fields (key, name, text as written, group, quantity, high quantity, units, fixed text, lead text, grams before, hidden).
- S-53.4 Verify that the skill's photo section tells the Extractor to download the source photo and upload it to the Storage bucket exactly as downloaded, named after the recipe with the extension of the type actually downloaded, using the service key from the environment variable, and to save no photo in `images/`.
- S-53.5 Verify that the skill tells the Extractor never to read the service key and never to print it in chat, in a command, in a file or in a log.
- S-53.6 Verify that the skill tells the Extractor, when a photo can't be downloaded or uploaded, to keep the recipe saved without a photo and tell the Owner in chat which photo failed and why; and, when the source gives no photo, to leave the photo path empty and say so in chat.
- S-53.7 Verify that the skill states the checks the Extractor makes before saving (S-48.2 to S-48.7), that a failed check saves nothing and is reported in chat, and that the save is all-or-nothing.
- S-53.8 Verify that the skill tells the Extractor, when a recipe has the same name as an existing one or a different name with the same slug, to ask the Owner, to replace the whole recipe and overwrite its photo only on OK, and otherwise to save nothing (in place of "Ask before overwriting a note").
- S-53.9 Verify that the skill's course section keeps the rules of S-34, saving the course to the database.
- S-53.10 Verify that the skill's close-out section no longer refers to a note file, and still says to report only what went wrong or was left out and any judgment call the Owner might want to change.
- S-53.11 Verify that the skill keeps its content rules unchanged: add nothing of your own, reword don't copy, measurements exactly as written, amounts in the steps as `{key}` tokens, include/skip, and omit what the source doesn't publish.
- S-53.12 Verify that the skill's section on pulling the source data (the extraction ladder) is unchanged.
- S-53.13 Verify that `CLAUDE.md`, under "Documenting a recipe", says a new recipe is saved to the database and its photo uploaded to Storage, in place of the note, the servings dropdown (Dataview + Meta Bind, `scripts/scale/view.js`) and the photo "as a file in `images/`"; and that its opening paragraph and the sentence in "Branches (building the site)" about "documenting a recipe note" say recipes live in the Supabase `recipes` schema with photos in Storage, not as notes in the vault; and that its line telling the Extractor to say a flagged thing in chat "rather than writing it into the note" says "the recipe" instead of "the note".
- S-53.14 Verify that `CLAUDE.md` keeps the rules "Add nothing of your own", "Write measurements exactly as the source writes them" and the Capture/Skip list (apart from the photo wording in S-53.13).
- S-53.15 Verify that the skill and `CLAUDE.md` don't tell the Extractor to resize or convert photos.
- S-53.16 Verify that the "Testing (site)" section of `CLAUDE.md` is changed only to say that the old note-reading build's tests (the build tests S-01 to S-04) will be left out of the normal test run (once S-04.10 is built) and how to run them, and that nothing else in the skill or `CLAUDE.md` changes (beyond S-53.13).

## Post-conditions
- Future recipes added by the Extractor follow W-04.
