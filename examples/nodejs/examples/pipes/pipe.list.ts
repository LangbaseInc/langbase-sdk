import 'dotenv/config';
import {Pipe} from 'langbase';

const pipe = new Pipe({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await pipe.list();
	console.log(response);
}

main();
