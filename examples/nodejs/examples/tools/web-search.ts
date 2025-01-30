import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const results = await langbase.tool.webSearch({
		query: 'AI Engineer',
		apiKey: process.env.WEB_SEARCH_KEY,
	});

	console.log(results);
}

main();
