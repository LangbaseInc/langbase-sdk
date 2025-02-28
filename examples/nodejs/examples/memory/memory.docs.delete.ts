import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.memories.documents.delete({
		memoryName: 'memory-sdk',
		documentName: 'readme.md',
	});

	console.log(response);
}

main();
