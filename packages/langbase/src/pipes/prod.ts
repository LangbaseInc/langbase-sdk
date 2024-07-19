import 'dotenv/config';
import {Pipe} from './../index';

async function main() {
	const pipeLessWordy = new Pipe({
		apiKey: process.env.PIPE_LESS_WORDY!,
	});

	const result = await pipeLessWordy.generateText({
		messages: [{role: 'user', content: 'Who is Ahmad Awais?'}],
	});

	console.log(result.completion);

	const pipeLessWordyStream = new Pipe({
		apiKey: process.env.PIPE_LESS_WORDY_STREAM!,
	});

	const stream = await pipeLessWordyStream.streamText({
		messages: [{role: 'user', content: 'Who is Ahmad Awais?'}],
	});

	for await (const chunk of stream) {
		process.stdout.write(chunk.choices[0]?.delta?.content || '');
	}
}

main();
