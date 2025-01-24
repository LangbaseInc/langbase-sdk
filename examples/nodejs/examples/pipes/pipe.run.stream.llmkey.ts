import 'dotenv/config';
import {getRunner, Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const userMsg = 'Who is an AI Engineer?';

	// Get readable stream
	const {stream, threadId, rawResponse} = await langbase.pipe.run({
		messages: [{role: 'user', content: userMsg}],
		stream: true,
		rawResponse: true,
		name: 'summary',
		llmKey: process.env.LLM_KEY!, // Your LLM API key
	});

	// Convert the stream to a stream runner.
	const runner = getRunner(stream);

	// Method 1: Using event listeners
	runner.on('connect', () => {
		console.log('Stream started.\n');
	});

	runner.on('content', content => {
		process.stdout.write(content);
	});

	runner.on('end', () => {
		console.log('\nStream ended.');
	});

	runner.on('error', error => {
		console.error('Error:', error);
	});
}

main();
