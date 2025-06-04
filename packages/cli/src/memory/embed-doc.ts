import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { fromZodError } from 'zod-validation-error';
import { memoryNameSchema } from 'types/memory';

export async function embedDoc() {
	const apiKey = await getApiKey();

	p.intro(heading({ text: 'MEMORY', sub: 'Retry embedding a document' }));
	await p
		.group(
			{
				name: () =>
					p.text({
						message: 'Name of the memory',
						placeholder: 'cli-memory',
						validate: value => {
							const validatedName =
								memoryNameSchema.safeParse(value);
							if (!validatedName.success) {
								const validationError = fromZodError(
									validatedName.error
								).toString();
								return validationError;
							}
							return;
						}
					}),
				documentName: () =>
					p.text({
						message: 'Name of the document',
						placeholder: 'cli-document'
					})
			},
			{
				onCancel: () => {
					p.cancel('Operation cancelled.');
					process.exit(0);
				}
			}
		)
		.then(async ({ name, documentName }) => {
			const langbase = new Langbase({
				apiKey: apiKey
			});

			const spinner = p.spinner();
			spinner.start('Document is being embedded...');

			const response = await langbase.memories.documents.embeddings.retry(
				{
					memoryName: name,
					documentName: documentName
				}
			);

			spinner.stop('Document embedded successfully!');
			console.log(response);
		});
}
