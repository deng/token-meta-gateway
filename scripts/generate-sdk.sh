#!/bin/bash
# Regenerate TypeScript and Flutter SDKs from the live OpenAPI spec
# Usage: ./scripts/generate-sdk.sh [spec-url]
# Default spec URL points to production; use localhost for pre-deploy testing

set -euo pipefail

SPEC_URL="${1:-https://token-meta.bithub.pro/openapi.json}"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TS_OUTPUT="$BASE_DIR/token-meta-gateway-ts"
FLUTTER_OUTPUT="$BASE_DIR/token-meta-gateway-flutter"

echo "=== Regenerating SDKs ==="
echo "  Spec URL: $SPEC_URL"
echo ""

# Check required tools
if ! command -v openapi-generator &> /dev/null; then
  echo "Error: openapi-generator not found. Install it via:"
  echo "  brew install openapi-generator"
  echo "  # or"
  echo "  npm install @openapitools/openapi-generator-cli -g"
  exit 1
fi

# ---- TypeScript SDK ----
echo "--- TypeScript SDK ---"
rm -rf "$TS_OUTPUT"
openapi-generator generate \
  -i "$SPEC_URL" \
  -g typescript-fetch \
  -o "$TS_OUTPUT" \
  --additional-properties=\
npmName=token-meta-gateway,\
npmVersion=1.0.0,\
useSingleRequestParameter=true,\
withInterfaces=true

echo "  Generated $(find "$TS_OUTPUT" -name '*.ts' | wc -l | xargs) TypeScript files"
echo ""

# ---- Flutter SDK ----
echo "--- Flutter SDK ---"
rm -rf "$FLUTTER_OUTPUT"
openapi-generator generate \
  -i "$SPEC_URL" \
  -g dart \
  -o "$FLUTTER_OUTPUT" \
  --additional-properties=\
pubName=token_meta_gateway,\
pubVersion=1.0.0,\
pubDescription="ZeroWallet Token Metadata Gateway API client for Flutter",\
useJsonKey=true,\
sortParamsByRequiredFlag=true

echo "  Generated $(find "$FLUTTER_OUTPUT/lib" -name '*.dart' | wc -l | xargs) Dart files"
echo ""

echo "=== Done ==="
echo "TS SDK:     $TS_OUTPUT"
echo "Flutter SDK: $FLUTTER_OUTPUT"
