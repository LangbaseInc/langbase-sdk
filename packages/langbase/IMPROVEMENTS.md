# CLI/SDK Setup Improvement Recommendations

## Current Analysis

### ✅ What's Working Well
1. **Complete separation** - CLI and SDK are properly isolated
2. **Automatic bundling** - `noExternal: [/.*/]` bundles everything
3. **Dual commands** - Both `langbase` and `lb` work
4. **Separate configs** - TypeScript, tests, and builds are independent
5. **Zero SDK impact** - Verified via grep checks

### ⚠️ Issues Found

#### 1. **CRITICAL: Commander.js in wrong dependencies section**
```json
// Current (WRONG)
"dependencies": {
  "commander": "^14.0.2"  // ❌ Bundled but in dependencies
}

// Should be (CORRECT)
"devDependencies": {
  "commander": "^14.0.2"  // ✅ Bundled, so dev-only
}
```

**Impact:**
- Confuses package managers
- Wrong metadata in package.json
- Unnecessary peer dependency warnings

#### 2. **Package Size Waste**
- SDK-only users download CLI bundle (96K extra)
- Distribution includes: `dist/cli/cli.js` + `dist/cli/cli.mjs` (both ~43K)
- Current package size includes both SDK + CLI for all users

#### 3. **Missing CLI Development Features**
- No CLI tests written yet
- No CLI examples
- No debug mode or verbose logging
- No configuration file support
- No command auto-completion

