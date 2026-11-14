# S-35 Read the Supabase settings from the build settings

**Deferred 2026-11-14, see [todo.md](../todo.md).** Sign-in and favorites are not built now. Do not build this story. The number is reserved. Answer already given for when accounts return: if the settings are missing, the Build builds without sign-in and favorites and logs a NOTE.

**Changed 2026-11-13:** the sentence "Supabase is not used now" no longer holds. The recipes now come from Supabase, and the Build reads the project address and the public read-only key from the build settings (S-63.2) and fails when either is missing (S-64). That replaces the answer above ("builds without sign-in and favorites and logs a NOTE") for those two settings, and the Owner confirmed on 2026-11-13 that the fail rule also applies to the same two settings when sign-in returns. Sign-in itself, the Supabase accounts and favorites stay deferred.
