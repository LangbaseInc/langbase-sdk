/**
 * Advanced example to demonstrate how to retrieve memories with filters.
 * 
 * - And: This filter is used to retrieve memories that match all the filters.
 * - Or: This filter is used to retrieve memories that match any of the filters.
 * - In: This filter is used to retrieve memories that match any of the value/values in the array.
 * - Eq: This filter is used to retrieve memories that match the exact value.
 * 
 * In this example, we retrieve memories with the following filters:
 * - company: Langbase
 * - category: docs or examples
 * - primitive: Chunk or Threads
 * 
 * We expect to get all chunks of memory from the Langbase Docs memory 
 * that have the company Langbase, the category docs or examples, and the primitive can be Chunk or Threads.
 * 
*/

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
				filters: [
					"And", [
						["company", "Eq", "Langbase"],
						["Or", [
							["category", "Eq", "docs"],
							["category", "Eq", "examples"]
						]],
						["primitive", "In", ["Chunk", "Threads"]]
					]
				]
			}
		],
		query: "What are primitives in Langbase?",
		topK: 5
	});

	console.log(response);
}

main();
