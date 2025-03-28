// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.
import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.threads.messages.list({
		threadId: 'REPLACE_WITH_THREAD_ID',
	});

	console.log(response);
}

main();