#### 4. **Build Duplication**
- CLI builds both CJS and ESM (`cli.js` + `cli.mjs`)
- CLI only needs CJS (it's a Node binary)
- ESM version is wasted space

#### 5. **Version Management Confusion**
- Same version for SDK and CLI
- Breaking change in CLI forces SDK version bump
- No independent versioning

## 🎯 Recommendations (Prioritized)

### Priority 1: Fix Critical Issues

#### 1.1 Move Commander to devDependencies
```bash
pnpm remove commander
pnpm add -D commander
```

**Why:** It's bundled, so it's a build-time dependency only.

#### 1.2 Build CLI as CJS Only
```typescript
// tsup.config.ts - CLI config
{
  entry: ['src/cli/cli.ts'],
  outDir: 'dist/cli',
  format: ['cjs'],  // ✅ Already correct - keep only CJS
  // Remove ESM build for CLI (it's unnecessary)
}
```

**Impact:** Saves ~43KB in package distribution

### Priority 2: Optimize Package Distribution

#### Option A: Keep Current Setup (Simple, Good Enough)
**Pros:**
- Simple single package
- Easy to maintain
- 96KB CLI overhead is acceptable for most use cases
- Users get both SDK + CLI in one install

**Cons:**
- SDK-only users download unused CLI bundle
- Larger package size

**Recommendation:** ✅ **Best for most cases** - The overhead is small

#### Option B: Separate Packages (Complex, Maximum Optimization)
**Structure:**
```
langbase/           # SDK only (no CLI)
langbase-cli/       # CLI only (depends on langbase)
```

**Pros:**
- SDK users get minimal package
- Independent versioning
- Clear separation of concerns

**Cons:**
- More maintenance overhead
- Two packages to publish
- More complex setup

**Recommendation:** ⚠️ Only if package size becomes a real issue

#### Option C: Optional CLI Installation (Middle Ground)
```json
// package.json
{
  "optionalDependencies": {
    "@langbase/cli": "^1.0.0"
  }
}
```

**Recommendation:** ⚠️ Complex, not worth it for current size

### Priority 3: Improve CLI Developer Experience

#### 3.1 Add CLI Development Watch Mode
```json
// package.json
{
  "scripts": {
    "dev:cli": "tsup --config tsup.config.ts --watch --entry.cli src/cli/cli.ts",
    "cli": "node dist/cli/cli.js"
  }
}
```

**Usage:**
```bash
# Terminal 1: Watch and rebuild CLI
pnpm dev:cli

# Terminal 2: Test CLI
pnpm cli -- my-command
```

#### 3.2 Add Debug Mode Support
```typescript
// src/cli/cli.ts
program
  .option('--debug', 'enable debug mode')
  .option('--verbose', 'verbose output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      process.env.DEBUG = 'langbase:*';
      console.log('[DEBUG] Enabled');
    }
  });
```

#### 3.3 Add Configuration File Support
```typescript
// src/cli/config.ts
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export function loadConfig() {
  const configPath = join(process.cwd(), '.langbaserc.json');
  if (existsSync(configPath)) {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  }
  return {};
}
```

#### 3.4 Add CLI Tests
```typescript
// src/cli/cli.test.ts
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('CLI', () => {
  it('should show version', () => {
    const output = execSync('node dist/cli/cli.js -v').toString();
    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should show help', () => {
    const output = execSync('node dist/cli/cli.js -h').toString();
    expect(output).toContain('Usage:');
  });
});
```

### Priority 4: Enhanced Features

#### 4.1 Add Shell Completion
```typescript
// src/cli/commands/completion.ts
import { Command } from 'commander';

export function completionCommand(program: Command) {
  program
    .command('completion')
    .description('generate shell completion script')
    .argument('<shell>', 'shell type (bash, zsh, fish)')
    .action((shell) => {
      // Generate completion script
      console.log(generateCompletion(shell, program));
    });
}
```

#### 4.2 Add Update Checker
```typescript
// src/cli/utils/update-check.ts
import { execSync } from 'child_process';

export async function checkForUpdates(currentVersion: string) {
  try {
    const latest = execSync('npm view langbase version').toString().trim();
    if (latest !== currentVersion) {
      console.log(`Update available: ${currentVersion} → ${latest}`);
      console.log('Run: npm install -g langbase@latest');
    }
  } catch (error) {
    // Silently fail
  }
}
```

#### 4.3 Better Error Handling
```typescript
// src/cli/cli.ts
process.on('uncaughtException', (error) => {
  console.error('Unexpected error:', error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
```

### Priority 5: Build Optimizations

#### 5.1 Add Source Maps for CLI Debugging
```typescript
// tsup.config.ts - CLI config
{
  entry: ['src/cli/cli.ts'],
  sourcemap: true,  // Enable for better debugging
  minify: process.env.NODE_ENV === 'production',  // Only minify in prod
}
```

#### 5.2 Separate Dev/Prod Builds
```json
// package.json
{
  "scripts": {
    "build": "NODE_ENV=production pnpm build:all",
    "build:all": "tsup --config tsup.config.ts --format esm,cjs --dts --external react",
    "build:dev": "tsup --config tsup.config.ts --format esm,cjs --dts --external react --sourcemap"
  }
}
```

#### 5.3 Verify Tree-Shaking
```json
// package.json
{
  "scripts": {
    "analyze:sdk": "npx esbuild-visualizer dist/index.js",
    "analyze:cli": "npx esbuild-visualizer dist/cli/cli.js"
  }
}
```

### Priority 6: Documentation & Examples

#### 6.1 Add CLI Examples
```typescript
// src/cli/examples/basic-usage.ts
/**
 * Example: Using Langbase CLI
 *
 * @example
 * ```bash
 * # Check version
 * langbase --version
 * lb -v
 *
 * # Get help
 * langbase --help
 * lb -h
 * ```
 */
```

#### 6.2 Auto-Generate CLI Docs
```json
// package.json
{
  "scripts": {
    "docs:cli": "node scripts/generate-cli-docs.js"
  }
}
```

### Priority 7: Monorepo Considerations

#### 7.1 Consider Separate CLI Package in Future
If package grows large:

```
packages/
  langbase/           # SDK only
  langbase-cli/       # CLI package
    package.json      # { name: "@langbase/cli" }
    src/
      cli.ts
      commands/
```

**Benefits:**
- Independent versioning
- Smaller SDK package
- Clearer separation

**When to do this:**
- When CLI bundle > 200KB
- When CLI and SDK have different release cycles
- When you have > 10 CLI commands

## 📋 Action Items (What to Do Now)

### Immediate (Do This Now)

1. **Move Commander to devDependencies**
```bash
pnpm remove commander
pnpm add -D commander
pnpm build
```

2. **Add CLI dev script**
```json
"scripts": {
  "dev:cli": "tsup --config tsup.config.ts --watch --entry.cli src/cli/cli.ts",
  "cli": "node dist/cli/cli.js"
}
```

3. **Add basic CLI tests**
```bash
# Create src/cli/cli.test.ts with basic tests
pnpm test:cli
```

### Short Term (Next Week)

4. **Add debug/verbose mode**
5. **Add basic error handling**
6. **Create CLI examples**
7. **Add configuration file support**

### Long Term (As Needed)

8. **Add shell completion**
9. **Add update checker**
10. **Consider separate package if CLI grows large**

## 🎯 Recommended Immediate Changes

I recommend making these 3 changes RIGHT NOW:

### 1. Move Commander to devDependencies ⚡
**Impact:** Fixes incorrect dependency metadata
**Effort:** 30 seconds

### 2. Add CLI development script ⚡
**Impact:** Much better DX for CLI development
**Effort:** 2 minutes

### 3. Enable sourcemaps for CLI (dev mode) ⚡
**Impact:** Better debugging
**Effort:** 1 minute

## 📊 Summary

**Current Setup:** 8/10
- ✅ Great separation
- ✅ Automatic bundling
- ⚠️ Small improvements needed

**With Improvements:** 10/10
- ✅ Perfect dependency management
- ✅ Better developer experience
- ✅ Production-ready CLI

**Key Insight:** Your current setup is actually quite good! The main issues are:
1. Commander in wrong dependencies (easy fix)
2. Missing CLI DX features (add as needed)
3. No tests yet (add incrementally)

The architecture is solid. The improvements are mostly additive features and polish.
