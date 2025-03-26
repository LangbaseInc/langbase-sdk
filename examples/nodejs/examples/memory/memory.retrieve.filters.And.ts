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
			filters:["And", [
                ["company", "Eq", "Langbase"],
                ["category", "Eq", "docs"]
            ]]
		},
		],
		query: "What are pipes in Langbase Docs?",
		topK: 5
	});

	console.log(response);
}

main();
