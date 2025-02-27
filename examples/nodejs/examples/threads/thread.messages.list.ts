import 'dotenv/config';
import {Langbase} from 'langbase';
import {v4 as uuid} from 'uuid';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	// get thread id here
	// we use a random id for now
	const threadId = uuid();
	console.log('Thread id:', threadId);

	const threadMessages = await langbase.thread.messages.list({
		threadId,
	});

	console.log('Thread messages:', threadMessages);
}

main();
