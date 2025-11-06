# Test Cleanup Guide

## Overview

Tests create resources (pipes, memories, threads, documents) in your Langbase account. **ALL created resources are automatically cleaned up after tests complete.**

## Automatic Cleanup Features

### ✅ Implemented Cleanup

| API | Resource | Cleanup Method | Status |
|-----|----------|----------------|--------|
| **Memory** | Memories + Documents | `afterAll()` hook deletes all | ✅ Auto cleanup |
| **Threads** | Threads | `afterAll()` hook deletes all | ✅ Auto cleanup |
| **Pipes** | Pipes | Logged for manual cleanup | ⚠️ No delete API |

### How Cleanup Works

#### 1. Memory API (Fully Automated)
```typescript
const createdMemories: string[] = []; // Track created memories

afterAll(async () => {
  console.log(`\n🧹 Cleaning up ${createdMemories.length} memories...`);
  for (const memoryName of createdMemories) {
    try {
      await langbase.memories.delete({name: memoryName});
      console.log(`  ✅ Deleted memory: ${memoryName}`);
    } catch (error) {
      console.log(`  ⚠️  Failed to delete: ${memoryName}`);
    }
  }
});
```

**What gets cleaned:**
- Test memories (e.g., `test-memory-1234567890`)
- Associated documents uploaded to those memories
- Embeddings generated for those documents

#### 2. Threads API (Fully Automated)
```typescript
const createdThreads: string[] = []; // Track created threads

afterAll(async () => {
  console.log(`\n🧹 Cleaning up ${createdThreads.length} threads...`);
  for (const threadId of createdThreads) {
    try {
      await langbase.threads.delete({threadId});
      console.log(`  ✅ Deleted thread: ${threadId}`);
    } catch (error) {
      console.log(`  ⚠️  Failed to delete: ${threadId}`);
    }
  }
});
```

**What gets cleaned:**
- Test threads created
- All messages in those threads

#### 3. Pipes API (Manual Cleanup Required)
```typescript
const createdPipes: string[] = []; // Track created pipes

afterAll(async () => {
  // Langbase API doesn't have a delete pipe endpoint yet
  console.log('\n⚠️  Created pipes during tests (manual cleanup needed):');
  createdPipes.forEach(name => console.log(`  - ${name}`));
});
```

**Manual cleanup needed for:**
- `test-pipe-{timestamp}`
- `test-pipe-upsert-{timestamp}`
- `test-pipe-vars-{timestamp}`
- `test-pipe-update-{timestamp}`

## Viewing Created Resources

### During Test Execution

Watch the console output:

```bash
pnpm --filter langbase test:node src/langbase/memory.test.ts
```

**Output shows:**
```
Running tests...
✓ should create memory (234ms)
✓ should upload document (456ms)

🧹 Cleaning up 5 memories...
  ✅ Deleted memory: test-memory-1699564123
  ✅ Deleted memory: test-memory-1699564234
  ✅ Deleted memory: test-memory-1699564345
```

### After Test Execution

**Check your Langbase account:**

1. **Memories**: https://langbase.com/memories
   - Filter by name starting with `test-`
   - All should be deleted after tests

2. **Pipes**: https://langbase.com/pipes
   - Look for pipes starting with `test-pipe-`
   - **These need manual deletion** (delete button in UI)

3. **Threads**: Via API only
   - Check using `langbase.threads.list()` if needed
   - All test threads should be deleted

## Manual Cleanup (If Tests Fail)

If tests crash or are interrupted before cleanup runs:

### Option 1: Via Langbase UI

1. **Delete Memories:**
   ```
   https://langbase.com/memories
   → Find memories starting with "test-memory-"
   → Click delete icon for each
   ```

2. **Delete Pipes:**
   ```
   https://langbase.com/pipes
   → Find pipes starting with "test-pipe-"
   → Click delete icon for each
   ```

### Option 2: Via API/SDK

Create a cleanup script:

```typescript
// cleanup.ts
import {Langbase} from 'langbase';

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!
});

async function cleanup() {
  // Clean up test memories
  const memories = await langbase.memories.list();
  const testMemories = memories.filter(m => m.name.startsWith('test-memory-'));

  for (const memory of testMemories) {
    await langbase.memories.delete({name: memory.name});
    console.log(`✅ Deleted memory: ${memory.name}`);
  }

  // Clean up test pipes (manual via UI - no delete API)
  const pipes = await langbase.pipes.list();
  const testPipes = pipes.filter(p => p.name.startsWith('test-pipe-'));

  if (testPipes.length > 0) {
    console.log('\n⚠️  Found test pipes (delete manually via UI):');
    testPipes.forEach(p => console.log(`  - ${p.name}`));
  }
}

cleanup();
```

