import 'dotenv/config';
import {Langbase} from 'langbase';

// Learn more about Langbase API keys: https://langbase.com/docs/api-reference/api-keys
const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const results = await langbase.tools.webSearch({
		service: 'exa',
		totalResults: 2,
		query: 'What is Langbase?',
		domains: ['https://langbase.com'],
		apiKey: process.env.EXA_API_KEY!, // Find Exa key: https://dashboard.exa.ai/api-keys
	});

	console.log(results);
}

main();
