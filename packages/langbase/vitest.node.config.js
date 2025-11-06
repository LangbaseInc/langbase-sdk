import {defineConfig} from 'vite';
import path from 'path';
import {config} from 'dotenv';

// Load environment variables from .env file
config({path: path.resolve(__dirname, '../../.env')});

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'node',
		globals: true,
		include: ['**/*.test.ts{,x}'],
		exclude: [
			'**/*.ui.test.ts{,x}',
			'**/*.e2e.test.ts{,x}',
			'**/node_modules/**',
			'src/cli/**',
		],
		typecheck: {
			enabled: true,
		},
		env: process.env,
	},
});
