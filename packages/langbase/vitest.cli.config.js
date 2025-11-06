import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['src/cli/**/*.test.ts{,x}'],
		exclude: [
			'**/node_modules/**',
		],
		typecheck: {
			enabled: true,
			tsconfig: './tsconfig.cli.json',
		},
	},
});
