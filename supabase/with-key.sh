#!/usr/bin/env bash
# Runs a command with SUPABASE_SERVICE_KEY set, fetched from the logged-in Supabase CLI.
# The key goes straight into the command's environment: it is never printed or written anywhere.
# Usage (from the repo root):  supabase/with-key.sh node supabase/save-recipe.js recipe.json
set -euo pipefail
REF="${SUPABASE_PROJECT_REF:-wbeaswhbzkqmxcsweisu}"
KEY="$(supabase projects api-keys --project-ref "$REF" -o json 2>/dev/null \
  | python3 -c 'import sys,json; print(next(k["api_key"] for k in json.load(sys.stdin) if k.get("name")=="service_role"))')" \
  || { echo "Could not get the key from the Supabase CLI. Run: supabase login" >&2; exit 1; }
export SUPABASE_SERVICE_KEY="$KEY"
exec "$@"
