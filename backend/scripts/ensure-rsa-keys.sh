#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_RES_DIR="$SCRIPT_DIR/../src/main/resources"

PRIVATE_LOC=${RSA_PRIVATE_KEY_LOCATION:-classpath:private_pkcs8.pem}
PUBLIC_LOC=${RSA_PUBLIC_KEY_LOCATION:-classpath:public.pem}

resolve_path() {
  local loc="$1"
  if [[ "$loc" == classpath:* ]]; then
    echo "$DEFAULT_RES_DIR/${loc#classpath:}"
    return 0
  fi
  if [[ "$loc" == file:* ]]; then
    echo "${loc#file:}"
    return 0
  fi
  return 1
}

if ! PRIVATE_PATH=$(resolve_path "$PRIVATE_LOC"); then
  echo "Unsupported RSA_PRIVATE_KEY_LOCATION: $PRIVATE_LOC" >&2
  exit 1
fi
if ! PUBLIC_PATH=$(resolve_path "$PUBLIC_LOC"); then
  echo "Unsupported RSA_PUBLIC_KEY_LOCATION: $PUBLIC_LOC" >&2
  exit 1
fi

PRIVATE_DIR="$(dirname "$PRIVATE_PATH")"
PUBLIC_DIR="$(dirname "$PUBLIC_PATH")"

if [[ "$PRIVATE_DIR" != "$PUBLIC_DIR" ]]; then
  echo "RSA key locations must be in the same directory." >&2
  exit 1
fi

if [[ "$(basename "$PRIVATE_PATH")" != "private_pkcs8.pem" || "$(basename "$PUBLIC_PATH")" != "public.pem" ]]; then
  echo "This helper expects private_pkcs8.pem and public.pem file names." >&2
  exit 1
fi

if [[ -f "$PRIVATE_PATH" && -f "$PUBLIC_PATH" ]]; then
  echo "RSA keys already exist in $PRIVATE_DIR"
  exit 0
fi

echo "Generating RSA keys in $PRIVATE_DIR"
bash "$SCRIPT_DIR/generate-rsa-keys.sh" --force "$PRIVATE_DIR"
