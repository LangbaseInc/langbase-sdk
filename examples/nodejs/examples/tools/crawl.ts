import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

/**
 * Crawls specified URLs using spider.cloud API.
 *
 * Get your API key from the following link and set it in .env file.
 *
 * @link https://spider.cloud/docs/quickstart
 */
async function main() {
	const results = await langbase.tool.crawl({
		url: ['https://langbase.com', 'https://langbase.com/about'],
		max_pages: 1,
		api_key: process.env.CRAWL_KEY,
	});

	console.log(results);
}

main();
