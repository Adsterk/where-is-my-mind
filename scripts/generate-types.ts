import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const typesDir = path.join(process.cwd(), 'types')

// Create types directory if it doesn't exist
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true })
}

try {
  // Generate types using Supabase CLI
  execSync('supabase gen types typescript --local > types/supabase.ts', {
    stdio: 'inherit',
    encoding: 'utf8'
  })
  
  console.log('✅ Types generated successfully')
} catch (error) {
  console.error('❌ Error generating types:', error)
  process.exit(1)
} 