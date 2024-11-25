import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const response = await langbase.pipe.update({
		name: 'summary-pipe',
		description: 'This is a pipe updated with the SDK',
		model: 'google:gemini-1.5-flash-8b-latest',
	});

	console.log(response);
}

main();
