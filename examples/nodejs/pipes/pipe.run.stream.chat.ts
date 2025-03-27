import 'dotenv/config';
import {Langbase, getRunner} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

// Message 1: Tell something to the LLM.
const response1 = await langbase.pipes.run({
	name: 'summary',
	stream: true,
	messages: [{role: 'user', content: 'My company is called Langbase'}],
});

const runner1 = getRunner(response1.stream);

runner1.on('content', content => {
	process.stdout.write(content);
});

// Message 2: Ask something about the first message.
// Continue the conversation in the same thread by sending
// `threadId` from the second message onwards.
const response2 = await langbase.pipes.run({
	name: 'summary',
	stream: true,
	threadId: response1.threadId!,
	messages: [{role: 'user', content: 'Tell me the name of my company?'}],
});

const runner2 = getRunner(response2.stream);

runner2.on('content', content => {
	process.stdout.write(content);
});
