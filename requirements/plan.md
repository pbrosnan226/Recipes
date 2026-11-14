# Recipe website plan

## Goal
A personal website for browsing the recipes in the Obsidian vault: one table of all recipes that can be
sorted by clicking column headers and searched, and a page per recipe that looks and behaves like the
note in Obsidian (including the servings dropdown), just nicer. The site is built from this GitHub repo and
hosted on Netlify. The owner decides when to release.

## Change 2026-11-13: photos stored in the repo
Recipe photos are saved as files in an `images/` folder in the vault root instead of being linked from the
source sites. The site shows its own copies. Changes: W-02 step 1 and W-03 steps 3 and 5 (photo now comes
from the repo), new W-04 (save a photo when adding a recipe) and W-05 (one-time conversion of the 21
existing photo links), RECIPE.photo_url becomes RECIPE.photo_file in the ERD, S-09 photo criteria, and the
`recipe-extract` skill and CLAUDE.md wording about the source photo link.

## Change 2026-11-14: redesign from the Owner's design file
The Owner's Claude Design file (https://claude.ai/artifact/UwuhyttRor8TPLzQUaW7i5: Home, Recipe, Recipe on phone, Shopping list) replaces the approved look and screens. Answer: match "Everything in it", except the shopping list, which is deferred to [todo.md](todo.md). Changes:
- **Look:** cream (#F7F6EE) and sage green (#3F6B4F), Fraunces headings and Inter body, kept with dark mode following the device setting.
- **Home (W-01):** a photo card grid replaces the sortable table. Course chips filter by course. A sort control (name, site) replaces header sorting. Search matches recipe name, site and tags (ingredient search deferred, see todo.md). Each card shows photo, course and name. Tags stay searchable and clickable.
- **Recipe page (W-02):** hero layout with course, description, times, servings dropdown, a Favorite button (signed-in only), Cook mode, ingredient checkboxes (not remembered), method, collapsible nutrition, source link.
- **Courses (new data):** one course per recipe from a fixed list (Breakfast, Main, Side, Soup, Dessert, Sauce), stored as a `course` property in each note. The Owner decided "whatever makes sense with the current ERD": a COURSE table and a one-to-many link from RECIPE, the same shape a database will need. The Extractor proposes a value for each of the 24 existing notes and the Owner confirms (W-09).
- **Accounts and favorites (new):** Supabase holds accounts and favorites. Accounts are invite-only, sign-in is by an email link (no passwords), and each person has their own favorites. The Favorite button and Favorites nav link are hidden until signed in (W-06, W-07). This is the first time the site saves anything.
- **Cook mode (new, W-08):** larger steps, and the screen is kept awake where the browser allows.
- **Deferred:** the Shopping list (its page, "Add to shopping list", "Send to Reminders") is out of this change; see [todo.md](todo.md).

## Scope cut 2026-11-14 (later the same day)
The Owner: "i dont want a login yet", "hide favorites for now...add this and login to the todo", and for ingredient search "dont do this yet". So, deferred to [todo.md](todo.md): sign-in (W-06), favorites (W-07), the Supabase project, accounts, and searching by ingredient. The site stays fully static and saves nothing. Header has no Sign in or Favorites link and recipe pages have no Favorite button. Search matches recipe name, site and tags only. W-06 and W-07 stay in the plan, marked Deferred. Still in this change: new look, card home, course chips, sort control, recipe page layout, Cook mode (W-08), courses (W-09), photos.

## Out of scope
- Adding, editing or deleting recipes on the site (recipes are edited in Obsidian).
- Passwords and open sign-up (accounts are invite-only, email link).
- The Shopping list and Send to Reminders (see todo.md).
- Sorting by prep, cook or total time.
- Sorting by prep, cook or total time, and the author column in the table.
- Remembering the servings choice or the ingredient checkboxes between visits.
- Search engine listing (the site asks search engines not to index it).
- Resizing or converting photos (stored exactly as downloaded).
- The Owner's own dish photos (only the source's photo is stored).

## Actors
| Actor | Who or what it is | What it can do |
|---|---|---|
| Owner | The person who keeps the vault and uses the site (on Mac and phone) | Add or edit recipes in Obsidian and push to GitHub; invite Members in Supabase; browse and use the site as a Visitor or Member |
| Build | Netlify's build, run when the repo changes on GitHub | Read the recipe notes and their photo files, produce the site, publish it, skip notes it can't read |
| Visitor | Anyone who opens the site | Browse, search, filter, sort and open recipes, use Cook mode, change servings |
| Member (deferred) | An invited person who signs in with an email link | Everything a Visitor can, plus favorite recipes and see their own favorites |
| Supabase (deferred) | The hosted service that holds accounts and favorites | Send sign-in links, store each Member's favorites |
| Extractor | The `recipe-extract` skill, run by Claude when the Owner asks to add a recipe or convert existing ones | Download a recipe's source photo into `images/`, write the note's photo line, tell the Owner when a photo can't be downloaded |

