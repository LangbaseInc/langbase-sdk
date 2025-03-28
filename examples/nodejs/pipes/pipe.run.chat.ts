import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	// Message 1: Tell something to the LLM.
	const response1 = await langbase.pipes.run({
		stream: false,
		name: 'summary',
		messages: [{role: 'user', content: 'My company is called Langbase'}],
	});

	console.log(response1.completion);

	// Message 2: Ask something about the first message.
	// Continue the conversation in the same thread by sending
	// `threadId` from the second message onwards.
	const response2 = await langbase.pipes.run({
		name: 'summary',
		stream: false,
		threadId: response1.threadId!,
		messages: [{role: 'user', content: 'Tell me the name of my company?'}],
	});

	console.log(response2.completion);
	// You'll see any LLM will know the company is `Langbase`
	// since it's the same chat thread. This is how you can
	// continue a conversation in the same thread.
}

main();
