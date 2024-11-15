import 'dotenv/config';
import {Pipe} from 'langbase';

const pipe = new Pipe({
	apiKey: process.env.LANGBASE_API_KEY!,
	name: 'summary',
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
	});
	console.log('response: ', response);
}

main();
