#!/bin/bash

# Release script for ds-aa-bridge
# Usage: ./release.sh v2.0.0

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh v2.0.0"
    exit 1
fi

# Update version in module.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" module.json

# Update version in package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# Create zip
zip -r ds-aa-bridge-$VERSION.zip . -x ".git/*" ".gitignore" ".github/*" "release.sh"

echo "Created ds-aa-bridge-$VERSION.zip"
echo "Ready to commit and push with tag: $VERSION"