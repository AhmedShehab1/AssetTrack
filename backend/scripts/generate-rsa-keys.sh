#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $(basename "$0") [--force] [output-dir]"
}

FORCE=0

if [[ "${1-}" == "-h" || "${1-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${1-}" == "-f" || "${1-}" == "--force" ]]; then
  FORCE=1
  shift
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${1-"$SCRIPT_DIR/../src/main/resources"}"

if [[ -n "${2-}" ]]; then
  usage
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required but not found."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

PRIVATE_KEY_PEM="$OUTPUT_DIR/private_key.pem"
PRIVATE_KEY_PKCS8="$OUTPUT_DIR/private_pkcs8.pem"
PUBLIC_KEY_PEM="$OUTPUT_DIR/public.pem"

if [[ $FORCE -ne 1 ]] && [[ -f "$PRIVATE_KEY_PKCS8" || -f "$PUBLIC_KEY_PEM" ]]; then
  echo "Key files already exist in $OUTPUT_DIR. Use --force to overwrite."
  exit 1
fi

openssl genrsa -out "$PRIVATE_KEY_PEM" 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in "$PRIVATE_KEY_PEM" \
  -out "$PRIVATE_KEY_PKCS8"
openssl rsa -in "$PRIVATE_KEY_PEM" -pubout -out "$PUBLIC_KEY_PEM"
rm -f "$PRIVATE_KEY_PEM"
chmod 600 "$PRIVATE_KEY_PKCS8"

echo "Generated keys:"
echo "- $PRIVATE_KEY_PKCS8"
echo "- $PUBLIC_KEY_PEM"
