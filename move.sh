#!/bin/bash

# Create backup of src directory
cp -r src src.bak

# Create new directories
mkdir -p src/app/form src/app/settings
mkdir -p src/components/form/{mood-score,sleep-score,tracking,section-manager}
mkdir -p src/tests/components/form

# Create necessary files
touch src/app/form/{layout.tsx,page.tsx}
touch src/app/settings/{layout.tsx,page.tsx}

# Move everything from src to root
cp -r src/* .

# Clean up
rm -rf src 