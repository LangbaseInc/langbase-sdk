/**
 * Basic example to demonstrate how to retrieve memories with filters.
 *
 * - In: This filter is used to retrieve memories that match any of the value/values in the array.
 *
 * In this example, we retrieve memories with the following filters:
 * - company: Langbase or Google
 *
 * We expect to get all chunks of memory from the Langbase Docs memory that have the company Langbase or Google.
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
				name: 'langbase-docs',
				filters: ['company', 'In', ['Langbase', 'Google']],
			},
		],
		query: 'What are pipes in Langbase?',
		topK: 5,
	});

	console.log(response);
}

main();
