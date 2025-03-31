#!/bin/bash

echo "🔍 Running pre-push checks..."

# Lint
echo "🧹 Linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Push aborted."
  exit 1
fi

# TypeScript check
echo "🧠 TypeScript check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors. Push aborted."
  exit 1
fi

# Build (without Prisma generate)
echo "🛠 Building project..."
NEXT_PUBLIC_SKIP_PRISMA_GENERATE=true next build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Push aborted."
  exit 1
fi

echo "✅ All checks passed. Push allowed." 