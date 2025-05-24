// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.
import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

/**
 * Crawls specified URLs using firecrawl.dev service.
 *
 * Get your API key from the following link and set it in .env file.
 *
 * @link https://docs.firecrawl.dev/introduction
 */
async function main() {
	const results = await langbase.tools.crawl({
		url: ['https://langbase.com', 'https://langbase.com/about'],
		maxPages: 1,
		apiKey: process.env.FIRECRAWL_KEY!,
		service: 'firecrawl',
	});

	console.log(results);
}

main();
