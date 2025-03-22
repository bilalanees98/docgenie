#!/bin/bash

# Build the package
echo "Building package..."
npm run build

# Add test file to git
echo "Adding test file to git..."
git add test-file.ts -f

# Run the CLI
echo "Running doc-genie..."
dist/cli.js scan --staged

# Clean up
echo "Cleaning up..."
git reset test-file.ts 