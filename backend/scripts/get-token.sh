#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Get a JWT token from the local backend.

Usage:
  ./backend/scripts/get-token.sh [options]

Options:
  --base-url URL     Base URL (default: http://localhost:8080)
  --email EMAIL      User email (default: dev@assettrack.local)
  --password PASS    User password (default: ChangeMe123)
  --no-register      Do not auto-register if login fails
  --print-header     Print Authorization header instead of raw token
  -h, --help         Show this help

Environment:
  ASSETTRACK_BASE_URL
  ASSETTRACK_EMAIL
  ASSETTRACK_PASSWORD
EOF
}

BASE_URL=${ASSETTRACK_BASE_URL:-http://localhost:8080}
EMAIL=${ASSETTRACK_EMAIL:-dev@assettrack.local}
PASSWORD=${ASSETTRACK_PASSWORD:-ChangeMe123}
REGISTER_ON_FAIL=1
PRINT_HEADER=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --no-register)
      REGISTER_ON_FAIL=0
      shift
      ;;
    --print-header)
      PRINT_HEADER=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done

BASE_URL="${BASE_URL%/}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required but not found." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not found." >&2
  exit 1
fi

payload=$(python3 - "$EMAIL" "$PASSWORD" <<'PY'
import json
import sys
print(json.dumps({"email": sys.argv[1], "password": sys.argv[2]}))
PY
)

request() {
  local endpoint="$1"
  local body="$2"
  local resp_file
  resp_file=$(mktemp)
  local status
  status=$(curl -s -o "$resp_file" -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -X POST "$BASE_URL$endpoint" \
    -d "$body")
  echo "$status" "$resp_file"
}

extract_token() {
  python3 - "$1" <<'PY'
import json
import sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data = json.load(f)
print(data.get("token", ""))
PY
}

print_error() {
  local status="$1"
  local resp_file="$2"
  echo "Request failed (HTTP $status). Response:" >&2
  cat "$resp_file" >&2
}

read -r status resp_file < <(request "/api/auth/login" "$payload")
if [[ "$status" == "200" ]]; then
  token=$(extract_token "$resp_file")
  rm -f "$resp_file"
else
  rm -f "$resp_file"
  if [[ $REGISTER_ON_FAIL -eq 1 ]]; then
    read -r status resp_file < <(request "/api/auth/register" "$payload")
    if [[ "$status" == "201" || "$status" == "200" ]]; then
      token=$(extract_token "$resp_file")
      rm -f "$resp_file"
    elif [[ "$status" == "409" ]]; then
      rm -f "$resp_file"
      read -r status resp_file < <(request "/api/auth/login" "$payload")
      if [[ "$status" == "200" ]]; then
        token=$(extract_token "$resp_file")
        rm -f "$resp_file"
      else
        print_error "$status" "$resp_file"
        rm -f "$resp_file"
        exit 1
      fi
    else
      print_error "$status" "$resp_file"
      rm -f "$resp_file"
      exit 1
    fi
  else
    echo "Login failed and auto-register is disabled." >&2
    exit 1
  fi
fi

if [[ -z "${token:-}" ]]; then
  echo "Token not found in response." >&2
  exit 1
fi

if [[ $PRINT_HEADER -eq 1 ]]; then
  echo "Authorization: Bearer $token"
else
  echo "$token"
fi
