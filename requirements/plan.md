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

## Change 2026-11-13: database-backed recipes
The Owner wants recipes in a database instead of notes read at build time: "Add recipes without Obsidian/GitHub", "Instant updates, no rebuild", and "Search by ingredient and richer queries". Answers 64 to 76 below. Decisions:
- **Source of truth:** Supabase. The existing notes are imported once; the site stops reading them. The notes, `images/`, `scripts/scale/view.js` and the old build code stay in the repo untouched (answer 66), with a written guide to what removing them would do and what depends on them (a story, new).
- **Database:** the existing "Gambling App" Supabase project (id `wbeaswhbzkqmxcsweisu`), in its own schema `recipes`, so nothing touches that app's tables. Claude applies the changes through the Supabase connector after showing the Owner the SQL; the Owner approves each one.
- **Site reads live:** the pages fetch recipes from Supabase in the browser with the public read-only key; a new recipe shows without a push or rebuild. JavaScript is required. Anyone can read; nobody can write with the public key.
- **Recipe page address:** one page, `/recipe?name=<recipe name as slug>`. Old `/recipes/<slug>.html` addresses are redirected to it by a Netlify rule.
- **Writing:** only the Owner, through Claude. The `recipe-extract` skill saves a new recipe to the database instead of writing a note, and uploads the photo to Supabase Storage with a service key the Owner keeps in an environment variable (Claude never reads or prints the key). Editing and deleting a recipe are done by the Owner in the Supabase dashboard (out of scope here).
- **Photos:** in a Supabase Storage bucket; the existing 19 stored photos are uploaded during the import.
- **Servings scaling:** rewritten as site code that reads the ingredient rows and reproduces what `scripts/scale/view.js` produces today. The import check compares every recipe at every servings option.
- **Search:** the one search box also matches ingredient names (the item deferred in todo.md is now in scope).
- **No accounts (superseded 2026-11-14):** the Owner still does not sign in to change recipes; accounts for favorites, marks and ratings are in the 2026-11-14 sign-in change.

## Change 2026-11-13: Want to try and ratings
The Owner: "mark recipes as things i want to try and rate ones i have...if its been rated, its no longer in want to try". Answers 80 to 84 below. Decisions:
- **Who:** any signed-in user; reading the site stays open to everyone, and anything unique to a person needs sign-in. Sign-in itself is not planned here: the Owner will work through it separately (see [todo.md](todo.md)). Sign-in is planned in the 2026-11-14 change (W-06, W-14), so this is no longer blocked on it.
- **Personal:** each person has their own Want to try list and their own ratings.
- **Rating:** 1 to 5 stars in half-star steps (0.5 to 5).
- **States per person per recipe:** unmarked, Want to try, rated. Rating a recipe (marked or not) clears its Want to try mark. Removing a rating leaves the recipe unmarked.
- **Average:** the average of everyone's ratings, shown to one decimal with the count, e.g. 4.5 (3); a recipe nobody has rated shows "No ratings yet" and sorts last.
- **Signed out:** sees the average only. **Signed in:** sees their own rating and the average.
- **New workflows:** W-12 (mark Want to try) and W-13 (rate a recipe). **Changed:** W-01 (second chip row All / Want to try / Rated, shown only when signed in and combining with course, sort and search; Rating sort; card badges) and W-02 (controls and average on the recipe page).
- **Data:** new WANT_TO_TRY and RATING tables, one row per person and recipe; the database does not let a person hold both for the same recipe. To be drawn with the `erd` skill.

## Change 2026-11-14: sign-in, accounts and favorites
The Owner: "okay lets work on the login section", then "copy the login stuff from workout app". Answers 93 to 101 below. This replaces the deferred, invite-only email-link plan (answers 41, 42, 53, 60 and 63 stay as history). Decisions:
- **Copy the Workout app's sign-in:** email and password, open Create account, Sign in, Forgot password, Reset password and Sign out, with Workout's screens, fields, rules and wording (`/Users/pat/Claude Projects/Workout/requirements`, stories S-01 and S-05 to S-08, `ux-copy.md`). Recipes-only differences are listed below.
- **Open sign-up:** anyone with the site's address can create an account. No invite list, no confirmation email.
- **Shared accounts:** Recipes lives in the Gambling App Supabase project, whose accounts Workout and the Gambling App already share. One account works in all three apps, and an account made here works in the other two.
- **Landing:** after creating an account or signing in, the person always lands on Home. There are no setup screens.
- **Staying signed in:** a person stays signed in on a device until they select Sign out.
- **Header:** signed out shows Sign in; signed in shows Favorites and Sign out (no email or name). Sign out stays on the same page in its signed-out view; on the Favorites view it falls back to the normal Home page (answer 55).
- **Now in scope, no longer blocked:** Favorites (W-07), Want to try (W-12) and Ratings (W-13), with the personal parts of W-01 and W-02. Favorite is its own button next to Want to try, and Favorites is its own header link and view; the second chip row (All / Want to try / Rated) stays separate.
- **Data:** accounts are Supabase's own (AUTH_USER in the ERD). A new FAVORITE table is added to the ERD with the `erd` skill; WANT_TO_TRY and RATING are already drawn.
- **Supabase settings:** the build still fails when the project address or public key is missing (answer 60 was about the old plan; the fail rule from answer 79 wins).

