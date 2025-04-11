import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { pipeNameSchema } from '../../types/pipe';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';


export async function updatePipe() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'PIPE AGENT', sub: 'Update a pipe agent' }));
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
			systemPrompt: () =>
				p.text({
					message: 'System prompt',
					placeholder: 'You are a helpful AI assistant.'
				}),
            temperature: () =>
                p.text({
                    message: 'Temperature',
                    placeholder: '0.5'
                })  
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			}
		}
	).then(async ({ name, description, systemPrompt, temperature }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Updating the pipe agent...');

		const pipe = await langbase.pipes.update({
			name,
			description,
			messages: [
				{
					role: 'system',
					content: systemPrompt
				}
			],
            temperature: Number(temperature)
		});

		spinner.stop('Pipe updated successfully!');
		p.outro(heading({ text: 'PIPE', sub: `${pipe.name} updated successfully` }));
	});
}
