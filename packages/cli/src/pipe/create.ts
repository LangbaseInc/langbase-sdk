import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { pipeNameSchema, PipeStatus } from '../../types/pipe';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';


export async function createPipe() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'PIPE AGENT', sub: 'Create a new pipe agent' }));
	await p.group(
		{
			name: () =>
				p.text({
					message: 'Name of the pipe agent',
					placeholder: 'cli-pipe-agent',
					validate: value => {
						const result = pipeNameSchema.safeParse(value);
						if (!result.success) {
							return result.error.issues[0].message;
						}
						return;
					}
				}),
			description: () =>
				p.text({
					message: 'Description of the pipe',
					placeholder: 'This is a CLI pipe agent'
				}),
			status: () =>
				p.select({
					message: 'Status of the pipe',
					options: [
						{ value: 'public', label: 'Public' },
						{ value: 'private', label: 'Private' }
					]
				}) as Promise<PipeStatus>,
			systemPrompt: () =>
				p.text({
					message: 'System prompt',
					placeholder: 'You are a helpful AI assistant.',
					initialValue: 'You are a helpful AI assistant.'
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			}
		}
	).then(async ({ name, description, systemPrompt, status }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Pipe is being created...');

		const pipe = await langbase.pipes.create({
			name,
			status,
			description,
			messages: [
				{
					role: 'system',
					content: systemPrompt
				}
			]
		});

		spinner.stop('Pipe created successfully!');
		p.outro(heading({ text: 'PIPE', sub: `${pipe.name} created successfully` }));
	});
}
