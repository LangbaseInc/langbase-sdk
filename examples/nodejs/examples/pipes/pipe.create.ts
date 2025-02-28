import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.pipes.create({
		name: 'summary-pipe2',
		status: 'private',
	});

	console.log(response);
}

main();
