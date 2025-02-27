import { buildCode } from '@/utils/build';
import { getBaseUrl } from '@/utils/get-base-url';
import fs from 'fs/promises';
import path from 'path';
import * as p from '@clack/prompts';
import { heading } from '@/utils/heading';
import { retrieveAuthentication } from '@/utils/retrieve-credentials';
import slugify from '@sindresorhus/slugify';
import { z } from 'zod';
import { handleError } from '@/utils/handle-error';
import { Spinner } from 'types';
import { deployOptionsSchema } from '@/utils/schema';

type DeployOptions = {
	isDev: boolean;
	agent: string;
	filePath: string;
	apiKey: string;
};

export async function deploy(options: DeployOptions) {
	const spinner = p.spinner();
	try {
		p.intro(heading({ text: 'DEPLOY', sub: 'Deploying to Langbase' }));

		// 1. Validate options
		const validatedOptions = validateOptions(options);

		// 2. Build code
		const { distPath } = await buildCode({
			spinner,
			filePath: validatedOptions.filePath
		});

		// 3. Deploy code
		await deployCode({ ...validatedOptions, distPath, spinner });
	} catch (error) {
		handleError({
			spinner,
			message: 'An unexpected error occurred',
			error
		});
	}
}

async function deployCode({
	isDev,
	distPath,
	owner,
	agent,
	filePath,
	spinner,
	apiKey: lbApiKey
}: {
	isDev: boolean;
	distPath: string;
	owner: string;
	agent: string;
	filePath: string;
	spinner: Spinner;
	apiKey?: string;
}) {
	try {
		const scriptName = path.basename(filePath).split('.')[0];
		const slugifiedScripptName = slugify(scriptName);

		// 1. Get the deploy API endpoint
		const endpoint = await getDeployApiEndpoint({
			isDev,
			agent,
			owner,
			scriptName: slugifiedScripptName
		});

		// 2. Get the deploy API request options
		const { body, apiKey } = await getDeployApiRequestOptions({
			distPath,
			spinner,
			lbApiKey,
			scriptName: slugifiedScripptName
		});

		console.log('apiKey', apiKey);
		console.log('body', body);

		// 3. Request the deploy API
		await requestDeployApi({
			body,
			apiKey,
			spinner,
			endpoint
		});
	} catch (error) {
		p.cancel(`Error deploying code: ${error}`);
		process.exit(1);
	}
}

function validateOptions(options: DeployOptions) {
	const {
		data: deployOptions,
		success,
		error
	} = deployOptionsSchema.safeParse(options);
	if (!success) {
		const errorMessages = error.errors.map((error: any) => {
			return error.message;
		});

		const errorMessage = errorMessages.join('. ');

		p.cancel(`Invalid options: ${errorMessage}`);
		process.exit(1);
	}

	const [owner, agent] = deployOptions.agent.split('/');

	return {
		owner,
		agent,
		isDev: deployOptions.isDev,
		apiKey: deployOptions.apiKey,
		filePath: deployOptions.filePath
	};
}

async function getDeployApiEndpoint({
	isDev,
	agent,
	owner,
	scriptName
}: {
	isDev: boolean;
	agent: string;
	owner: string;
	scriptName: string;
}) {
	const baseUrl = getBaseUrl(isDev);
	const slugifiedAgent = slugify(agent);
	const slugifiedScriptName = slugify(scriptName);
	return `${baseUrl}/v1/${owner}/${slugifiedAgent}/${slugifiedScriptName}/deploy`;
}

async function getDeployApiRequestOptions({
	spinner,
	distPath,
	scriptName,
	lbApiKey
}: {
	spinner: Spinner;
	distPath: string;
	scriptName: string;
	lbApiKey?: string;
}) {
	// 1. Read the built file
	const buildPath = path.join(distPath, 'langbase.build.js');
	const file = await fs.readFile(buildPath, 'utf-8');

	// 2. Create a FormData object
	const formData = new FormData();

	// 3. Append the script to the FormData object
	formData.append(
		'script',
		new Blob([file], { type: 'application/javascript' }),
		scriptName
	);

	// 4. Get the API key
	let apiKey = lbApiKey;
	if (!apiKey) {
		apiKey = await retrieveAuthentication({ spinner });
	}

	// 4. Return the FormData object
	return { body: formData, apiKey };
}

async function requestDeployApi({
	body,
	apiKey,
	spinner,
	endpoint
}: {
	body: FormData;
	apiKey: string;
	spinner: Spinner;
	endpoint: string;
}) {
	spinner.start('Deploying code...');
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			body,
			headers: {
				Authorization: `Bearer ${apiKey}`
			}
		});

		if (!response.ok) {
			const res = await response.json();
			spinner.stop('Error deploying code');
			p.outro(`Error deploying code: ${res.error.message}`);
			process.exit(1);
		}

		const res = await response.json();
		if (res.success) {
			spinner.stop('Code deployed successfully');
		}
	} catch (error) {
		p.cancel(`Error deploying code: ${error}`);
		process.exit(1);
	}
}
