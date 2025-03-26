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
				filters: ["And", [
					["company", "Eq", "Langbase"],
					["Or", [
						["category", "Eq", "docs"],
						["category", "Eq", "examples"]
					]],
					["primative", "In", ["Chunk", "Threads"]]
				]]
			}
		],
		query: "What are primitives in Langbase?",
		topK: 5
	});

	console.log(response);
}

main();
