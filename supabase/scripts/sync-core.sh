#!/usr/bin/env bash
# Copies packages/core/src (minus tests) into functions/_shared/core and adds .ts extensions for Deno.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/packages/core/src"
DST="$ROOT/supabase/functions/_shared/core"
rm -rf "$DST"; mkdir -p "$DST/seed"
for f in "$SRC"/*.ts "$SRC"/seed/*.ts; do
  [ -e "$f" ] || continue
  case "$f" in *.test.ts) continue;; esac
  rel="${f#$SRC/}"
  sed -E 's#(from "\.{1,2}/[^"]+)"#\1.ts"#g; s#\.ts\.ts"#.ts"#g' "$f" > "$DST/$rel"
done
# directory imports ("./seed") became "./seed.ts"; point them at index.ts
for d in "$DST"/*/; do
  n="$(basename "$d")"
  sed -i '' -E "s#\./$n\.ts\"#./$n/index.ts\"#g" "$DST"/*.ts
done
echo "synced -> $DST"
