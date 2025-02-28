import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.memories.retrieve({
		memory: [
			{
				name: 'langbase-docs',
			},
		],
		query: 'What are pipes in Langbase?',
		topK: 2,
	});

	console.log(response);
}

main();
