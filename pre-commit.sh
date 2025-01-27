#!/bin/sh

# Run tests
npm test

# If tests fail, prevent commit
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix before committing."
  exit 1
fi 