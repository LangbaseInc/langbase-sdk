import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const userMsg = 'Who is an AI Engineer?';

	const response = await langbase.pipe.run({
		messages: [
			{
				role: 'user',
				content: userMsg,
			},
		],
		stream: false,
		name: 'summary'
	});
	console.log('response: ', response);
}

main();
