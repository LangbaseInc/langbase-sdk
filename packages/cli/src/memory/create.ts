import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase, EmbeddingModels } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { memoryNameSchema } from 'types/memory';
import { fromZodError } from 'zod-validation-error';    

export async function createMemory() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'MEMORY', sub: 'Create a new memory' }));
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
				}),
			description: () =>
				p.text({
					message: 'Description of the memory',
					placeholder: 'This is a CLI memory'
				}),
            model: () =>
                p.select({
                    message: 'Embedding Model',
                    options: [
                        { value: 'openai:text-embedding-3-large', label: 'OpenAI Text Embedding 3 Large' },
                        { value: 'cohere:embed-multilingual-v3.0', label: 'Cohere Embed Multilingual v3.0' },
                        { value: 'cohere:embed-multilingual-light-v3.0', label: 'Cohere Embed Multilingual Light v3.0' },
                        { value: 'google:text-embedding-004', label: 'Google Text Embedding 004' }
                    ]
                }) as Promise<string>,
			topK: () =>
				p.text({
					message: 'Top K',
					placeholder: '10',
					validate: value => {
						if (Number(value) < 1 || Number(value) > 100) {
							return 'Top K must be between 1 and 100';
						}
						return;
					}
				}),
			chunkSize: () =>
				p.text({
					message: 'Chunk size',
					placeholder: '10000',
					validate: value => {
						if (Number(value) < 1024 || Number(value) > 300000) {
							return 'Chunk size must be between 1024 and 300000';
						}
						return;
					}
				}),
			chunkOverlap: () =>
				p.text({
					message: 'Chunk overlap',
					placeholder: '1000',
					validate: value => {
						if (Number(value) < 100 || Number(value) > 1000) {
							return 'Chunk overlap must be between 100 and 1000';
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
	).then(async ({ name, description, model, topK, chunkSize, chunkOverlap }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Memory is being created...');

		const memory = await langbase.memories.create({
			name,
			description,
			top_k: Number(topK),
			chunk_size: Number(chunkSize),
			chunk_overlap: Number(chunkOverlap),
            embedding_model: model as EmbeddingModels,
		});

		spinner.stop('Memory created successfully!');
		p.outro(heading({ text: 'MEMORY', sub: `${memory.name} created successfully` }));
	});
}
