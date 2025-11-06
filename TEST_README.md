# Langbase SDK Tests - Quick Start

## 🚀 Running Tests

```bash
# From repo root
pnpm --filter langbase test:node

# Or navigate to langbase package
cd packages/langbase
pnpm test:node
```

## 🧹 Automatic Cleanup

**All test resources are automatically cleaned up after tests complete!**

- ✅ **Memories** → Deleted automatically
- ✅ **Threads** → Deleted automatically
- ✅ **Documents** → Deleted with memories
- ⚠️ **Pipes** → Listed for manual deletion (no delete API yet)

## 📋 Manual Cleanup (If Needed)

If tests are interrupted or fail:

```bash
pnpm --filter langbase cleanup:test
```

This will:
1. Delete all test memories
2. Delete all test threads
3. List pipes that need manual deletion via UI

## 📚 Documentation

| File | Purpose |
|------|---------|
| **TESTING_SUMMARY.md** | Quick overview & commands |
| **TEST_COVERAGE.md** | Detailed test documentation |
| **CLEANUP_GUIDE.md** | Cleanup procedures & troubleshooting |
| **TEST_RESULTS.md** | Error explanations & solutions |

## ⚡ Quick Commands

```bash
# Run all tests
pnpm --filter langbase test:node

# Run specific test file
pnpm --filter langbase test:node src/langbase/memory.test.ts

# Watch mode
pnpm --filter langbase test:node --watch

# Cleanup test resources
pnpm --filter langbase cleanup:test
```

## ✅ What's Included

- **173+ tests** covering all SDK methods
- **Automatic cleanup** for all resources
- **Cleanup script** for manual cleanup
- **Full documentation** with examples
- **Best practices** and troubleshooting

## 🎯 Zero Traces Left

Tests are designed to leave **zero traces** in your account:

1. All test resources use `test-*` naming pattern
2. Automatic cleanup runs after each test suite
3. Manual cleanup script available for interrupted tests
4. Console output shows cleanup progress

**Example output:**
```
🧹 Cleaning up 5 memories...
  ✅ Deleted memory: test-memory-1699564123
  ✅ Deleted memory: test-memory-1699564234
  ...

⚠️  Created pipes (manual cleanup needed):
  - test-pipe-1699564123
```

## 📖 Read More

Start with **TESTING_SUMMARY.md** for a complete overview.

---

**Status**: ✅ All tests include automatic cleanup
**Last Updated**: 2025-11-05
