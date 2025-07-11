# Ecosystem Tests

This folder contains minimal tests for the Langbase SDK across different JavaScript runtimes and environments.

## How to Test Each Ecosystem

### Node.js (ESM)
1. `cd node-esm`
2. `npm install`
3. `node index.mjs`

### Node.js (CJS)
1. `cd node-cjs`
2. `npm install`
3. `node index.cjs`

### Bun
1. `cd bun`
2. `bun install`
3. `bun run index.ts`

### Deno
1. `cd deno`
2. Make sure you have Deno installed: https://deno.com/manual/getting_started/installation
3. Run: `deno run --allow-net index.ts`
   - If you see type errors in your editor, see comments at the top of `index.ts`.

### Cloudflare Worker
1. `cd cf-worker`
2. `npm install`
3. Deploy or run locally using a tool like [`wrangler`](https://developers.cloudflare.com/workers/wrangler/):
   - `wrangler dev index.ts`

---

- Make sure to set your `LANGBASE_API_KEY` (or replace `'YOUR_API_KEY'` in the code) for tests that require authentication.
- Each subfolder contains a `README.md` with more specific instructions if needed.
