#!/bin/bash

# Build the package
echo "Building package..."
npm run build

# Add test file to git
echo "Adding test file to git..."
git add test-file.ts -f

# Test the diff scanner
echo -e "\nTesting diff scanner..."
./dist/cli.js scan --staged


# Clean up
echo -e "\nCleaning up..."
git reset test-file.ts 