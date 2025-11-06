import {defineConfig} from 'tsup';

export default defineConfig([
	// Universal APIs
	{
		entry: ['src/index.ts'],
		outDir: 'dist',
		format: ['cjs', 'esm'],
		external: ['react', 'svelte', 'vue'],
		dts: true,
		clean: true,
		sourcemap: true,
	},
	// React APIs
	{
		entry: ['src/react/index.ts'],
		outDir: 'react/dist',
		banner: {
			js: "'use client'",
		},
		format: ['cjs', 'esm'],
		external: ['react', 'svelte', 'vue', 'solid-js'],
		dts: {
			entry: 'src/react/index.ts',
		},
		clean: true,
		sourcemap: true,
	},
	// CLI - completely separate build with bundled dependencies
	{
		entry: ['src/cli.ts'],
		outDir: 'dist/cli',
		format: ['cjs'],
		bundle: true,
		minify: false,
		sourcemap: false,
		noExternal: [/.*/],
		external: ['dotenv', 'openai', 'zod', 'zod-validation-error'],
		platform: 'node',
		target: 'node18',
		clean: false,
		dts: false,
		shims: true,
		esbuildOptions(options) {
			options.banner = {
				js: '#!/usr/bin/env node',
			};
		},
	},
]);
