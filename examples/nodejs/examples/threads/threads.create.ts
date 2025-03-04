import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.threads.create({
		messages: [{role: 'user', content: 'hello', metadata: {size: 'small'}}],
		metadata: {company: 'langbase'},
	});

	console.log(response);
}

main();
