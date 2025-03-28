// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.
import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.threads.update({
		threadId: 'REPLACE_WITH_THREAD_ID',
		metadata: {
			company: 'langbase',
			about: 'Langbase is the most powerful serverless platform for building AI agents with memory.',
		},
	});

	console.log(response);
}

main();
