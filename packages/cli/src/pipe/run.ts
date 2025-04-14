import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { pipeNameSchema } from '../../types/pipe';
import { getRunner, Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';


export async function runPipe() {
	const apiKey = await getApiKey();
	
	p.intro(heading({ text: 'PIPE AGENT', sub: 'Run a pipe agent' }));
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
            stream: () =>
                p.select({
                    message: 'Stream',
                    options: [
                        { value: true, label: 'True' },
                        { value: false, label: 'False' }
                    ]
                }) as Promise<boolean>,
			prompt: () =>
				p.text({
					message: 'Prompt',
					placeholder: 'What is the capital of France?'
				})
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			}
		}
	).then(async ({ name, prompt, stream }) => {
		const langbase = new Langbase({
			apiKey: apiKey
		});

		const spinner = p.spinner();
		spinner.start('Running the pipe agent...');

        if (stream) {
            const { stream: streamResponse } = await langbase.pipes.run({
                name,
                stream,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
		    });
        
            const runner = getRunner(streamResponse);
            runner.on('connect', () => {
                console.log('Stream started.\n');
            });
        
            runner.on('content', content => {
                process.stdout.write(content);
            });

            runner.on('end', () => {
                console.log('\nStream ended.');
            });

            runner.on('error', error => {
                console.error(error);
            });

            spinner.stop('Pipe agent run successfully!');
        } 
        else {
            const response = await langbase.pipes.run({
                name,
                stream,
                messages: [
                    { 
                        role: 'user', 
                        content: prompt 
                    }
                ]
            });

            spinner.stop('Pipe agent run successfully!');
            console.log(response.completion);
        }
        
        
	});
}
