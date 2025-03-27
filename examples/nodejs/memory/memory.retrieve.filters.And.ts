/**
 * Basic example to demonstrate how to retrieve memories with filters.
 * 
 * - And: This filter is used to retrieve memories that match all the filters.
 * - Eq: This filter is used to retrieve memories that match the exact value.
 * 
 * In this example, we retrieve memories with the following filters:
 * - company: Langbase
 * - category: docs
 * 
 * We expect to get all chunks of memory from the Langbase Docs memory that have the company Langbase and the category docs.
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
			filters: ["And", [
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
