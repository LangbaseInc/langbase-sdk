import 'dotenv/config';
import {Langbase} from 'langbase';
import {v4 as uuid} from 'uuid';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const threadId = uuid();
	console.log('Thread id:', threadId);

	const threadMessages = await langbase.thread.messages.add({
		threadId,
		messages: [
			{
				role: 'user',
				content: 'Hi, how are you?',
			},
		],
	});

	console.log('Thread messages:', threadMessages);
}

main();
