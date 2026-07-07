#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <database.sql.gz>" >&2
  exit 1
fi

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:=5432}"
: "${PGUSER:?PGUSER is required}"
: "${PGDATABASE:?PGDATABASE is required}"

dump_file=$1
work_dir=$(mktemp -d)
session_dump="$work_dir/sessions.sql"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

if [[ ! -f "$dump_file" ]]; then
  echo "Database dump not found: $dump_file" >&2
  exit 1
fi

# Keep active production sessions outside the schema that will be replaced.
pg_dump \
  --data-only \
  --no-owner \
  --no-privileges \
  --table=public.sessions \
  --file="$session_dump" \
  "$PGDATABASE"

psql --set=ON_ERROR_STOP=1 "$PGDATABASE" \
  --command='DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

gzip --decompress --stdout "$dump_file" | \
  psql --set=ON_ERROR_STOP=1 "$PGDATABASE"

# Load the preserved rows into a staging table, then merge only valid sessions.
sed 's/COPY public.sessions (/COPY public.sessions_before_restore (/' \
  "$session_dump" > "$work_dir/sessions-merge.sql"

psql --set=ON_ERROR_STOP=1 "$PGDATABASE" \
  --command='CREATE TABLE sessions_before_restore (LIKE sessions INCLUDING DEFAULTS);'
psql --set=ON_ERROR_STOP=1 "$PGDATABASE" \
  --file="$work_dir/sessions-merge.sql"
psql --set=ON_ERROR_STOP=1 "$PGDATABASE" <<'SQL'
INSERT INTO sessions
SELECT session.*
FROM sessions_before_restore AS session
WHERE EXISTS (
  SELECT 1 FROM users WHERE users.id = session."userId"
)
ON CONFLICT DO NOTHING;

DROP TABLE sessions_before_restore;
SQL

echo "Database restored and existing sessions preserved."
