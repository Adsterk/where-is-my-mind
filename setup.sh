#!/bin/bash

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# Error handling
set -e
trap 'catch_error $? $LINENO' ERR

catch_error() {
    echo -e "${RED}Error occurred in script at line $2${NC}"
    echo -e "${RED}Error code: $1${NC}"
    
    # Revert changes if backup exists
    if [ -d "../project_backup" ]; then
        echo -e "${YELLOW}Reverting changes from backup...${NC}"
        rm -rf ./*
        cp -r ../project_backup/* .
        echo -e "${GREEN}Changes reverted successfully${NC}"
    fi
    
    exit 1
}

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
mkdir -p ../project_backup
cp -r ./* ../project_backup/

# Stash any uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Stashing uncommitted changes...${NC}"
    git stash
fi

echo -e "${YELLOW}Creating directory structure...${NC}"

# Create directories
mkdir -p app/{auth/{login,register,"reset-password"},dashboard,form,settings,api}
mkdir -p components/{form/{mood-score,sleep-score,tracking,section-manager},layout,ui}
mkdir -p lib/{supabase,hooks,stores,types}
mkdir -p test/{components/form,pages,mocks}

# Create files
touch app/{layout.tsx,page.tsx}
touch app/{dashboard,form,settings}/{layout.tsx,page.tsx}

# Copy existing files from src/ to new structure
if [ -d "src/app" ]; then
    echo -e "${YELLOW}Migrating app files...${NC}"
    cp -r src/app/* app/
fi

if [ -d "src/components" ]; then
    echo -e "${YELLOW}Migrating component files...${NC}"
    cp -r src/components/* components/
fi

if [ -d "src/lib" ]; then
    echo -e "${YELLOW}Migrating lib files...${NC}"
    cp -r src/lib/* lib/
fi

if [ -d "src/tests" ]; then
    echo -e "${YELLOW}Migrating test files...${NC}"
    cp -r src/tests/* test/
fi

# Preserve critical files
echo -e "${YELLOW}Preserving critical files...${NC}"
mkdir -p temp_critical_files
for file in .env.local .env.development supabase/config.toml next.config.js next.config.ts package.json package-lock.json tsconfig.json tsconfig.test.json tailwind.config.ts components.json .gitignore .postcssrc postcss.config.mjs eslint.config.mjs; do
    if [ -f "$file" ]; then
        dir=$(dirname "temp_critical_files/$file")
        mkdir -p "$dir"
        cp "$file" "temp_critical_files/$file"
    fi
done

# Clean up src directory
echo -e "${YELLOW}Cleaning up src directory...${NC}"
mv src src.bak

# Restore critical files
echo -e "${YELLOW}Restoring critical files...${NC}"
cp -r temp_critical_files/* .
rm -rf temp_critical_files

echo -e "${GREEN}Directory structure created successfully${NC}"
echo -e "${YELLOW}Backup location: ../project_backup${NC}"
echo -e "${YELLOW}Original src directory backed up as src.bak${NC}"
echo -e "${YELLOW}Please review the changes and commit them if satisfied${NC}" 