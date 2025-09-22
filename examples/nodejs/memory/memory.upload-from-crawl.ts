import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const responses = await langbase.memories.uploadFromCrawl({
		memoryName: 'memory-sdk',
		url: ['https://langbase.com', 'https://langbase.com/about'],
		maxPages: 1,
		apiKey: process.env.CRAWL_KEY!,
		service: 'spider', // or 'firecrawl'
		documentNamePrefix: 'langbase-crawl',
		meta: {
			type: 'web-crawl',
			source: 'spider-api',
			topic: 'langbase-website',
		},
	});

	console.log(`Uploaded ${responses.length} crawled pages to memory`);
	responses.forEach((response, index) => {
		console.log(`Document ${index + 1} upload status:`, response.status);
		console.log(`Document ${index + 1} upload successful:`, response.ok);
	});
}

main().catch(console.error);