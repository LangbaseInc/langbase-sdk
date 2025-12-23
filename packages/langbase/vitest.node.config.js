import {defineConfig} from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['**/*.test.ts{,x}'],
		exclude: [
			'**/*.ui.test.ts{,x}',
			'**/*.e2e.test.ts{,x}',
			'**/node_modules/**',
		],
		typecheck: {
			enabled: true,
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
