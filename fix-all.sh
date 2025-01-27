#!/bin/bash

set -e  # Exit on error

echo "Starting comprehensive fixes..."

# Function to fix component imports
fix_component_imports() {
    local file=$1
    echo "Fixing imports in $file..."
    
    local tmp_file="${file}.tmp"
    
    # Read file and apply all replacements
    cat "$file" | \
    sed \
        -e 's|from "@/components/ui/button"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/card"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/input"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/label"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/loading-spinner"|from "@/components/ui"|g' \
        -e 's|from "@/components/ui/toast"|from "@/components/ui"|g' \
        -e 's|from "@/components/providers/FormEditContext"|from "@/components/providers"|g' \
        -e 's|from "@/components/providers/SupabaseProvider"|from "@/components/providers"|g' \
        -e 's|from "@/hooks/use-toast"|from "@/hooks"|g' \
        -e 's|from "@/hooks/useFormPersistence"|from "@/hooks"|g' \
        -e 's|import { Button } from "@/components/ui/button"|import { Button } from "@/components/ui"|g' \
        -e 's|import { Card, CardContent } from "@/components/ui/card"|import { Card, CardContent } from "@/components/ui"|g' \
        -e 's|import { Input } from "@/components/ui/input"|import { Input } from "@/components/ui"|g' \
        -e 's|import { Label } from "@/components/ui/label"|import { Label } from "@/components/ui"|g' \
        -e 's|import { useFormEdit } from "@/components/providers/FormEditContext"|import { useFormEdit } from "@/components/providers"|g' \
        -e 's|import { useToast } from "@/hooks/use-toast"|import { useToast } from "@/hooks"|g' \
        > "$tmp_file"

    mv "$tmp_file" "$file"
}

# Function to consolidate imports
consolidate_imports() {
    local file=$1
    echo "Consolidating imports in $file..."
    
    local tmp_file="${file}.tmp"
    
    # Create a new file with consolidated imports
    awk '
    BEGIN { 
        print "\"use client\"\n"
        print "import { useState } from \"react\""
        print "import {"
        print "  Button,"
        print "  Card,"
        print "  CardContent,"
        print "  Input,"
        print "  Label"
        print "} from \"@/components/ui\""
        print "import { useFormEdit } from \"@/components/providers\""
        print "import { useToast } from \"@/hooks\""
        print "import { Plus, Check } from \"lucide-react\"\n"
    }
    /^(import|"use client")/ { next }
    { print }
    ' "$file" > "$tmp_file"

    mv "$tmp_file" "$file"
}

# Fix SpiritualityTracker
echo "Fixing SpiritualityTracker..."
fix_component_imports "src/components/forms/trackers/spirituality/SpiritualityTracker.tsx"
consolidate_imports "src/components/forms/trackers/spirituality/SpiritualityTracker.tsx"

# Create/update providers index
echo "Updating providers index..."
cat > src/components/providers/index.ts << EOL
export { useFormEdit } from './FormEditContext'
export { useSupabase } from './SupabaseProvider'
EOL

# Create/update hooks index
echo "Updating hooks index..."
cat > src/hooks/index.ts << EOL
export { useToast } from './use-toast'
export { useFormPersistence } from './useFormPersistence'
EOL

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

# Fix all tracker components
echo "Fixing all tracker components..."
for tracker in src/components/forms/trackers/*/*.tsx; do
    if [ -f "$tracker" ]; then
        fix_component_imports "$tracker"
    fi
done

# Verify the fixes
echo "Verifying fixes..."
./verify-mood.sh

# Run import checks
echo "Checking imports..."
./fix-imports.sh

echo "All fixes complete! Please verify your application still works correctly." 