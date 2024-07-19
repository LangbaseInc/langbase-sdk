import 'dotenv/config';
import Langbase from '../index';

async function main() {
	const pipeLessWordy = Langbase.pipe({
		apiKey: process.env.PIPE_LESS_WORDY!,
	});
	console.log('✨ ~ process.env:', process.env);
	console.log(
		'✨ ~ process.env.PIPE_LESS_WORDY:',
		process.env.PIPE_LESS_WORDY,
	);

	const result = await pipeLessWordy.generateText({
		messages: [{role: 'user', content: 'Who is Ahmad Awais?'}],
	});

	console.log(result.completion);
}

main();
