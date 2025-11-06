# Langbase CLI

This folder contains the Langbase CLI implementation, completely separated from the SDK to ensure zero impact on SDK users.

**Commands:** `langbase` or `lb` (alias)

## Architecture

The CLI is built with complete isolation from the SDK:

### 1. Separate TypeScript Configuration
- **SDK**: Uses `tsconfig.json` (excludes `src/cli`)
- **CLI**: Uses `tsconfig.cli.json` (includes only `src/cli/**`)

### 2. Separate Testing
- **SDK Tests**: `vitest.node.config.js` and `vitest.edge.config.js` (exclude `src/cli/**`)
- **CLI Tests**: `vitest.cli.config.js` (includes only `src/cli/**`)

### 3. Separate Build Process
- **SDK**: Built as ESM/CJS with external dependencies
- **CLI**: Built with ALL dependencies bundled (`noExternal: [/.*/]`)
  - This ensures SDK users never see CLI dependencies in `node_modules`
  - Bundle size: ~43KB (minified with treeshaking)

## Adding New CLI Packages

When you need to add packages for CLI development:

### Step 1: Install the Package
```bash
pnpm add <package-name>
```

### Step 2: Understanding Automatic Separation

**The package will automatically be bundled into the CLI** due to the tsup configuration:

```typescript
// tsup.config.ts - CLI build config
{
  entry: ['src/cli/cli.ts'],
  noExternal: [/.*/],  // ← This bundles EVERYTHING
  bundle: true,
  treeshake: true,
}
```

**Key Points:**
- ✅ ALL packages imported in `src/cli/**` are bundled into `dist/cli/cli.js`
- ✅ SDK imports NEVER include CLI code (separate entry points)
- ✅ Tree-shaking removes unused code automatically
- ✅ SDK remains clean and works in any environment (Cloudflare Workers, edge, etc.)

### Step 3: Import and Use
Just import normally in your CLI code:

```typescript
// src/cli/commands/example.ts
import {somePackage} from 'new-package';

export function exampleCommand(program: Command) {
  program
    .command('example')
    .action(() => {
      somePackage.doSomething();
    });
}
```

## Available Scripts

```bash
# Build everything (SDK + CLI)
pnpm build

# Build only CLI
pnpm build:cli

# Type check everything
pnpm type-check

# Type check SDK only
pnpm type-check:sdk

# Type check CLI only
pnpm type-check:cli

# Test everything
pnpm test

# Test SDK only
pnpm test:sdk

# Test CLI only
pnpm test:cli

# Watch mode
pnpm test:cli:watch
```

## Structure

```
src/cli/
├── cli.ts              # Main CLI entry point
├── commands/           # Command implementations
│   └── help.ts        # Example command
└── README.md          # This file
```

## Adding New Commands

1. Create a new file in `src/cli/commands/`:

```typescript
// src/cli/commands/my-command.ts
import {Command} from 'commander';

export function myCommand(program: Command) {
  program
    .command('my-command')
    .description('description of my command')
    .option('-f, --flag', 'optional flag')
    .action((options) => {
      console.log('Executing my command', options);
    });
}
```

2. Register it in `src/cli/cli.ts`:

```typescript
import {myCommand} from './commands/my-command';

// Inside main()
myCommand(program);
```

3. Build and test:

```bash
pnpm build
node dist/cli/cli.js my-command --flag
# Or after install: langbase my-command --flag
# Or using alias: lb my-command --flag
```

## Verification

To verify the separation works:

```bash
# Check SDK bundle has no CLI dependencies
grep -r "commander" dist/index.*
# Should return nothing

# Check CLI bundle includes commander
grep "commander" dist/cli/cli.js
# Should find commander code bundled
```

## Important Notes

- **Never** import CLI code in SDK files (`src/index.ts`, `src/pipes/`, etc.)
- **Always** keep CLI code in `src/cli/` directory
- **All** CLI dependencies are automatically bundled - no manual configuration needed
- The `tsconfig.json` excludes `src/cli` to prevent accidental SDK imports
