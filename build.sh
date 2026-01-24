#!/bin/bash
# Build script for PagePalette deployment
# Controlled by DEPLOY_MODE environment variable:
#   - "static" (default): Serves static HTML from apps/web/public/
#   - "full": Builds the full React Router app with animations

set -e

DEPLOY_MODE="${DEPLOY_MODE:-static}"

echo "==================================="
echo "PagePalette Build Script"
echo "DEPLOY_MODE: $DEPLOY_MODE"
echo "==================================="

if [ "$DEPLOY_MODE" = "full" ]; then
    echo "Building full React Router application..."
    
    cd apps/web
    
    # Check if source files exist
    if [ ! -d "src" ]; then
        echo "ERROR: src/ directory not found in apps/web/"
        echo "Full app source code needs to be restored from archive/apps/web/"
        exit 1
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    # Run the build
    echo "Running build..."
    npm run build
    
    echo "Full app build complete!"
else
    echo "Static mode - no build needed"
    echo "Vercel will serve directly from apps/web/public/"
    
    # Verify static files exist
    if [ ! -f "apps/web/public/index.html" ]; then
        echo "ERROR: apps/web/public/index.html not found!"
        exit 1
    fi
    
    echo "Static site ready for deployment"
fi

echo "==================================="
echo "Build script completed successfully"
echo "==================================="
