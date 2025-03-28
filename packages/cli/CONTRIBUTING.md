# Contributing

We welcome contributions to this project.

---

## Releasing a snapshot version

To release a snapshot version to test changes, run the following command:

```bash
npx run snapshot
```

## Releasing a new version

```bash
pnpm changeset
pnpm version-packages
grlz 'new version'
pnpm release
pnpm update-examples
```

## Testing locally

To test the changes locally, you can run the following command:

- Navigate to an example's folder like the Node.js one in `examples/nodejs`.

- Change the `package.json` to point to the local package for `@langbase/cli` package.

```json
{
  "devDependencies": {
    "@langbase/cli": "workspace:*"
  },
}
```

- Now run in the root:

```bash
pnpm clean-all && pnpm install
```

Then run the development server:

```bash
pnpm dev
```

- Run the Node.js example:

```bash
# 1. Authenticate first
npx lb auth

# 2. Deploy the agent
npx lb deploy --agent owner/agentName --file ./src/index.ts
```

By doing this, the Node.js example will use the local packages instead of the published ones.
