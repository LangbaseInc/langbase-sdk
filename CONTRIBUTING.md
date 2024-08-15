# Contributing

We welcome contributions to this project.

## Releasing a new version

```bash
# Bug, have to remove example pkg json changes.
pnpm changeset && pnpm version-packages && grlz 'new version'
pnpm release
```
