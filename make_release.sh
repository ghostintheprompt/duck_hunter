#!/bin/bash

# MDRN Corp Release Script
# Project: DuckHunter Laboratory
# Platform: Web / Static

echo "--- INITIATING RELEASE PROTOCOL ---"

# 1. Clean environment
echo "Cleaning artifacts..."
rm -rf dist
rm -f release.zip

# 2. Build production assets
echo "Compiling tactical assets..."
npm run build

# 3. Package for distribution
if [ -d "dist" ]; then
    echo "Packaging Laboratory distribution..."
    zip -r release.zip dist/
    echo "--- RELEASE READY: release.zip ---"
else
    echo "ERROR: Build failed. Parity lost."
    exit 1
fi

# 4. Tagging version (if git is initialized)
if [ -d ".git" ]; then
    echo "Tagging v1.0.0..."
    git tag -a v1.0.0 -m "DuckHunter Lab: Initial Release"
fi
