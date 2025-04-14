import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { fromZodError } from 'zod-validation-error';
import { memoryNameSchema } from 'types/memory';


export async function retriveFromMemory() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'MEMORY', sub: 'Retrive chunks from a memory' }));
	await p.group(
		{
            query: () =>
				p.text({
					message: 'Query',
					placeholder: 'What is the capital of France?',
				}),
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
				}),
            topK: () =>
				p.text({
					message: 'Top K',
					placeholder: '5',
                    validate: value => {
                        if (Number(value) < 1 || Number(value) > 100) {
                            return 'Top K must be between 1 and 100';
                        }
                        return;
                    }
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			}
		}
	).then(async ({ name, query, topK }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Memory is being retrived...');

		const response = await langbase.memories.retrieve({
            query: query,
            memory: [{
                name: name,
            }],
            topK: Number(topK)
        });

		spinner.stop('Memory retrived successfully!');
		console.log(response);
	});
}
