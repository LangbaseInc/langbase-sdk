import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { fromZodError } from 'zod-validation-error';
import { memoryNameSchema } from 'types/memory';


export async function listDocs() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'MEMORY', sub: 'List all documents in a memory' }));
	await p.group(
		{
			name: () =>
				p.text({
					message: 'Name of the memory',
					placeholder: 'cli-memory',
					validate: value => {
						const validatedName = memoryNameSchema.safeParse(value);
						if (!validatedName.success) {
							const validationError = fromZodError(
								validatedName.error
							).toString();
							return validationError;
						}
						return;
					}
				})
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			}
		}
	).then(async ({ name }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Listing all the documents...');

		const response = await langbase.memories.documents.list({memoryName: name});

		spinner.stop('Documents listed successfully!');
		p.outro(heading({ text: `List of documents in ${name} memory`, sub: `${response.map((doc) => doc.name).join(", ")}` }));
	});
}
