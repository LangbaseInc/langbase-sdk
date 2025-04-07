/**
 * Basic example to demonstrate how to retrieve memories with filters.
 *
 * - NotEq: This filter is used to retrieve memories that do not match the exact value.
 *
 * In this example, we retrieve memories with the following filters:
 * - company: Langbase
 *
 * We expect to get all chunks of memory from the Langbase Docs memory that do not have the company Langbase.
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
				filters: ['company', 'NotEq', 'Google'],
			},
		],
		query: 'What is Langbase?',
		topK: 5,
	});

	console.log(response);
}

main();
