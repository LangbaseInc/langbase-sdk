import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';


export async function listMemories() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'MEMORY', sub: 'List all memories' }));

	try {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Listing all the memories...');

		const response = await langbase.memories.list();

		spinner.stop('Listed all the memories successfully!');
		
		if (response.length === 0) {
			console.log('No memories found.');
		} else {
			p.outro(heading({ text: 'List of memories', sub:  `${response.map((memory) => memory.name).join(", ")}` }));
		}
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
		p.cancel(`Error listing memories: ${errorMessage}`);
		process.exit(1);
	}
}
