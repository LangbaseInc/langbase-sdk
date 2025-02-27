import fs from 'fs/promises';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { findEnvFile } from './find-env';
import { cyan } from './formatting';

export interface Account {
	apiKey: string;
}

type Spinner = ReturnType<typeof p.spinner>;

function handleNoAccountFound({ spinner }: { spinner: Spinner }): void {
	spinner.stop('No account found');
	p.outro(
		`Skipping deployment. \n Run: ${cyan('npx lb auth')} to authenticate.`
	);
}

export async function retrieveAuthentication({
	spinner
}: {
	spinner: Spinner;
}): Promise<string> {
	spinner.start('Retrieving stored authentication');
	try {
		let envFile = await findEnvFile();
		if (!envFile) {
			handleNoAccountFound({ spinner });
			process.exit(1);
		}

		envFile = `${process.cwd()}/${envFile}`;

		const envFileContent = await fs.readFile(envFile, 'utf-8');

		const apiKey = envFileContent
			.split('\n')
			.reverse()
			.find(line => line.includes('LANGBASE_API_KEY='))
			?.split('=')[1];

		if (!apiKey) {
			handleNoAccountFound({ spinner });
			process.exit(1);
		}

		spinner.stop('Retrieved stored authentication');

		return apiKey;
	} catch (error) {
		spinner.stop('Failed to retrieve authentication');
		p.log.error(
			`Error retrieving stored auth: ${(error as Error).message}`
		);
		p.outro(
			`Skipping deployment. \n Run: ${cyan('npx lb auth')} to authenticate.`
		);
		process.exit(1);
	}
}
