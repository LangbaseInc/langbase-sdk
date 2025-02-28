import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.memories.documents.embeddings.retry({
		memoryName: 'memory-sdk',
		documentName: 'memory.upload.doc.ts',
	});

	console.log(response);
}

main();