## Out of scope
- Adding, editing or deleting recipes on the site, and editing or deleting recipes through Claude or a workflow here (the Owner uses the Supabase dashboard).
- Deleting the notes, `images/` or the old build code (kept; only a guide to removing them is written).
- A static or no-JavaScript fallback for browsing.
- Invite-only accounts, sign-in by email link, a confirmation email when creating an account, and any page on the site for managing accounts (changed 2026-11-14).
- Changing the email or deleting an account, and signing in with Google, Apple or other services.
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
| Owner | The person who keeps the vault and uses the site (on Mac and phone) | Add or edit recipes in Obsidian and push to GitHub; browse and use the site as a Visitor or Member |
| Build | Netlify's build, run when the repo changes on GitHub | Publish the site's pages and scripts. After the migration it no longer reads recipes |
| Visitor | Anyone who opens the site | Browse, search, filter, sort and open recipes, use Cook mode, change servings |
| Member | A Visitor who has created an account (the same account works in Workout and the Gambling App) and is signed in | Everything a Visitor can, plus create an account, sign in and out, reset a forgotten password, favorite recipes, mark Want to try, rate recipes, and see their own favorites, marks and ratings |
| Supabase Auth | The accounts part of the Gambling App Supabase project | Create accounts, check email and password, keep a device signed in, send password reset emails, store each Member's favorites, marks and ratings |
| Extractor | The `recipe-extract` skill, run by Claude when the Owner asks to add a recipe or convert existing ones | After the migration: save a new recipe to Supabase, upload its source photo to Storage, tell the Owner when a photo can't be downloaded. Before it: wrote notes and `images/` files |
| Supabase | The hosted database and file storage (the `recipes` schema and a photo bucket in the Gambling App project) | Hold the recipes and photos; answer read requests from the site with the public read-only key |

## Workflows
Diagrams: [workflows/index.html](workflows/index.html)

### W-01 Browse the recipe list
- **Actors:** Visitor
- **Starts when:** The Visitor opens the site's address.
- **Steps:**
  1. Visitor opens the site; the page loads the recipes from Supabase, then the cards show all recipes sorted by name, A to Z, with the course chip All selected. If the recipes can't be loaded, go to step 7.
  2. Visitor may select a course chip; only recipes of that course show.
  3. Visitor may change the sort control (name or site); the cards reorder.
  4. Visitor may type in the search box; only recipes whose name, site, tags or ingredient names contain the text show.
  5. Visitor may select a tag on a card; the search box fills with that tag and the cards filter to it.
  6. If nothing matches, the page shows "Nothing matches that. Try another word." Otherwise Visitor selects a card and goes to W-02.
  7. If the recipes can't be loaded (Supabase down, no network), the page shows "Couldn't load recipes." with a Try again button. Try again loads them again and goes to step 1.
- **Ends when:** The Visitor opens a recipe or leaves the site.
- **Added 2026-11-13 (needs a signed-in Member; sign-in planned 2026-11-14):** The sort control also offers Rating: for a Visitor it sorts by the average rating, for a signed-in Member by their own rating; unrated recipes go last. A signed-in Member also sees a second chip row All / Want to try / Rated (their own marks) that combines with the course chips, sort and search; signed-out Visitors don't see it. Each card shows the average rating (or "No ratings yet"); for a Member it also shows their own rating if they rated the recipe, otherwise a "Want to try" badge if they marked it. Empty wording for the two filters is still to be set.
- **Errors and edge cases:** A recipe with no photo shows a plain tinted box; a recipe with no course shows only under All. Clearing the search or choosing All restores the full list. Chips, sort and search combine. Without JavaScript the page shows only "Turn on JavaScript to see recipes." A recipe added in Supabase shows on the next page load, with no rebuild.