## Workflows
Diagrams: [workflows/index.html](workflows/index.html)

### W-01 Browse the recipe list
- **Actors:** Visitor
- **Starts when:** The Visitor opens the site's address.
- **Steps:**
  1. Visitor opens the site; the cards show all recipes sorted by name, A to Z, with the course chip All selected.
  2. Visitor may select a course chip; only recipes of that course show.
  3. Visitor may change the sort control (name or site); the cards reorder.
  4. Visitor may type in the search box; only recipes whose name, site or tags contain the text show.
  5. Visitor may select a tag on a card; the search box fills with that tag and the cards filter to it.
  6. If nothing matches, the page shows "Nothing matches that. Try another word." Otherwise Visitor selects a card and goes to W-02.
- **Ends when:** The Visitor opens a recipe or leaves the site.
- **Errors and edge cases:** A recipe with no photo shows a plain tinted box; a recipe with no course shows only under All. Clearing the search or choosing All restores the full list. Chips, sort and search combine.

### W-02 View a recipe
- **Actors:** Visitor
- **Starts when:** The Visitor selects a card on the home page.
- **Steps:**
  1. The recipe page shows the course, name, description, times, servings dropdown, source link, photo, ingredients (a checkbox list of scaled amount and name, with sub-heading rows for groups), method, the author's notes and the nutrition (when the recipe has them).
  2. Visitor may change the servings dropdown; the amounts in the ingredients and in the steps rescale.
  3. Visitor may tick an ingredient's checkbox; it is struck through. Ticks are not remembered.
  4. Visitor may use Cook mode (W-08). (Favoriting is deferred.)
  5. Visitor may select a tag; goes to the home list filtered to that tag.
  6. Visitor may open the nutrition section, select the source link (opens the original recipe page) or select Back to all recipes.
- **Ends when:** The Visitor goes back to the list or the source.
- **Errors and edge cases:** The dropdown starts at the source's servings every visit. A recipe with no photo, notes, description, times or nutrition simply omits those parts. A recipe whose photo file is missing shows without a photo. Recipes that scale by batches show the batch dropdown the note defines.

### W-03 Publish new or changed recipes
- **Actors:** Owner, Build
- **Starts when:** The Owner pushes recipe changes to GitHub.
- **Steps:**
  1. Owner pushes the vault repo to GitHub.
  2. Build starts automatically on the push.
  3. Build reads every recipe note (notes tagged `recipe`) and the image file each note points to.
  4. If a note can't be read, Build skips it and continues with the rest.
  5. Build produces the list and the recipe pages, copies the photo files into the site, and publishes them.
  6. Owner sees the new or changed recipes on the next page load.
- **Ends when:** The new site is live.
- **Errors and edge cases:** A skipped note is missing from the site until it is fixed and pushed; the build log names it. If a note's photo file is missing, the recipe still builds without a photo and the log gets a NOTE line. If the whole build fails, the previous site stays live.

### W-04 Save a recipe's photo
- **Actors:** Owner, Extractor
- **Starts when:** The Owner asks Claude to add a recipe from a link.
- **Steps:**
  1. Owner shares the recipe link.
  2. Extractor reads the recipe page and finds its photo address.
  3. Extractor downloads the photo. If the download fails (blocked, dead link), go to step 6.
  4. Extractor saves the file exactly as downloaded, in `images/`, named after the recipe note (for example `images/French Toast.jpg`).
  5. Extractor writes the note's photo line as a Markdown image pointing to that file. Go to step 7.
  6. Extractor saves the note without a photo line and tells the Owner in chat which photo couldn't be downloaded and why.
  7. Owner pushes the changes (W-03).
- **Ends when:** The note and its image file (if any) are saved.
- **Errors and edge cases:** A recipe whose source gives no photo has no photo line. The Owner is told in chat whenever a photo is missing. Nothing is converted or resized.

