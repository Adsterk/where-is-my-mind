#!/bin/bash

echo "Fixing MedicationTracker..."

# Fix imports
sed -i'' \
  -e 's|from "@/components/ui/button"|from "@/components/ui"|g' \
  -e 's|from "@/components/ui/card"|from "@/components/ui"|g' \
  -e 's|from "@/components/ui/input"|from "@/components/ui"|g' \
  -e 's|from "@/components/ui/label"|from "@/components/ui"|g' \
  -e 's|from "@/components/providers/FormEditContext"|from "@/components/providers"|g' \
  -e 's|from "@/hooks/use-toast"|from "@/hooks"|g' \
  src/components/forms/trackers/medication/MedicationTracker.tsx

# Verify the fix
if grep -q "export function MedicationTracker" src/components/forms/trackers/medication/MedicationTracker.tsx; then
  echo "✅ MedicationTracker export verified"
else
  echo "❌ MedicationTracker export still missing"
fi 