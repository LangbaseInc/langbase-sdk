import 'dotenv/config';
import {Memory} from 'langbase';

const memory = new Memory({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await memory.retrieve({
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
