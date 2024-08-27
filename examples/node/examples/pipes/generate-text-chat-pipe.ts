/**
 * Generates a text completion using `generateText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/generate-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

(async () => {
	console.log('\n============= CHAT PIPE =============');

	//  Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_CHAT_PIPE!,
	});

	// Message 1: Tell the AI about something.
	const userMsg1 = 'My company is ⌘ Langbase.';
	let {completion, threadId} = await myPipe.generateText({
		messages: [{role: 'user', content: userMsg1}],
		chat: true,
	});
	console.log(`User: `, userMsg1);
	console.log(`AI: `, completion);

	// Message 2: Ask the AI about what you told in previous message.
	const userMsg2 = 'What is the name of my company?';
	const {completion: completion2} = await myPipe.generateText({
		messages: [{role: 'user', content: userMsg2}],
		threadId,
		chat: true,
	});
	console.log(`User: `, userMsg2);
	console.log(`AI: `, completion2);
})();
