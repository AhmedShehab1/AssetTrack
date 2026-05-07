#!/usr/bin/env bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script must be sourced: source scripts/load-env.sh"
  exit 1
fi

ENV_FILE="${ENV_FILE:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.example to .env and fill in values."
  return 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

echo "Loaded environment from $ENV_FILE"
