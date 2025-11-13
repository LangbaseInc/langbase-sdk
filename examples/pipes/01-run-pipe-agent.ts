import 'dotenv/config';
import { Langbase } from '../../packages/langbase/src';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createSummaryAgent();

	const response = await langbase.pipes.run({
		stream: false,
		name: 'summary-agent',
		messages: [
			{
				role: 'user',
				content: 'Who is an AI Engineer?',
			},
		],
	});

	console.log('response: ', response.completion);
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
