# Setup Commands Reference

## Initial Setup
```bash
# Navigate to your local directory
cd /Users/adster/where-is-my-mind

# Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# Install/update dependencies
npm install

# Verify the development environment
npm run dev
```

## Verify File Structure
```bash
# Check main directories
ls -la src/

# Check specific directories
ls -la src/lib/types/
ls -la src/lib/hooks/
ls -la src/components/
```

## Development Commands
```bash
# Start development server
npm run dev

# Run tests (if any)
npm test

# Check for type errors
npm run type-check
```

## Fix Missing/Outdated Files
```bash
# Option 1: Discard local changes and get latest version
git fetch origin
git reset --hard origin/main

# Option 2: Preserve local changes
git stash
git pull origin main
git stash pop
```

## Troubleshooting
If you encounter any issues:
1. Ensure all dependencies are installed: `npm install`
2. Clear npm cache: `npm cache clean --force`
3. Remove node_modules and reinstall: 
   ```bash
   rm -rf node_modules
   npm install
   ``` 