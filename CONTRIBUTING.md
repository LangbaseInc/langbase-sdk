# Contributing

We welcome contributions to this project.

---

## Releasing a snapshot version

To release a snapshot version to test changes, run the following command:

```bash
npm run snapshot
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

- Navigate to an example's folder like the Next.js one in `examples/nextjs`.

- Change the `package.json` to point to the local package for `langbase`.

```json
{
  "dependencies": {
    "langbase": "workspace:*"
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

By doing this, the Next.js example will use the local packages instead of the published ones.
