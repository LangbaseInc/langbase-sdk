# CLI & SDK Complete Separation

This document proves that the CLI and SDK are **completely separated** with zero impact on each other.

## Package Configuration

**Package Name:** `langbase` (same for both CLI and SDK)

**CLI Commands:**
```bash
langbase --version    # Primary command
lb --version          # Alias for convenience
```

**SDK Import:**
```typescript
import { Pipe } from 'langbase';  // Zero CLI code included
```

## Bundle Separation Proof

### Bundle Sizes
```
SDK (CJS): 51K  - Clean SDK code only
SDK (ESM): 50K  - Clean SDK code only
CLI:       43K  - All CLI deps bundled (including Commander.js)
```

### Verification Commands

#### 1. SDK Bundles are CLEAN (no CLI code)
```bash
# Check CJS bundle
grep -i "commander\|cli\.ts\|commands/" dist/index.js
# Output: (nothing) ✓

# Check ESM bundle
grep -i "commander\|cli\.ts\|commands/" dist/index.mjs
# Output: (nothing) ✓
```

#### 2. CLI Bundle CONTAINS everything
```bash
# Check CLI has Commander.js bundled
grep "commander" dist/cli/cli.js | head -1
# Output: Shows Commander.js code ✓

# Check shebang for direct execution
head -1 dist/cli/cli.js
# Output: #!/usr/bin/env node ✓
```

#### 3. SDK Source has NO CLI imports
```bash
# Check all SDK source files
grep -r "import.*cli" src/index.ts src/pipes/ src/langbase/ src/lib/ src/common/
# Output: (nothing) ✓
```

## How It Works

### 1. Entry Points are Separate

**package.json:**
```json
{
  "name": "langbase",
  "main": "./dist/index.js",      // SDK entry (CJS)
  "module": "./dist/index.mjs",   // SDK entry (ESM)
  "bin": {
    "langbase": "./dist/cli/cli.js",  // CLI entry
    "lb": "./dist/cli/cli.js"         // CLI alias
  }
}
```

**Result:**
- When you `import` or `require` langbase → Uses SDK entry points
- When you run `langbase` or `lb` command → Uses CLI entry point
- **Never overlap!**

### 2. TypeScript Configs are Separate

**tsconfig.json (SDK):**
```json
{
  "include": ["."],
  "exclude": ["src/cli"]  // ← CLI excluded from SDK
}
```

**tsconfig.cli.json (CLI):**
```json
{
  "include": ["src/cli/**/*"]  // ← Only CLI included
}
```

**Result:** SDK and CLI are type-checked independently

### 3. Build Process is Separate

**tsup.config.ts:**
```typescript
// SDK Build
{
  entry: ['src/index.ts'],
  external: ['react', 'svelte', 'vue'],  // External deps not bundled
  // ... SDK-specific config
}

// CLI Build
{
  entry: ['src/cli/cli.ts'],
  noExternal: [/.*/],  // ← ALL deps bundled (including Commander.js)
  bundle: true,
  treeshake: true,
  tsconfig: './tsconfig.cli.json',  // ← Uses separate tsconfig
  // ... CLI-specific config
}
```

**Result:**
- SDK: Tree-shakeable, works in any environment (Cloudflare Workers, Vercel Edge, etc.)
- CLI: Self-contained bundle with all dependencies

### 4. Tests are Separate

**SDK Tests:**
```javascript
// vitest.node.config.js & vitest.edge.config.js
{
  exclude: ['src/cli/**']  // ← CLI excluded
}
```

**CLI Tests:**
```javascript
// vitest.cli.config.js
{
  include: ['src/cli/**/*.test.ts'],  // ← Only CLI
  typecheck: {
    tsconfig: './tsconfig.cli.json'
  }
}
```

## Adding CLI Packages - Automatic Isolation

### Question: If I add a CLI package, will it affect the SDK?

**Answer: NO! It's completely automatic.**

### Example

1. **Install any CLI package:**
```bash
pnpm add chalk ora inquirer
```

2. **Use in CLI code:**
```typescript
// src/cli/commands/deploy.ts
import chalk from 'chalk';
import ora from 'ora';

export function deployCommand(program: Command) {
  program.command('deploy')
    .action(() => {
      const spinner = ora('Deploying...').start();
      console.log(chalk.green('Success!'));
    });
}
```

3. **Build:**
```bash
pnpm build
```

### What Happens Automatically:

✅ **CLI bundle:** Includes chalk, ora, inquirer (bundled via `noExternal: [/.*/]`)
✅ **SDK bundle:** Remains CLEAN - never sees chalk, ora, inquirer
✅ **Tree-shaking:** Removes unused code from CLI bundle
✅ **SDK users:** Never see CLI deps in their `node_modules`

### Why It Works:

The `noExternal: [/.*/]` config tells tsup to bundle **EVERYTHING** that the CLI imports:

```typescript
// tsup.config.ts - CLI build
{
  noExternal: [/.*/],  // ← Bundles ALL packages
  bundle: true,         // ← Single bundle file
  treeshake: true,      // ← Removes unused code
}
```

## Verification Checklist

Use these commands to verify separation:

```bash
# ✓ Type check SDK (should pass)
pnpm type-check:sdk

# ✓ Type check CLI (should pass)
pnpm type-check:cli

# ✓ Build everything
pnpm build

# ✓ Verify SDK has no CLI code
grep -i "commander" dist/index.js dist/index.mjs
# Should output: (nothing)

# ✓ Verify CLI has Commander bundled
grep "commander" dist/cli/cli.js | head -1
# Should output: Commander.js code

# ✓ Test CLI works
node dist/cli/cli.js -v
lb -v  # (after pnpm install/link)

# ✓ Verify file structure
ls -lh dist/
# Should show: index.js, index.mjs, cli/cli.js
```

## Summary

**Same package name:** `langbase`

**Usage:**
```bash
# As SDK (import)
import { Pipe } from 'langbase';  // No CLI code

# As CLI (command)
langbase --version  # CLI with all deps bundled
lb --version        # Short alias
```

**Guaranteed Isolation:**
- ✅ Different entry points (package.json: main vs bin)
- ✅ Different source directories (src/ vs src/cli/)
- ✅ Different TypeScript configs (tsconfig.json vs tsconfig.cli.json)
- ✅ Different build configs (external deps vs bundled deps)
- ✅ Different test configs (exclude cli vs include cli)
- ✅ Automatic bundling of ALL CLI deps (noExternal: [/.*/])

**Result:** SDK and CLI are completely independent. Add any CLI packages without worrying about SDK impact!
