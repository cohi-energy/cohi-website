#!/bin/bash

# Local development script for cohi-website

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting Cohi website local development..."

PORT="${PORT:-8000}"

echo "Syncing shared brand assets..."
(cd .. && npm run brand:sync)

# Check if config.js exists, if not create from template
if [ ! -f "config.js" ]; then
    if [ -f "config.template.js" ]; then
        echo -e "${YELLOW}config.js not found. Creating from template...${NC}"
        cp config.template.js config.js
        echo -e "${RED}⚠️  Please edit config.js and replace the placeholder values with your actual credentials.${NC}"
        echo ""
        echo "Required values:"
        echo "  - GOOGLE_APPS_SCRIPT_URL: Your Google Apps Script Web App URL"
        echo "  - REDDIT_PIXEL_ID: Your Reddit Pixel ID"
        echo "  - POSTHOG_API_KEY: Your PostHog API key (starts with phc_)"
        echo "  - POSTHOG_HOST: https://us.i.posthog.com"
        echo ""
        read -p "Press Enter after editing config.js to continue..."
    else
        echo -e "${RED}Error: config.template.js not found!${NC}"
        exit 1
    fi
fi

# Check if config.js still has placeholder values
if grep -q "__GOOGLE_APPS_SCRIPT_URL__\|__POSTHOG_API_KEY__\|phc_xxxxx" config.js; then
    echo -e "${YELLOW}⚠️  Warning: config.js appears to have placeholder values.${NC}"
    echo "The site may not work correctly until you add your actual credentials."
    echo ""
fi

# Start local server
echo -e "${GREEN}Starting local server on http://localhost:${PORT}${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Try Python 3 first, then Python 2, then Node.js
if command -v python3 &> /dev/null; then
    python3 -m http.server "${PORT}"
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer "${PORT}"
elif command -v npx &> /dev/null; then
    npx http-server -p "${PORT}"
else
    echo -e "${RED}Error: No suitable server found. Please install Python or Node.js.${NC}"
    exit 1
fi
