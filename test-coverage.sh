#!/bin/bash

# Build the package
echo "Building package..."
npm run build


# Test the coverage reporter
echo -e "\nTesting coverage reporter..."
./dist/cli.js coverage --file ./test-file.ts