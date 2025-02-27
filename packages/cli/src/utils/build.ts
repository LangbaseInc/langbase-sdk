import fs from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';
import { getWorkerTemplaleCode } from '@/data';
import { Spinner } from 'types';
import * as p from '@clack/prompts';

export async function buildCode({
	spinner,
	filePath
}: {
	filePath: string;
	spinner: Spinner;
}) {
	spinner.start('Building code...');
	const cwd = process.cwd();
	const srcPath = path.join(cwd, filePath);
	const distPath = path.join(cwd, 'dist');
	const isTypescript = filePath.endsWith('.ts');
	const workerTemplateFileName = isTypescript ? 'langbase.ts' : 'langbase.js';

	try {
		await fs.access(distPath);
	} catch (error) {
		// Create the build directory if it doesn't exist
		await fs.mkdir(distPath, { recursive: true });
	}

	try {
		const code = getWorkerTemplaleCode(srcPath);
		const workerTemplatePath = path.join(distPath, workerTemplateFileName);

		await fs.writeFile(workerTemplatePath, code);

		await esbuild.build({
			entryPoints: [workerTemplatePath],
			bundle: true, // Bundle all dependencies into a single file
			outfile: 'dist/langbase.build.js', // Output file
			platform: 'browser', // Target platform (browser-like environment)
			target: 'es2020', // Target ES version (Cloudflare Workers supports modern JS)
			format: 'esm', // Use ES modules format (recommended for CF Workers)
			minify: true, // Minify the output (optional)
			sourcemap: false // Generate source maps (optional)
		});

		spinner.stop('Code built successfully');

		return { distPath };
	} catch (error) {
		spinner.stop('Failed to build code');
		p.cancel(`Error building code: ${error}`);
		process.exit(1);
	}
}
