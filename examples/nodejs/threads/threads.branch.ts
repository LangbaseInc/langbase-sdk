import dotenv from 'dotenv';
import {Langbase, ThreadMessage} from 'langbase';

dotenv.config();

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

// Helper to create initial conversation
async function createConversation() {
	const thread = await langbase.threads.create({
		messages: [
			{
				role: 'user',
				content: 'I need to add state management to my React app',
			},
			{
				role: 'assistant',
				content:
					'I can help you with state management in React. How complex is your app \
					and what are your main requirements?',
			},
			{
				role: 'user',
				content:
					"It's a medium-sized app with user data, API calls, and real-time updates",
			},
			{
				role: 'assistant',
				content:
					'For your needs, you could use Redux for its mature ecosystem, or Zustand \
					for a simpler, more modern approach. Which direction interests you?',
			},
		],
	});

	return thread.id;
}

// Branch thread at decision point
async function branchThread(threadId: string, branchAt: number) {
	// Get all messages
	const messages = await langbase.threads.messages.list({threadId});

	// Take messages up to branch point
	const messagesToKeep = messages.slice(0, branchAt);

	// Create new thread with selected messages
	const branch = await langbase.threads.create({
		messages: messagesToKeep as ThreadMessage[],
		metadata: {
			parent: threadId,
			branchedAt: branchAt.toString(),
		},
	});

	return branch.id;
}

async function main() {
	// Create original conversation
	const originalId = await createConversation();

	// Branch at decision point (after state management options presented)
	const branchId = await branchThread(originalId, 4);

	// Continue original thread with Redux
	await langbase.threads.append({
		threadId: originalId,
		messages: [
			{role: 'user', content: "Let's go with Redux"},
			{
				role: 'assistant',
				content:
					'Great choice for a robust solution! Redux with Redux Toolkit makes it \
					much easier. Let me show you the setup...',
			},
		],
	});

	// Branch explores Zustand
	await langbase.threads.append({
		threadId: branchId,
		messages: [
			{role: 'user', content: 'Tell me about Zustand'},
			{
				role: 'assistant',
				content:
					"Zustand is lightweight and simple! It's only 2KB and doesn't need \
					providers. Here's how to get started...",
			},
		],
	});

	console.log('\nOriginal thread:', originalId);
	console.log(
		'Original thread messages:',
		await langbase.threads.messages.list({threadId: originalId}),
	);
	console.log('Branched thread:', branchId);
	console.log(
		'Branched thread messages:',
		await langbase.threads.messages.list({threadId: branchId}),
	);
}

main();
