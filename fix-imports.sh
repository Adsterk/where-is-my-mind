#!/bin/bash

set -e  # Exit on error

echo "Starting import verification and fixes..."

# Function to update imports in a file
update_imports() {
    local file=$1
    echo "Updating imports in $file..."

    # Create temp file
    local tmp_file="${file}.tmp"

    # Update old tracker imports to new structure
    cat "$file" | \
    sed \
        -e 's|from "@/components/ui/button"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/card"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/input"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/label"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/loading-spinner"|from "@/components/ui"|g' \
        -e 's|from "../activities/|from "@/components/forms/trackers/|g' \
        -e 's|from "../behaviors/|from "@/components/forms/trackers/|g' \
        -e 's|from "../medication/|from "@/components/forms/trackers/|g' \
        -e 's|from "../mood/|from "@/components/forms/trackers/|g' \
        -e 's|from "../skills/|from "@/components/forms/trackers/|g' \
        -e 's|from "../sleep/|from "@/components/forms/trackers/|g' \
        -e 's|from "../social/|from "@/components/forms/trackers/|g' \
        -e 's|from "../spirituality/|from "@/components/forms/trackers/|g' \
        -e 's|from "./MoodAndNotesTracker"|from "./MoodTracker"|g' \
        -e 's|from "@/components/forms/mood/|from "@/components/forms/trackers/mood/|g' \
        -e 's|from "@/components/forms/medication/|from "@/components/forms/trackers/medication/|g' \
        -e 's|from "@/components/forms/activities/|from "@/components/forms/trackers/activities/|g' \
        -e 's|from "@/components/forms/behaviors/|from "@/components/forms/trackers/behaviors/|g' \
        -e 's|from "@/components/forms/skills/|from "@/components/forms/trackers/skills/|g' \
        -e 's|from "@/components/forms/sleep/|from "@/components/forms/trackers/sleep/|g' \
        -e 's|from "@/components/forms/social/|from "@/components/forms/trackers/social/|g' \
        -e 's|from "@/components/forms/spirituality/|from "@/components/forms/trackers/spirituality/|g' \
        -e 's|from "@/components/providers/FormEditContext"|from "@/components/providers"|g' \
        -e 's|from "@/components/providers/SupabaseProvider"|from "@/components/providers"|g' \
        -e 's|from "@/hooks/use-toast"|from "@/hooks"|g' \
        -e 's|from "@/hooks/useFormPersistence"|from "@/hooks"|g' \
        > "$tmp_file"

    # Replace original with updated file
    mv "$tmp_file" "$file"
}

# Function to verify imports in a file
verify_imports() {
    local file=$1
    local has_errors=0

    echo "Verifying imports in $file..."

    # Check for old-style imports
    if grep -q 'from.*components/ui/' "$file"; then
        echo "❌ Found old UI component imports in: $file"
        echo "   Please check the file manually"
        has_errors=1
    fi

    if grep -q 'from.*components/providers/.*Context' "$file"; then
        echo "❌ Found old provider context imports in: $file"
        echo "   Please check the file manually"
        has_errors=1
    fi

    if grep -q 'from.*hooks/use-' "$file"; then
        echo "❌ Found old hook imports in: $file"
        echo "   Please check the file manually"
        has_errors=1
    fi

    if grep -q 'from.*forms/[^t]' "$file"; then
        echo "❌ Found old forms imports in: $file"
        echo "   Please check the file manually"
        has_errors=1
    fi

    if [ $has_errors -eq 0 ]; then
        echo "✅ All imports look good"
    fi

    return $has_errors
}

# First, let's verify all TypeScript/React files exist
echo "Checking for TypeScript/React files..."
if ! find src -name "*.tsx" -o -name "*.ts" > /dev/null; then
    echo "❌ No TypeScript/React files found!"
    exit 1
fi

# Update main component files
echo "Updating component imports..."
find src/components/forms -name "*.tsx" -o -name "*.ts" | while read -r file; do
    if [ -f "$file" ]; then
        update_imports "$file"
        verify_imports "$file"
    fi
done

# Update page files
echo "Updating page imports..."
find src/app -name "*.tsx" -o -name "*.ts" | while read -r file; do
    if [ -f "$file" ]; then
        update_imports "$file"
        verify_imports "$file"
    fi
done

# Create/update UI index
echo "Updating UI index..."
cat > src/components/ui/index.ts << EOL
export * from './button'
export * from './card'
export * from './input'
export * from './label'
export * from './loading-spinner'
export * from './toast'
EOL

# Create/update hooks index
echo "Updating hooks index..."
cat > src/hooks/index.ts << EOL
export * from './use-toast'
export * from './useFormPersistence'
EOL

echo "Import fixes complete! Please verify your application still works correctly."
echo "Note: Some files may need manual review if they still show errors." 