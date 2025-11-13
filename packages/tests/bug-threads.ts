import 'dotenv/config';
import {Langbase, getRunner} from '../langbase/dist/index.js';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createSummaryAgent();

	// Message 1: Tell something to the LLM.
	const response1 = await langbase.pipes.run({
		stream: true,
		name: 'agent-thread-check',
		messages: [
			{
				role: 'user',
				content: 'My company is called Langbase',
			},
		],
	});

	const runner = await getRunner(response1.stream);
	for await (const chunk of runner) {
		if (chunk.choices[0]?.delta?.content) {
			process.stdout.write(chunk.choices[0].delta.content);
		}
	}
	console.log('\n');

	const threadId = response1.threadId;

	// Message 2: Ask something about the first message.
	// Continue the conversation in the same thread by sending
	// `threadId` and all previous messages from the second message onwards.
	const response2 = await langbase.pipes.run({
		stream: true,
		name: 'agent-thread-check',
		threadId: threadId!,
		messages: [
			{
				role: 'user',
				content: 'My company is called Langbase',
			},
			{
				role: 'user',
				content: 'Tell me the name of my company?',
			},
		],
	});

	const runner2 = await getRunner(response2.stream);
	for await (const chunk of runner2) {
		if (chunk.choices[0]?.delta?.content) {
			process.stdout.write(chunk.choices[0].delta.content);
		}
	}
	console.log('\n');
}

/**
 * Creates a summary agent pipe if it doesn't already exist.
 *
 * This function checks if a pipe with the name 'agent-thread-check' exists in the system.
 * If the pipe doesn't exist, it creates a new private pipe with a system message
 * configuring it as a helpful assistant.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 * @throws {Error} Logs any errors encountered during the creation process
 */
async function createSummaryAgent() {
	try {
		await langbase.pipes.create({
			name: 'agent-thread-check',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content: 'You are a helpful assistant.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating summary agent:', error);
	}
}

main();
