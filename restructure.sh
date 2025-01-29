#!/bin/bash

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Starting project restructuring...${NC}"

# Create backup of src directory
echo -e "${YELLOW}Creating backup...${NC}"
cp -r src src.bak

# Create new directories that don't exist
echo -e "${YELLOW}Creating additional directories...${NC}"

# Add form and settings routes
mkdir -p src/app/form
mkdir -p src/app/settings

# Add form components
mkdir -p src/components/form/{mood-score,sleep-score,tracking,section-manager}

# Add test subdirectories
mkdir -p src/tests/components/form

# Create necessary files
echo -e "${YELLOW}Creating route files...${NC}"
touch src/app/form/{layout.tsx,page.tsx}
touch src/app/settings/{layout.tsx,page.tsx}

# Move everything from src to root
echo -e "${YELLOW}Moving files to root...${NC}"
cp -r src/* .

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf src

echo -e "${GREEN}Directory structure updated successfully${NC}"
echo -e "${YELLOW}Original src directory backed up as src.bak${NC}"
echo -e "${YELLOW}Please review the changes and commit them if satisfied${NC}" 