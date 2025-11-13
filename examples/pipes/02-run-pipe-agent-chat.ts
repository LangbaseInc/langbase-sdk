import 'dotenv/config';
import { Langbase } from '../../packages/langbase/src';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createSummaryAgent();

	// First message - creates new thread
	const response1 = await langbase.pipes.run({
		stream: false,
		name: 'summary-agent',
		messages: [{ role: 'user', content: 'My company is called Langbase' }],
	});

	console.log('First response:', response1.completion);
	console.log('Thread ID:', response1.threadId);

	// Second message - continues same thread
	const response2 = await langbase.pipes.run({
		stream: false,
		name: 'summary-agent',
		threadId: response1.threadId!,
		messages: [{ role: 'user', content: 'Tell me the name of my company?' }],
	});

	console.log('\nSecond response:', response2.completion);
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
						'You are a helpful assistant that helps users summarize text.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating summary agent:', error);
	}
}

main();
