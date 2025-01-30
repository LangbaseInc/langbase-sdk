import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const results = await langbase.tool.crawl({
		url: ['https://langbase.com', 'https://langbase.com/about'],
		max_pages: 1,
		api_key: process.env.CRAWL_KEY,
	});

	console.log(results);
}

main();
