import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.threads.append({
		threadId: 'REPLACE_WITH_THREAD_ID',
		messages: [
			{
				role: 'assistant',
				content: 'Nice to meet you',
				metadata: {size: 'small'},
			},
		],
	});

	console.log(response);
}

main();