### W-02 View a recipe
- **Actors:** Visitor
- **Starts when:** The Visitor selects a card on the home page.
- **Steps:**
  1. The page loads the recipe named in the address from Supabase and shows the course, name, description, times, servings dropdown, source link, photo, ingredients (a checkbox list of scaled amount and name, with sub-heading rows for groups), method, the author's notes and the nutrition (when the recipe has them).
  2. Visitor may change the servings dropdown; the amounts in the ingredients and in the steps rescale (computed in the browser from the ingredient rows, with the same results the notes' scaler gave).
  3. Visitor may tick an ingredient's checkbox; it is struck through. Ticks are not remembered.
  4. Visitor may use Cook mode (W-08). A signed-in Member may select Favorite or Favorited (W-07).
  5. Visitor may select a tag; goes to the home list filtered to that tag.
  6. Visitor may open the nutrition section, select the source link (opens the original recipe page) or select Back to all recipes.
- **Added 2026-11-13 (needs a signed-in Member; sign-in planned 2026-11-14):** The page shows the average rating with its count (or "No ratings yet"). A signed-in Member also sees the Want to try button (W-12), the half-star row and Remove rating (W-13).
- **Ends when:** The Visitor goes back to the list or the source.
- **Errors and edge cases:** If the recipe can't be loaded, the page shows "Couldn't load recipes." with a Try again button. If no recipe has that name (deleted or never existed), it shows "That recipe isn't here." with a Back to all recipes link. The dropdown starts at the source's servings every visit. A recipe with no photo, notes, description, times or nutrition simply omits those parts. A recipe whose photo file is missing shows without a photo. Recipes that scale by batches show the batch dropdown the note defines.

### W-03 Publish the site (CHANGED 2026-11-13: recipes no longer go through the build)
- **Actors:** Owner, Build
- **Starts when:** The Owner pushes site code changes to GitHub.
- **Steps:**
  1. Owner pushes the repo to GitHub.
  2. Build starts automatically on the push.
  3. Build publishes the page shell, styles, scripts, fonts and the Supabase settings (project address and public read-only key), and the redirect rule for old recipe addresses. It does not read any recipe.
  4. If the Supabase settings are missing, the build fails and the previous site stays live.
- **Ends when:** The new site is live.
- **Errors and edge cases:** If the whole build fails, the previous site stays live. Recipes added to Supabase need no push and no build.

### W-04 Add a recipe to the database (CHANGED 2026-11-13: was Save a recipe's photo)
- **Actors:** Owner, Extractor, Supabase
- **Starts when:** The Owner asks Claude to add a recipe from a link.
- **Steps:**
  1. Owner shares the recipe link.
  2. Extractor reads the recipe page: the recipe's data and its photo address.
  3. Extractor checks the recipe: source, created date, what the source makes, a valid course, every ingredient with a quantity or fixed text, every `{key}` in a step an ingredient. If anything fails, go to step 8.
  4. Extractor saves the recipe, its tags, servings options, ingredients, steps, notes and nutrients to the `recipes` schema in Supabase.
  5. Extractor downloads the photo. If the download fails (blocked, dead link), go to step 7.
  6. Extractor uploads the file exactly as downloaded to the Storage bucket and sets the recipe's photo path. Go to step 9.
  7. The recipe stays saved without a photo, and Extractor tells the Owner in chat which photo couldn't be downloaded and why. Go to step 9.
  8. Extractor saves nothing and tells the Owner in chat what failed the check.
  9. Owner opens the site; the recipe is there with no push and no rebuild.
- **Ends when:** The recipe (and its photo, if any) is saved, or nothing is saved and the Owner has been told why.
- **Errors and edge cases:** If a recipe has the same name as an existing one, or a different name with the same slug, Extractor asks the Owner; on OK it replaces the whole recipe (all-or-nothing) and overwrites its photo file, otherwise it saves nothing. A recipe whose source gives no photo has no photo. If the database save fails part way, nothing of that recipe is left behind (one all-or-nothing save). If the photo upload fails after the recipe is saved, the Owner is told and the recipe shows without a photo. Nothing is converted or resized.

### W-05 Convert existing photo links to stored files (one time; done 2026-11-14, history)
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

### W-06 Sign in, sign out and reset a password (changed 2026-11-14; copies Workout's W-02)
- **Actors:** Visitor, Member, Supabase Auth
- **Starts when:** A Visitor selects Sign in in the site header, or a Member selects Sign out.
- **Steps:**
  1. Visitor selects Sign in in the header; the Sign in page shows Email and Password, Sign in, Forgot password? and Create account.
  2. Visitor enters their email and password and selects Sign in. If either is empty, or the email or password is wrong, the page says "Wrong email or password." and keeps both fields. If there is no network connection it says "No connection."; any other failure says "Couldn't sign in. Try again."
  3. If correct, Supabase Auth signs them in and the site shows Home with the header showing Favorites and Sign out (and the personal parts of W-01, W-02, W-07, W-12, W-13).
  4. Member may select Sign out in the header at any time; they are signed out at once, with no confirm, and the page they were on shows its signed-out view (the Favorites view falls back to the normal Home page).
  5. Visitor selects Forgot password? on Sign in; the Forgot password page shows Email, Send reset link and Back to sign in.
  6. Visitor enters their email and selects Send reset link; the page says "If it has an account, a link is on its way." whether or not the email has an account, and Supabase Auth emails a reset link only if it does.
  7. Visitor opens the link in the email; the Reset password page shows New password (helper "8+ characters"), Confirm password, Set password and Back to sign in.
  8. Visitor enters the same new password of 8 or more characters in both fields and selects Set password; the password changes and Sign in shows "Password changed. Sign in with it."
- **Ends when:** The Member is signed in or signed out, or the password is changed.
- **Errors and edge cases:** Forgot password: an empty or invalid email shows "Enter a valid email." under Email and sends nothing; "No connection." when offline; any other failure shows "Couldn't send reset link. Try again."; when the hourly limit on emails is reached, "Too many emails. Try again in an hour." Reset password: under 8 characters shows "Use 8+ characters." under New password; a mismatch shows "Passwords don't match." under Confirm password; reusing the current password shows "Use a new password."; any other failure shows "Couldn't set password. Try again."; offline shows "No connection." above Set password; opening Reset password without a valid reset link shows "That link is not a password reset link." with Back to sign in. "Password changed. Sign in with it." stays until the Member signs in or leaves Sign in. Closing the site and reopening keeps a Member signed in on that device until they select Sign out. A Member sees and changes only their own favorites, marks and ratings.

### W-14 Create an account (new 2026-11-14; copies Workout's W-01 steps 1 to 3)
- **Actors:** Visitor, Supabase Auth
- **Starts when:** A Visitor selects Create account on the Sign in page.
- **Steps:**
  1. Visitor selects Create account; the Create account page shows Email, Password (helper "8+ characters"), Confirm password, Create account and "Have an account? Sign in".
  2. Visitor enters an email that has no account, a password of 8 or more characters and the same password in Confirm password, and selects Create account.
  3. Supabase Auth creates the account without sending a confirmation email, signs them in, and the site shows Home with the header showing Favorites and Sign out.
- **Ends when:** The account exists and Home is showing, or the Visitor is still on Create account with the reason shown.
- **Errors and edge cases:** Email already has an account: "Email already has an account. Sign in" under Email, with Sign in going to the Sign in page. Email empty or not valid: "Enter a valid email." under Email. Password under 8 characters: "Use 8+ characters." under Password in place of the helper. Passwords differ: "Passwords don't match." under Confirm password. Offline: "No connection." above Create account, fields kept. Any other failure: "Couldn't create account. Try again." above Create account, fields kept. "Have an account? Sign in" goes to the Sign in page. The account also works in Workout and the Gambling App.

### W-07 Favorite a recipe (back in scope 2026-11-14)
- **Actors:** Member, Supabase Auth
- **Starts when:** A Member opens a recipe page, or selects Favorites in the header.
- **Steps:**
  1. Member selects Favorite on a recipe page; the recipe is saved to their favorites and the button shows Favorited.
  2. Member selects Favorited again to remove it.
  3. Member selects Favorites in the header; the home page titled "Your favorites." shows only their favorites, with the same course chips, sort and search.
- **Ends when:** The favorite is saved or removed, or the Member sees their favorites.
- **Errors and edge cases:** Each Member sees only their own favorites. Signed-out Visitors see no Favorite button and no Favorites link, and a Favorites address shows the normal Home page (answer 55). If saving fails, the button returns to its old state and says "Couldn't save. Try again." (same wording as answer 90). With no favorites, the Favorites view says "No favorites yet." A favorited recipe that no longer exists on the site is not shown. When a course chip or search leaves nothing in the Favorites view it says "Nothing matches that. Try another word."; "No favorites yet." is only for a Member with no favorites at all. Favorites that can't be loaded is left out for now (as answer 91).

### W-08 Use Cook mode
- **Actors:** Visitor
- **Starts when:** The Visitor selects Cook mode on a recipe page.
- **Steps:**
  1. Visitor selects Cook mode; the steps get larger and the button reads Leave cook mode.
  2. The site asks the browser to keep the screen awake. If the browser can't, only the larger steps apply.
  3. Visitor selects Leave cook mode, or leaves the page; steps return to normal size and the screen may sleep again.
- **Ends when:** Cook mode is off.
- **Errors and edge cases:** If the browser releases the screen lock (for example the tab is hidden), it is requested again when the Visitor returns while Cook mode is on.

### W-09 Assign courses to recipes (one time; done 2026-11-14, history)
- **Actors:** Owner, Extractor
- **Starts when:** The Owner asks Claude to add courses to the existing notes.
- **Steps:**
  1. Extractor proposes one course for each of the 24 notes from the list (Breakfast, Main, Side, Soup, Dessert, Sauce).
  2. Owner confirms or changes each course.
  3. Extractor writes a `course` property in each note.
- **Ends when:** Every note has a confirmed course.
- **Errors and edge cases:** New recipes get a course when they are added; the course comes from the source's own category when it matches the list, otherwise the Owner is asked.

### W-10 Set up the recipes schema in Supabase (one time)
- **Actors:** Owner, Claude, Supabase
- **Starts when:** The Owner asks Claude to set up the database.
- **Steps:**
  1. Claude lists the Supabase projects and confirms the Gambling App project with the Owner.
  2. Claude shows the Owner the SQL for the `recipes` schema: the tables from the ERD, the six COURSE rows, read-only access for everyone using the public key, and a public-read Storage bucket for photos.
  3. Owner approves. If the Owner doesn't, Claude changes the SQL and shows it again.
  4. Claude applies the SQL with the Supabase connector and checks the tables and the access rules exist.
  5. Claude gives the Owner the project address and public read-only key to add to the Netlify settings, and the steps to put the service key in an environment variable on the Owner's Mac.
- **Ends when:** The schema, access rules and bucket exist and the Owner has the settings.
- **Errors and edge cases:** Nothing outside the `recipes` schema and the photo bucket is created, changed or read. The public key can read recipes and photos only; it cannot write. If the connector call fails, Claude stops and reports the error. Claude never reads or prints the service key.

### W-11 Import the existing notes (one time)
- **Actors:** Owner, Claude, Supabase
- **Starts when:** The schema from W-10 exists and the Owner asks Claude to import the notes.
- **Steps:**
  1. Claude reads every recipe note with the existing note reader (the one the old build uses) and lists the recipes it will import, the names already in the database, and any note it can't read.
  2. Owner confirms the import, including replacing the listed names that already exist. Notes that can't be read are not imported and are reported.
  3. Claude saves each recipe and its parts to Supabase (all-or-nothing per recipe) and uploads each recipe's stored photo from `images/` to Storage. If a save or upload fails, Claude reports it, leaves nothing part-saved, and carries on with the next recipe.
  4. Claude compares every imported recipe with the current built site: name, source link, site, author, description, times, course, tags in order, serving options with their labels, ingredients and steps at every servings option, notes (with nesting), nutrition and photo. A recipe that failed to import counts as a difference.
  5. If anything differs, Claude lists the differences and fixes the import, then compares again. Otherwise Claude reports the import is identical.
  6. Claude writes the guide to retiring the notes, at `requirements/retiring-the-notes.md` (what removing the notes, `images/`, `scripts/scale/view.js` and the build code would change, and what depends on each).
- **Ends when:** Every readable note is in the database, the comparison shows no differences, and the guide is written.
- **Errors and edge cases:** Running the import again replaces only the names the Owner confirms, and creates no duplicates. A photo that is missing in `images/` leaves that recipe without a photo and is reported. The notes and images are not changed or deleted.

### W-12 Mark a recipe "want to try" (new 2026-11-13; needs a signed-in Member, sign-in planned 2026-11-14)
- **Actors:** Member
- **Starts when:** A signed-in Member opens a recipe page.
- **Steps:**
  1. Member selects Want to try; the recipe is saved to their Want to try list and the button reads "On your list".
  2. Member selects "On your list" again; the recipe is removed from the list and the button returns to Want to try.
  3. Member selects Want to try in the Home second chip row to see their list (W-01).
- **Ends when:** The mark is saved or removed.
- **Errors and edge cases:** Signed-out Visitors see no Want to try button. If saving fails, the button returns to its old state and says so. A recipe the Member has rated shows no Want to try button (rating cleared it); removing the rating brings the button back.

### W-13 Rate a recipe (new 2026-11-13; needs a signed-in Member, sign-in planned 2026-11-14)
- **Actors:** Member
- **Starts when:** A signed-in Member opens a recipe page.
- **Steps:**
  1. Member taps a star in the half-star row (left half of a star gives a half, right half a whole); the rating is saved, any Want to try mark on that recipe is cleared, and the row shows their rating.
  2. Member may tap another star to change the rating.
  3. Member may select Remove rating; the rating is deleted and the recipe is unmarked.
  4. The average and its count update.
- **Ends when:** The rating is saved or removed.
- **Errors and edge cases:** Signed-out Visitors see the average only and no star row to tap. Any recipe can be rated, marked or not. If saving fails, the row returns to its old state and says so.

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
- **Actions:** servings → rescales ingredients and steps; checkbox → strikes the ingredient (not remembered); Cook mode → W-08; Favorite / Favorited (signed-in Members only, next to Cook mode) → W-07; tag → Home filtered; source link; Back. (Favorite button added 2026-11-14; not mocked up.)
- **Example data:** French Toast (servings 4; 2/4/6/8/12), Serious Eats.

### Want to try and ratings (2026-11-13; not mocked up, not a major change)
The Owner chose to leave the mockups as they are. Home gains a second chip row (All / Want to try / Rated), a Rating sort and card rating/badge; Recipe gains the average, a Want to try button, a half-star row and Remove rating. All shown only as described in W-01, W-02, W-12 and W-13; the Owner's answer 85 below.

### States added by the database change (2026-11-13; not mocked up, not a major change)
- **Loading failure (Home and Recipe):** the page area shows "Couldn't load recipes." with a Try again button.
- **No recipe with that name (Recipe):** "That recipe isn't here." with a Back to all recipes link.
- **JavaScript off (every page):** only "Turn on JavaScript to see recipes."
- **Search (Home):** the box also matches ingredient names; the look is unchanged.
- The mockups stay as approved; the Owner chose not to redraw them for these states.

### Recipe on phone
- **Used in:** W-02
- **Shows:** The same content in one column at phone width (about 390px).

### Sign in, Create account, Forgot password, Reset password (new 2026-11-14; copied from Workout)
- **Used in:** W-06 steps 1 to 8, W-14 steps 1 to 3
- **Sign in shows:** title "Recipes" (as Workout shows its name), Email, Password, a Sign in button, Forgot password? and Create account; the message "Wrong email or password.", "No connection." or "Couldn't sign in. Try again." above Sign in, and "Password changed. Sign in with it." in a notice after a reset.
- **Create account shows:** Email, Password (helper "8+ characters"), Confirm password, Create account and "Have an account? Sign in"; errors under their field as in W-14.
- **Forgot password shows:** Email, Send reset link and Back to sign in; "If it has an account, a link is on its way." after sending.
- **Reset password shows:** New password (helper "8+ characters"), Confirm password, Set password and Back to sign in.
- **Header:** signed out: Sign in; signed in: Favorites and Sign out.
- **Example data:** sam@example.com, a password of 8 or more characters.
- **Mockups:** none; the Owner chose to skip mockups for these screens (answer 102). Workout's screens and wording are the reference, drawn in the Recipes look (cream and sage) when built.

## Data model
See [erd.md](erd.md).

## Data and rules
- Courses: a fixed list (Breakfast, Main, Side, Soup, Dessert, Sauce), one per recipe, in each note's `course` property; a recipe without one shows only under All.
- Accounts (changed 2026-11-14): Supabase Auth in the Gambling App project, email and password, open sign-up, no confirmation email, passwords of 8 or more characters, shared with Workout and the Gambling App. Favorites, Want to try marks and ratings are rows tied to the signed-in account; the public key can read recipes, and a Member can read and change only their own favorites, marks and ratings. A signed-in device stays signed in until Sign out. Only the account's own data is ever shown to its owner; nothing about a person is public except their rating counting toward a recipe's average. Claude never handles Supabase keys.
- Cook mode asks the browser to keep the screen awake and falls back to larger steps only.
- Photos live in `images/` in the vault root, one file per recipe named after its note, stored exactly as downloaded. The note's photo line is a Markdown image pointing to the file. The photo address on the source site is no longer kept.
- The recipes are rows in the `recipes` schema of the Gambling App Supabase project (from 2026-11-13). The site reads them live in the browser with the public read-only key and saves nothing. Before the move they were the notes in the repo root tagged `recipe`, read at build time; those notes stay in the repo as an archive.
- Only the Owner (through Claude, using the Supabase connector and a service key kept in an environment variable) writes recipes and photos. The public key can read only. Claude never reads or prints the service key. The Owner edits or deletes recipes in the Supabase dashboard.
- Validation that the build did for notes (required source, created date and amount; a valid course; well-formed ingredients; every `{key}` in a step an ingredient) now happens when Claude saves a recipe, and the recipe is not saved if it fails. The database also enforces required fields and unique keys from the ERD.
- Photos live in a public-read Supabase Storage bucket, one file per recipe, stored exactly as downloaded; the recipe's photo path points to the file. A recipe with no file shows no photo.
- Search matches recipe name, site, tag and ingredient names, case-insensitive.
- The old note-reading build (`site/build.js`, `lib/read.js`, `lib/scale.js`, `lib/render.js`) stays in the repo and moves to its own command; its tests are left out of the normal test run (answer 79). Netlify runs a new, simpler build. The recipe-extract skill and CLAUDE.md note-only parts (template, servings dropdown, `images/` photo) are replaced by the database save and Storage upload (answer 78). The CLAUDE.md opening paragraph and the Branches sentence about "documenting a recipe note" are reworded too, to say recipes live in the Supabase `recipes` schema with photos in Storage (answer 92).
- While recipes load nothing extra shows. When the database has no recipes Home shows "Nothing matches that. Try another word." An address with no `name` shows "That recipe isn't here." The header stays in every state.
- The Supabase settings rule: if the project address or public key is missing, the build fails (this applies to the sign-in settings too, which are the same two).
- The recipe page address is `/recipe?name=<recipe name as slug>`; old `/recipes/<slug>.html` addresses redirect to it.
- Table columns come from each note's properties: Site = `site`, Recipe = file name, Tags = `tags`.
- Servings scaling follows the same rules as `scripts/scale/view.js`, so the site and Obsidian show the same amounts.
- Default sort is Recipe name, A to Z. Search is case-insensitive.

## Platform and look
- A website with no server of its own, hosted on Netlify (the code lives in a `site/` folder in this repo). The pages are a fixed shell that fetches recipes from Supabase in the browser; nothing is saved by the site. JavaScript is required (without it the page says "Turn on JavaScript to see recipes.").
- Works on desktop and phone screens (responsive).
- Cream (#F7F6EE) and sage green (#3F6B4F), Fraunces headings and Inter body, from the Owner's design file, with a dark version following the device setting (changed 2026-11-14; replaces the fresh-green look).
- Public to anyone with the link; asks search engines not to index.
- Never deployed or pushed by Claude; the Owner releases.

## Sources
- CLAUDE.md (Recipes): note format, servings dropdown, scaler in `scripts/scale/view.js`.
- `.claude/skills/recipe-extract/SKILL.md`: note template and property names.
- CLAUDE.md and `.claude/skills/recipe-extract/SKILL.md`: today's rule is a hot-linked photo URL in each note; 21 of 24 notes have one.
- `Recipes.base`: current default sort and columns in Obsidian.
- `requirements/erd.md` (2026-11-14): tables are already shaped for a database; `photo_file` becomes `photo_path`, `slug` is added, and the rule "recipes come from the notes" changes.
- `requirements/todo.md`: Search by ingredient (now in scope); Sign-in and favorites (back in scope 2026-11-14).
- The Workout app (`/Users/pat/Claude Projects/Workout`): `requirements/stories/S-01`, `S-05` to `S-08`, `ux-copy.md`, `web/js/views/sign-in.js`, `create-account.js`, `forgot-password.js`, `reset-password.js`: the sign-in screens, rules and wording copied here; its Supabase accounts are shared with the Gambling App.
- Supabase connector (list of projects): the Gambling App project, id `wbeaswhbzkqmxcsweisu`.
- Existing code: `site/lib/read.js` (the note reader and its validation), `site/lib/scale.js` (runs `scripts/scale/view.js`), `site/lib/render.js`, `site/static/*.js`, `netlify.toml`, `site/tests/`.
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
| 64 | Why move to a database? | "Add recipes without Obsidian/GitHub", "Instant updates, no rebuild", "Search by ingredient and richer queries" |
| 65 | Source of truth after the move? | "Database is the source; notes retired (Recommended)": one-time import, then the DB |
| 66 | What happens to the notes and old build code? | "keep it as is, but leave instructions on what removing it would do..and a list of dependencies" |
| 67 | Which database? | Supabase |
| 68 | How does the site read recipes? | "Live: browser queries the DB" |
| 69 | How are recipes added? | Claude's recipe-extract skill writes to the DB |
| 70 | Where do photos live? | Supabase Storage |
| 71 | Servings scaling? | "Rewrite as site code, same results (Recommended)" |
| 72 | Does the Owner sign in to change recipes? | "No sign-in; writes only via Claude/Supabase dashboard" |
| 73 | Recipe page address? | One page, `/recipe?name=french-toast` |
| 74 | Which Supabase project, and who sets it up? | "use the gambling app"; own schema `recipes`; Claude applies the SQL with the Supabase connector after showing it |
| 75 | Ingredient search? | "Same search box also matches ingredient names (Recommended)" |
| 76 | Photo upload, load failure, no JavaScript, missing recipe, edit/delete, import check | Claude uploads with a service key in an environment variable; "Couldn't load recipes." with Try again; JavaScript required with a message; "That recipe isn't here." with Back to all recipes; edit/delete out of scope (Supabase dashboard); compare every recipe at every servings option |
| 77 | Tag order, nested notes, dropdown label, course rows | RECIPE_TAG.position added; RECIPE_NOTE.level (0 or 1) added ("can you store this as rich text or html?" was answered: keep one row per note and add level); RECIPE.servings_label added; the setup SQL seeds the six courses and the chips read from COURSE |
| 78 | Import re-run, failure, comparison, guide; overwrite; skill wording | Replace after the Owner confirms the listed names; continue on failure and report; compare name, source, site, author, notes, serving options too; guide at `requirements/retiring-the-notes.md`; ask before replacing a recipe (same name or slug) and overwrite the photo; replace the note-only parts of the skill and CLAUDE.md with the database save |
| 79 | Old build code and its tests; page states; S-35 | "Keep the files, but stop testing it" (own command, tests out of the normal run); defaults for loading, empty and no-name states, header stays; the fail rule wins over S-35's NOTE rule |
| 80 | Who can mark and rate? | "any logged in user"; "assume reading website is for anyone and anything that is unique to the user requires a login" |
| 81 | Sign-in in scope? | "note this a a to do in the plan...i need to do work thru that part too": planned as blocked on sign-in, see todo.md |
| 82 | Rating scale; states | 1 to 5 stars with half stars; rate any recipe; removing a rating leaves it unmarked (Recommended) |
| 83 | Personal or shared; signed-out view | Personal to each person; "when not signed in show average rating...when signed in show users rating and average" |
| 84 | Average, filters, controls, cards | Everyone's ratings, "No ratings yet" sorts last; second chip row All / Want to try / Rated, hidden when signed out; Want to try button plus half-star row with Remove rating; card shows own rating or Want to try badge, plus average (all Recommended) |
| 85 | Mockups for want to try and ratings? | "Leave them as they are (Recommended)" |
| 86 | Empty text for the Want to try and Rated filters | "Nothing on your Want to try list yet." / "You haven't rated any recipes yet." when the filter alone is empty; "Nothing matches that. Try another word." when course or search empties it |
| 87 | Rating sort | Highest first, ties by recipe name A to Z; recipes with no value (Visitor: no ratings; Member: not rated by them) last, by name |
| 88 | Display of ratings and badge | Cards: "Your rating: 4.5" text and a "Want to try" badge; recipe page: filled, half and empty stars; average "4.5 (3)" or "No ratings yet" on both |
| 89 | Half-star row | Tapping the current rating again does nothing; Remove rating shows only when rated; taps and clicks only (no keyboard control) |
| 90 | Save failure wording | "Couldn't save. Try again." for both Want to try and rating; the control returns to its old state |
| 91 | A Member's own marks fail to load while recipes load | Left out of the plan for now (no criterion) |
| 92 | CLAUDE.md intro and Branches wording (S-53) | Reword both: the opening paragraph ("An Obsidian vault of recipes. One note per recipe...") and the Branches sentence ("not when documenting a recipe note") say recipes now live in the Supabase `recipes` schema with photos in Storage. Widens S-53.13 and S-53.16; no workflow, ERD or mockup changes |
| 93 | Scope of this pass | "Sign-in + all three": sign-in, Favorites, Want to try and Ratings together |
| 94 | How people are added | First "in the Supabase dashboard", then replaced by answer 98: open sign-up |
| 95 | Where the Sign in form lives | Its own Sign in page |
| 96 | Header when signed in; session; Sign out; Favorites vs Want to try | Favorites link and Sign out, no email shown; stays signed in until Sign out; Sign out stays on the same page (Favorites view falls back to Home); Favorite is a separate button and Favorites a separate header link, the chip row stays separate |
| 97 | Wording for not-invited, "Check your email", expired link | Answered for the email-link plan, then dropped when answer 98 replaced it; the send-failure wording: "copy the login stuff from workout app" |
| 98 | Which parts of Workout's login to copy; who can create an account | "Copy it all: email + password"; "Anyone with the site address (open, like Workout)" |
| 99 | Same accounts as Workout and the Gambling App? | "Yes, same accounts everywhere" |
| 100 | Where to land after creating an account or signing in | "Always Home" |
| 101 | Create account, Forgot password and Reset password rules and wording | "Yes, exactly" as Workout (S-01, S-06, S-07), including no confirmation email and the "Too many emails. Try again in an hour." limit |
| 102 | Mockups for Sign in, Create account, Forgot password, Reset password | "skip mock ups" |
| 103 | Workout's three extra reset messages | Added all three: "Couldn't send reset link. Try again.", "Use a new password.", "Couldn't set password. Try again." |
| 104 | Favorites view when a chip or search leaves nothing; favorites fail to load | "Nothing matches that. Try another word."; leave the load failure out |
