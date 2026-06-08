#!/bin/bash
# Generate Flutter SDK from live OpenAPI spec
# Usage: ./scripts/generate-flutter-sdk.sh [spec_url]

SPEC_URL="${1:-https://token-meta.bithub.pro/openapi.json}"
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/token-meta-gateway-flutter"

openapi-generator generate \
  -i "$SPEC_URL" \
  -g dart \
  -o "$OUTPUT_DIR" \
  --additional-properties=pubName=token_meta_gateway,pubVersion=0.1.0,pubDescription="ZeroWallet Token Metadata Gateway API client for Flutter",useJsonKey=true,sortParamsByRequiredFlag=true
