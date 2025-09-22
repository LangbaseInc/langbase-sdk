import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const responses = await langbase.memories.uploadFromSearch({
		memoryName: 'memory-sdk',
		query: 'What is Langbase?',
		service: 'exa',
		totalResults: 2,
		domains: ['https://langbase.com'],
		apiKey: process.env.EXA_API_KEY!, // Find Exa key: https://dashboard.exa.ai/api-keys
		documentNamePrefix: 'langbase-info',
		meta: {
			type: 'web-search',
			source: 'exa-api',
			topic: 'langbase-info',
		},
	});

	console.log(`Uploaded ${responses.length} search results to memory`);
	responses.forEach((response, index) => {
		console.log(`Document ${index + 1} upload status:`, response.status);
		console.log(`Document ${index + 1} upload successful:`, response.ok);
	});
}

main().catch(console.error);