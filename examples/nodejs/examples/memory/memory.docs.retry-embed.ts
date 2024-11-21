import 'dotenv/config';
import {Memory} from 'langbase';

const memory = new Memory({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await memory.retryDocEmbed({
		memoryName: 'memory-sdk',
		documentName: 'memory.upload.doc.ts',
	});

	console.log(response);
}

main();
