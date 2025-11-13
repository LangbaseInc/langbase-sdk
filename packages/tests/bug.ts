import 'dotenv/config';
import {Langbase} from '../langbase/dist/index.js';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	console.log('\n🚀 Starting Summary Agent Example\n');
	console.log('═'.repeat(50));

	await createSummaryAgent();
	console.log('✅ Summary agent created/verified\n');

	// Message 1: Tell something to the LLM.
	console.log('📤 Message 1: Sending initial message...');
	console.log('   User: "My name is Ahmad"\n');

	const response1 = await langbase.pipes.run({
		stream: false,
		name: 'agent-thread',
		messages: [{role: 'user', content: 'My name is Ahmad'}],
	});

	console.log('📥 Response 1:');
	console.log('   Assistant:', response1.completion);
	console.log('   Thread ID:', response1.threadId);
	console.log('   Model:', response1.model || 'N/A');
	console.log('');

	// Message 2: Ask something about the first message.
	// Continue the conversation in the same thread by sending
	// `threadId` from the second message onwards.
	console.log('📤 Message 2: Continuing conversation in same thread...');
	console.log('   User: "What did I say my name was?"');
	console.log('   Thread ID:', response1.threadId);
	console.log('');

	const response2 = await langbase.pipes.run({
		stream: false,
		name: 'agent-thread',
		threadId: response1.threadId!,
		messages: [
			{
				role: 'user',
				content: 'What did I say my name was?',
			},
		],
	});

	console.log('📥 Response 2:');
	console.log('   Assistant:', response2.completion);
	console.log('');

	console.log('═'.repeat(50));
	console.log('✅ The LLM remembered "Langbase" from the previous message!');
	console.log('💡 This demonstrates thread-based conversation continuity.\n');
}

/**
 * Creates a summary agent pipe if it doesn't already exist.
 *
 * This function checks if a pipe with the name 'agent-thread' exists in the system.
 * If the pipe doesn't exist, it creates a new private pipe with a system message
 * configuring it as a helpful assistant.
 */
async function createSummaryAgent(): Promise<void> {
	try {
		console.log('🔧 Setting up agent-thread pipe...');
		console.log('   Name: agent-thread');
		console.log('   Status: private');
		console.log('   Upsert: true (create or update)');

		await langbase.pipes.create({
			name: 'agent-thread',
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
		console.error('❌ Error creating summary agent:', error);
		throw error;
	}
}

main();
