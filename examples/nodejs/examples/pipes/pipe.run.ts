import 'dotenv/config';
import {Pipe} from 'langbase';

const pipe = new Pipe({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const userMsg = 'Who is an AI Engineer?';

	const response = await pipe.run({
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
