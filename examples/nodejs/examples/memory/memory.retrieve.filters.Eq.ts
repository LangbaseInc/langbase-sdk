import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.memories.retrieve({
		memory: [
		{
			name: "langbase-docs",
			filters: ["company", "Eq", "Langbase"],
		},
		],
		query: "What is Langbase?",
		topK: 5
	});

	console.log(response);
}

main();
