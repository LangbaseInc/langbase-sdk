import 'dotenv/config';
import { Langbase, getRunner } from '../../packages/langbase/src';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createSummaryAgent();

	const { stream } = await langbase.pipes.run({
		stream: true,
		name: 'summary-agent',
		messages: [
			{
				role: 'user',
				content: 'Who is an AI Engineer?',
			},
		],
	});

	const runner = getRunner(stream);

	runner.on('connect', () => {
		console.log('Stream started.\n');
	});

	runner.on('content', (content) => {
		process.stdout.write(content);
	});

	runner.on('end', () => {
		console.log('\n\nStream ended.');
	});

	runner.on('error', (error) => {
		console.error('Error:', error);
	});
}

async function createSummaryAgent() {
	try {
		await langbase.pipes.create({
			name: 'summary-agent',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that help users summarize text.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating summary agent:', error);
	}
}

main();
