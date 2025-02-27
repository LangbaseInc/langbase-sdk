import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.memory.create({
		name: 'memory-sdk',
		embedding_model: 'cohere:embed-multilingual-v3.0'
	});

	console.log(response);
}

main();