### W-05 Convert existing photo links to stored files (one time)
- **Actors:** Owner, Extractor
- **Starts when:** The Owner asks Claude to store the photos of the 21 existing notes.
- **Steps:**
  1. Extractor lists each note's photo link (note, source address).
  2. Owner confirms the download of the listed photos.
  3. For each note, Extractor downloads the photo. If it fails, go to step 6.
  4. Extractor saves the file as downloaded in `images/`, named after the note.
  5. Extractor replaces the note's external photo line with a Markdown image pointing to the file.
  6. If a download failed, Extractor leaves that note without a photo line, and lists it in chat with the reason.
  7. Extractor reports the files saved (name, source, size) and the failures.
- **Ends when:** Every note has either a stored photo or is listed as failed.
- **Errors and edge cases:** Blocked sources (for example Food Network) end up without photos. The notes' other contents are not changed.

### W-06 Sign in (DEFERRED 2026-11-14, see todo.md; not built now)
- **Actors:** Member, Supabase
- **Starts when:** A Visitor selects Sign in in the site header.
- **Steps:**
  1. Visitor selects Sign in and types their email address.
  2. If the address isn't on the invited list, the site says the email isn't invited and stops. Otherwise Supabase emails a one-time link.
  3. Visitor opens the link in their email.
  4. The site shows them as signed in (header shows Sign out, and the Favorite button and Favorites link appear).
  5. Member may select Sign out at any time; the site returns to the signed-out view.
- **Ends when:** The Member is signed in or signed out.
- **Errors and edge cases:** An expired or used link shows a message with a way to request a new one. Closing the site and reopening keeps a Member signed in on that device until they sign out.

### W-07 Favorite a recipe (DEFERRED 2026-11-14, see todo.md; not built now)
- **Actors:** Member, Supabase
- **Starts when:** A Member opens a recipe page, or selects Favorites in the header.
- **Steps:**
  1. Member selects Favorite on a recipe page; the recipe is saved to their favorites and the button shows Favorited.
  2. Member selects Favorited again to remove it.
  3. Member selects Favorites in the header; the home page titled "Your favorites." shows only their favorites, with the same course chips, sort and search.
- **Ends when:** The favorite is saved or removed, or the Member sees their favorites.
- **Errors and edge cases:** Each Member sees only their own favorites. If saving fails (no network), the button returns to its old state and says so. With no favorites, the Favorites view says "No favorites yet." A favorited recipe that no longer exists on the site is not shown.

### W-08 Use Cook mode
- **Actors:** Visitor
- **Starts when:** The Visitor selects Cook mode on a recipe page.
- **Steps:**
  1. Visitor selects Cook mode; the steps get larger and the button reads Leave cook mode.
  2. The site asks the browser to keep the screen awake. If the browser can't, only the larger steps apply.
  3. Visitor selects Leave cook mode, or leaves the page; steps return to normal size and the screen may sleep again.
- **Ends when:** Cook mode is off.
- **Errors and edge cases:** If the browser releases the screen lock (for example the tab is hidden), it is requested again when the Visitor returns while Cook mode is on.

### W-09 Assign courses to recipes (one time)
- **Actors:** Owner, Extractor
- **Starts when:** The Owner asks Claude to add courses to the existing notes.
- **Steps:**
  1. Extractor proposes one course for each of the 24 notes from the list (Breakfast, Main, Side, Soup, Dessert, Sauce).
  2. Owner confirms or changes each course.
  3. Extractor writes a `course` property in each note.
- **Ends when:** Every note has a confirmed course.
- **Errors and edge cases:** New recipes get a course when they are added; the course comes from the source's own category when it matches the list, otherwise the Owner is asked.

## Screens
Mockups: the Owner's design file (https://claude.ai/artifact/UwuhyttRor8TPLzQUaW7i5) is the reference for the new look. The mockups are redrawn from it: Home, Recipe (desktop) and Recipe on phone, in [mockups/index.html](mockups/index.html).

### Home
- **Used in:** W-01, W-07 step 3
- **Shows:** Header (site name Recipes, nav Browse), page title, search box, course chips (All plus each course), a sort control (name, site), a recipe count, a grid of cards, and "Nothing matches that" when empty.
- **Fields:** Search: text, optional, matches recipe name, site and tags. Course chip: one selected, default All. Sort: name or site.
- **Cards:** photo (or a plain tinted box when no photo), course label, recipe name, tags.
- **Actions:** type → filter; chip → filter by course; sort → reorder; tag → fills the search box; card → Recipe page; 
- **Example data:** French Toast / Breakfast; Chickpea Curry / Main; Apple Pie / Dessert; Broccoli Cheddar Soup / Soup.

