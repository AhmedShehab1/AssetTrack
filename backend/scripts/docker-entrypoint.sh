#!/usr/bin/env bash
set -euo pipefail

KEY_DIR=${ASSETTRACK_KEYS_DIR:-/var/assettrack/keys}
mkdir -p "$KEY_DIR"

export RSA_PRIVATE_KEY_LOCATION=${RSA_PRIVATE_KEY_LOCATION:-file:$KEY_DIR/private_pkcs8.pem}
export RSA_PUBLIC_KEY_LOCATION=${RSA_PUBLIC_KEY_LOCATION:-file:$KEY_DIR/public.pem}

bash /assettrack-backend/scripts/ensure-rsa-keys.sh

exec java -jar /assettrack-backend/app.jar
