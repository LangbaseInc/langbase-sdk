import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { fromZodError } from 'zod-validation-error';
import { memoryNameSchema } from 'types/memory';

export async function deleteMemory() {
	const apiKey = await getApiKey();

	p.intro(heading({ text: 'MEMORY', sub: 'Delete a memory' }));
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
					})
			},
			{
				onCancel: () => {
					p.cancel('Operation cancelled.');
					process.exit(0);
				}
			}
		)
		.then(async ({ name }) => {
			const langbase = new Langbase({
				apiKey: apiKey
			});

			const spinner = p.spinner();
			spinner.start('Memory is being deleted...');

			await langbase.memories.delete({ name });

			spinner.stop('Memory deleted successfully!');
			p.outro(
				heading({
					text: 'MEMORY DELETED',
					sub: `${name} deleted successfully`
				})
			);
		});
}
