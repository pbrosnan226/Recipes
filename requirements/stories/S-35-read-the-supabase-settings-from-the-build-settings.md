# S-35 Read the Supabase settings from the build settings

**Changed 2026-11-14:** Sign-in, accounts and favorites are back in scope (S-21, S-24 to S-28, S-77 to S-80). The old answer "if the settings are missing, the Build builds without sign-in and favorites and logs a NOTE" no longer holds: the build fails when the project address or public key is missing, and the same two settings serve sign-in. That rule is S-64. Do not build this story; S-63 and S-64 cover it. The number stays reserved.

**Deferred 2026-11-14 (earlier the same day, superseded by the note above).** Sign-in and favorites were not built then.

**Changed 2026-11-13:** the sentence "Supabase is not used now" no longer holds. The recipes now come from Supabase, and the Build reads the project address and the public read-only key from the build settings (S-63.2) and fails when either is missing (S-64). That replaces the answer above ("builds without sign-in and favorites and logs a NOTE") for those two settings, and the Owner confirmed on 2026-11-13 that the fail rule also applies to the same two settings when sign-in returns. Sign-in itself, the Supabase accounts and favorites stay deferred.
