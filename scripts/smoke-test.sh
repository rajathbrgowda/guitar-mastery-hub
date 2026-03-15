#!/usr/bin/env bash
# smoke-test.sh — quick API health check for local or production
#
# Usage:
#   ./scripts/smoke-test.sh                         # local (localhost:4000)
#   BASE_URL=https://your-app.onrender.com ./scripts/smoke-test.sh
#   TOKEN=<jwt> BASE_URL=https://... ./scripts/smoke-test.sh

BASE_URL="${BASE_URL:-http://localhost:4000}"
TOKEN="${TOKEN:-}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅  $label"
    PASS=$((PASS + 1))
  else
    echo "  ❌  $label  (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "🎸 Guitar Mastery Hub — Smoke Test"
echo "   Base URL: $BASE_URL"
echo ""

# ── Public endpoints ──────────────────────────────────────────────────────────
echo "Public endpoints:"
check "GET /api/health → 200" \
  "200" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")"

check "GET /api/health/db → 200" \
  "200" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health/db")"

# ── Auth guard ────────────────────────────────────────────────────────────────
echo ""
echo "Auth guard (no token → 401):"
for path in "/api/practice" "/api/progress" "/api/analytics/summary" "/api/resources" "/api/users/me"; do
  check "GET $path → 401" \
    "401" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")"
done

# ── Authenticated endpoints (only if TOKEN is set) ────────────────────────────
if [ -n "$TOKEN" ]; then
  echo ""
  echo "Authenticated endpoints:"
  H="Authorization: Bearer $TOKEN"

  check "GET /api/users/me → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/users/me")"

  check "GET /api/practice → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/practice")"

  check "GET /api/progress → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/progress")"

  check "GET /api/analytics/summary → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/analytics/summary")"

  check "GET /api/analytics/streak → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/analytics/streak")"

  check "GET /api/analytics/history → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/analytics/history?days=7")"

  check "GET /api/resources → 200" \
    "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "$H" "$BASE_URL/api/resources")"
else
  echo ""
  echo "ℹ️  Skipping auth tests — set TOKEN=<jwt> to run them"
  echo "   Get a JWT from browser devtools: Application → Local Storage → supabase.auth.token"
fi

# ── Result ────────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────"
echo "  Passed: $PASS   Failed: $FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo "  ✅ All checks passed"
else
  echo "  ❌ $FAIL check(s) failed"
  exit 1
fi
echo ""
