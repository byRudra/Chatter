#!/bin/sh
# Writes the browser runtime config from the container environment, so one image
# can point at any backend without rebuilding.
set -eu

escaped=$(printf '%s' "${API_BASE_URL:-}" | sed 's/\\/\\\\/g; s/"/\\"/g')
cat > /usr/share/nginx/html/config.js <<EOF
window.__CHATTER_CONFIG__ = { apiBaseUrl: "${escaped}" };
EOF

echo "chatter: API_BASE_URL=${API_BASE_URL:-<unset, using build default>}"