Run it:
```bash
npx tsx cleanup.ts
```

### Option 3: Delete All Test Resources Script

```bash
# List all test resources
pnpm --filter langbase tsx -e "
import {Langbase} from './src/index.ts';
const lb = new Langbase({apiKey: process.env.LANGBASE_API_KEY});

// List memories
const memories = await lb.memories.list();
console.log('Test Memories:', memories.filter(m => m.name.startsWith('test-')));

// List pipes
const pipes = await lb.pipes.list();
console.log('Test Pipes:', pipes.filter(p => p.name.startsWith('test-')));
"
```

## Preventing Resource Buildup

### 1. Always Run Full Test Suites

Let tests complete so cleanup runs:
```bash
# ✅ Good - cleanup runs
pnpm --filter langbase test:node src/langbase/memory.test.ts

# ❌ Bad - Ctrl+C before cleanup
pnpm --filter langbase test:node
# ... then Ctrl+C mid-test
```

### 2. Use try-finally in Individual Tests

For one-off tests, wrap in try-finally:

```typescript
it('my test', async () => {
  const memoryName = `test-memory-${Date.now()}`;

  try {
    // Test code
    await langbase.memories.create({name: memoryName});
    // ... test logic
  } finally {
    // Always cleanup
    await langbase.memories.delete({name: memoryName});
  }
});
```

### 3. Run Cleanup After Test Failures

If test suite fails, run cleanup manually:

```bash
# After failed tests
pnpm --filter langbase tsx scripts/cleanup-test-resources.ts
```

## Resource Naming Convention

All test resources use timestamp-based names:

| Resource Type | Naming Pattern | Example |
|--------------|----------------|---------|
| Memory | `test-memory-{timestamp}` | `test-memory-1699564123` |
| Pipe | `test-pipe-{timestamp}` | `test-pipe-1699564123` |
| Thread | Custom ID with timestamp | `custom-thread-1699564123` |
| Document | `test-doc.txt`, `test.md` etc | Various |

This makes them easy to identify and clean up.

## Cleanup Verification

After running tests, verify all resources are cleaned:

```bash
# Check memories
pnpm --filter langbase tsx -e "
const lb = new (await import('./src/index.ts')).Langbase({
  apiKey: process.env.LANGBASE_API_KEY
});
const memories = await lb.memories.list();
const testMems = memories.filter(m => m.name.startsWith('test-'));
console.log('Remaining test memories:', testMems.length);
if (testMems.length > 0) {
  console.log(testMems.map(m => m.name));
}
"
```

## Best Practices

### ✅ DO:
- Let test suites complete fully
- Check console for cleanup logs
- Verify cleanup after tests
- Use timestamped names for resources
- Delete manually if tests are interrupted

### ❌ DON'T:
- Interrupt tests with Ctrl+C during execution
- Reuse test resource names (use timestamps)
- Leave test resources in account
- Run tests on production account without cleanup

## Troubleshooting

### Issue: "Memory not found" during cleanup
**Cause**: Memory was already deleted (maybe by another test)
**Solution**: This is normal - cleanup continues with other resources

### Issue: Cleanup takes too long
**Cause**: Many resources to delete
**Solution**:
```typescript
// Add parallel cleanup
await Promise.all(
  createdMemories.map(name =>
    langbase.memories.delete({name}).catch(() => {})
  )
);
```

### Issue: "Rate limit exceeded" during cleanup
**Cause**: Too many delete requests
**Solution**: Add delays between deletions
```typescript
for (const name of createdMemories) {
  await langbase.memories.delete({name});
  await new Promise(r => setTimeout(r, 100)); // 100ms delay
}
```

## Summary

**Automatic Cleanup** ✅
- Memories: YES
- Threads: YES
- Documents: YES (deleted with memory)

**Manual Cleanup** ⚠️
- Pipes: YES (no delete API endpoint yet)

**Zero Traces Left** 🎯
- After tests complete successfully, only pipes need manual deletion
- Check console output for list of pipes to delete
- All other resources are automatically cleaned up

---

**Generated**: 2025-11-05
**SDK Version**: 1.2.4
