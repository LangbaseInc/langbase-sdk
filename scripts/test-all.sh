#!/bin/bash

# Comprehensive test runner for Langbase SDK
# This script runs all tests that would be executed in CI/CD

set -e

echo "🧪 Running Langbase SDK Test Suite"
echo "=================================="

# Navigate to the langbase package directory
cd packages/langbase

echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "🔍 Running linting..."
pnpm lint || { echo "❌ Linting failed"; exit 1; }

echo ""
echo "🔧 Running type check..."
pnpm type-check || { echo "❌ Type check failed"; exit 1; }

echo ""
echo "🧪 Running tests - Node.js environment..."
pnpm test:node || { echo "❌ Node.js tests failed"; exit 1; }

echo ""
echo "⚡ Running tests - Edge runtime environment..."
pnpm test:edge || { echo "❌ Edge runtime tests failed"; exit 1; }

echo ""
echo "🌐 Installing Playwright browsers..."
pnpm exec playwright install --with-deps

echo ""
echo "⚛️  Running tests - React UI components..."
pnpm test:ui:react || { echo "❌ React UI tests failed"; exit 1; }

echo ""
echo "🏗️  Building SDK..."
pnpm build || { echo "❌ Build failed"; exit 1; }

echo ""
echo "✅ All tests passed!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Linting"
echo "  ✅ Type checking"
echo "  ✅ Node.js environment tests"
echo "  ✅ Edge runtime tests"
echo "  ✅ React UI component tests"
echo "  ✅ Build verification"
echo ""
echo "🎉 SDK is ready for production!"