#!/usr/bin/env bash
set -e

APP_DIR="/usr/share/nginx/html"

echo "Injecting runtime environment variables into Angular app..."

# Replace placeholder values from environment.ts with actual environment variable values
find "$APP_DIR" -type f \( -name "*.js" -o -name "*.html" \) -exec \
  sed -i \
    -e "s|KEYCLOAK_URL_PLACEHOLDER|${KEYCLOAK_URL}|g" \
    -e "s|KEYCLOAK_REALM_PLACEHOLDER|${KEYCLOAK_REALM}|g" \
    -e "s|KEYCLOAK_CLIENT_ID_PLACEHOLDER|${KEYCLOAK_CLIENT_ID}|g" \
    -e "s|SHIFTSERVICE_BASE_PATH_PLACEHOLDER|${SHIFTSERVICE_BASE_PATH}|g" \
    -e "s|AUDITSERVICE_BASE_PATH_PLACEHOLDER|${AUDITSERVICE_BASE_PATH}|g" \
    -e "s|NOTIFICATIONSERVICE_BASE_PATH_PLACEHOLDER|${NOTIFICATIONSERVICE_BASE_PATH}|g" \
    {} +

echo "Starting nginx..."

exec "$@"
