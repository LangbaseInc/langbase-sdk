import 'dotenv/config';
import {Memory} from 'langbase';

const memory = new Memory({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await memory.create({
		name: 'sdk-memory-2',
		embedding_model: 'cohere:embed-multilingual-v3.0'
	});

	console.log(response);
}

main();