### Recipe
- **Used in:** W-02, W-07, W-08
- **Shows:** Header, Back to all recipes, course, name, description, prep/cook/total time, servings dropdown with "(the source makes N)", Cook mode button, source link, photo, ingredients (a checkbox list of scaled amount and name, with a sub-heading row for each group; the 'As written' column is dropped), method, notes, nutrition (collapsible, per the recipe's own basis line).
- **Actions:** servings → rescales ingredients and steps; checkbox → strikes the ingredient (not remembered); Cook mode → W-08; tag → Home filtered; source link; Back.
- **Example data:** French Toast (servings 4; 2/4/6/8/12), Serious Eats.

### Recipe on phone
- **Used in:** W-02
- **Shows:** The same content in one column at phone width (about 390px).

## Data model
See [erd.md](erd.md).

## Data and rules
- Courses: a fixed list (Breakfast, Main, Side, Soup, Dessert, Sauce), one per recipe, in each note's `course` property; a recipe without one shows only under All.
- (Deferred, see todo.md) Accounts and favorites live in Supabase: invite-only accounts, sign-in by email link, one favorites list per account. The site is static; only favorites and sign-in talk to Supabase. Recipes still come from GitHub, so a favorite refers to its recipe by the recipe's name until recipes move to a database. The Owner creates the Supabase project and invites Members there; Claude never handles its keys.
- Cook mode asks the browser to keep the screen awake and falls back to larger steps only.
- Photos live in `images/` in the vault root, one file per recipe named after its note, stored exactly as downloaded. The note's photo line is a Markdown image pointing to the file. The photo address on the source site is no longer kept.
- The recipes are the notes in the repo root tagged `recipe`. The site reads them at build time; nothing is saved by the site.
- Table columns come from each note's properties: Site = `site`, Recipe = file name, Tags = `tags`.
- Servings scaling follows the same rules as `scripts/scale/view.js`, so the site and Obsidian show the same amounts.
- Default sort is Recipe name, A to Z. Search is case-insensitive.

## Platform and look
- A static website (no server of its own; nothing is saved by the site), built from this repo and hosted on Netlify; the code lives in a `site/` folder in this repo.
- Works on desktop and phone screens (responsive).
- Cream (#F7F6EE) and sage green (#3F6B4F), Fraunces headings and Inter body, from the Owner's design file, with a dark version following the device setting (changed 2026-11-14; replaces the fresh-green look).
- Public to anyone with the link; asks search engines not to index.
- Never deployed or pushed by Claude; the Owner releases.

## Sources
- CLAUDE.md (Recipes): note format, servings dropdown, scaler in `scripts/scale/view.js`.
- `.claude/skills/recipe-extract/SKILL.md`: note template and property names.
- CLAUDE.md and `.claude/skills/recipe-extract/SKILL.md`: today's rule is a hot-linked photo URL in each note; 21 of 24 notes have one.
- `Recipes.base`: current default sort and columns in Obsidian.
- Git remote `origin`: https://github.com/pbrosnan226/Recipes.git (public, per the Owner).

## Answered questions
| # | Question | Answer |
|---|---|---|
| 1 | Where used? | Phone and Mac; later: "im going to host this on netlify" |
| 2 | Data source? | Read the vault notes, pulled from GitHub (public repo) |
| 3 | Columns? | Site, Recipe name, Tags |
| 4 | Clicking a recipe? | Show the recipe on the site |
| 5 | Recipe page? | "it should behave the same as obsidian...just look nicer" |
| 6 | Freshness? | After push to GitHub, on next page load |
| 7 | Table default? | Sort by name; search matches name, site and tags |
| 8 | Mobile? | Works on mobile; hosting handled by the Owner |
| 9 | Servings memory? | Resets each visit |
| 10 | Access? | Anyone with the link |
| 11 | Page content? | Photo and description, times and servings dropdown, notes and nutrition, source link |
| 12 | Tag click? | Filters the list to that tag |
| 13 | Look? | Clean and warm, light and dark mode |
| 14 | Bad note at build? | Skip that note and build the rest |
| 15 | Code location? | `site/` folder in this repo |
| 16 | Empty states? | "No recipes match"; blank cell shows a dash |
| 17 | Mockup colors? | "i like the layout but hate the color scheme"; chose Fresh green |
| 18 | When should the build skip a note as unreadable? | "Missing a required field, broken properties, or a malformed ingredient/step block (Recommended)"; the build log names the note and why |
| 19 | Which notes count as recipes, and should the 'recipe' tag be shown? | "Root-level notes tagged recipe; show every tag, including recipe (Recommended)" |
| 20 | What does the recipe page do when a part is missing (description, times, site, tags)? | "Omit missing parts; source link shows the URL if no site (Recommended)"; includes each empty time box, and the whole times row if all three are empty |
| 21 | Keep "(the source makes 4)" next to the servings dropdown? | "Keep it (Recommended)" |
| 22 | How should the list sort? | "Yes, as in the mockup (Recommended)": Tags sorts by tags joined in order; rows with no value go last in both directions; first click on a header is A to Z, second Z to A; case-insensitive like search |
| 23 | How should ingredients appear? | "Like Obsidian: a table with sub-headings (Recommended)": columns Ingredient, As written, For N servings (or batches); group sub-headings; hidden ingredients left out |
| 24 | How exact should scaling be? | "Match the scaler exactly (Recommended)": scripts/scale/view.js output |
| 25 | Indexing? | "noindex on every page plus robots.txt disallow (Recommended)" |
| 26 | If the build finds no readable recipes? | "Fail; the old site stays live (Recommended)" |
| 27 | How should W-03 be split into stories? | "Separate stories: read/skip notes, produce pages, fail safely, Netlify build setup (Recommended)" |
| 28 | Which photos to store? | Download the source photos into the repo |
| 29 | Where? | An images/ folder in the vault root |
| 30 | Download the existing 21 (public repo and site)? | Yes, download them |
| 31 | Photo can't be downloaded? | Recipe goes without a photo and the Owner is told in chat |
| 32 | How does a note point to the image? | Standard Markdown image to the file |
| 33 | Resize or convert? | Store as downloaded |
| 34 | New recipes from a link? | Download into images/ and link the file |
| 35 | Image file missing at build? | Build the recipe without a photo and log a NOTE |
| 36 | Mockups for the photo change? | Not a major change; recipe page mockup unchanged (it already shows a photo) |
| 37 | File extension of a stored photo? | The type actually downloaded (Recommended) |
| 38 | Note image line with spaces in the name? | ![dish](images/French%20Toast.jpg) (Recommended) |
| 39 | Note whose photo line is still an http(s) address, at build? | Build without a photo and log a NOTE (Recommended) |
| 40 | Redesign scope | "Everything in it" (the Owner's design file), then shopping list deferred |
| 41 | Favorites storage | Shared across devices; Supabase |
| 42 | Who can change favorites | "anyone whos signed in"; accounts only for people the Owner invites; each person has their own list; email link sign-in |
| 43 | Courses | "lets create new attribute system or use the existing tag system..whatver makes sense with the current erd...": a COURSE table, one per recipe; Claude proposes values for the 24 notes and the Owner confirms |
| 44 | Shopping list / Send to Reminders | "lets sort that out later...add it to the to do list of this project, create that if it doesnt exist": see todo.md |
| 45 | Cook mode | Larger steps and keep the screen awake |
| 46 | Home page | Cards replace the table; keep a sort control and tag search |
| 47 | Ingredient checkboxes | Reset on reload |
| 48 | Dark mode | Keep it, in the new colors |
| 49 | Favorite and Favorites when signed out | "Hide them until signed in" |
| 50 | Empty favorites wording | "No favorites yet." |
| 51 | Ingredients layout | Checkbox list with sub-heading rows (the design file's); replaces answer 23's tables with an 'As written' column |
| 52 | Favorites view | Keep course chips, sort and search; title "Your favorites." |
| 53 | Sign in screen / favorites errors | "i dont want a login yet"; "hide favorites for now...add this and login to the todo" |
| 54 | Ingredient search | "dont do this yet" (deferred) |
| 55 | Signed-out Favorites address, empty favorites | Normal Home page; "No favorites yet." (applies when favorites return) |
| 56 | Bad course value | Build with no course and log a NOTE |
| 57 | Sort by Site | Recipes with no site last; same site by name A to Z; A to Z only; ignore case |
| 58 | Source link and Back link | Mockup's 'Original recipe at <site>, by <author>' (URL if no site, no 'by' if no author); only the top 'Back to all recipes' link |
| 59 | Fonts | Fraunces and Inter files stored in the repo |
| 60 | Missing Supabase settings at build | Build without sign-in and favorites and log a NOTE (applies when accounts return) |
| 61 | Course mapping from a source's category | Exact course word only, ignoring case; anything else goes to the Owner |
| 62 | Ticked ingredients when servings change | Stay ticked |
| 63 | Supabase setup | Claude writes a SQL script and guide; the Owner runs it (applies when accounts return) |
