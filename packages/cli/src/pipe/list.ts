import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';

export async function listPipes() {
	const apiKey = await getApiKey();

	p.intro(heading({ text: 'PIPE AGENT', sub: 'List all pipe agents' }));

	try {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Listing all the pipe agents...');

		const response = await langbase.pipes.list();

		spinner.stop('Listed all the pipe agents successfully!');

		if (response.length === 0) {
			console.log('No pipe agents found.');
		} else {
			p.outro(
				heading({
					text: 'List of pipe agents',
					sub: `${response.map(pipe => pipe.name).join(', ')}`
				})
			);
		}
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : 'Unknown error occurred';
		p.cancel(`Error listing pipe agents: ${errorMessage}`);
		process.exit(1);
	}
}
