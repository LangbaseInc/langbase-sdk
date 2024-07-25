import 'dotenv/config';
import {Pipe} from './pipes';

(async () => {
	// Initialize the Pipe
	const pipe = new Pipe({
		apiKey: process.env.PIPE_LESS_WORDY_STREAM!,
	});

	const stream = await pipe.streamText({
		messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
	});

	console.log('✨ ~ stream:', stream);

	console.log('\nStreaming response:');

	// Use for-await-of loop with textStream
	for await (const chunk of stream.textStream) {
		process.stdout.write(chunk);
	}

	console.log('\n\nFinish reason:', stream.finishReason);

	// If you need the full text after streaming, you can use the text promise
	const fullText = await stream.text;
	console.log('\nFull text:', fullText);
})();

// import 'dotenv/config';
// import {Pipe} from './pipes';

// (async () => {
// 	// Initialize the Pipe
// 	const pipe = new Pipe({
// 		apiKey: process.env.PIPE_LESS_WORDY_STREAM!,
// 	});

// 	const stream = await pipe.streamText({
// 		messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
// 	});
// 	console.log('✨ ~ stream:', stream);

// 	// 3. Print the stream
// 	// for await (const chunk of stream) {
// 	// 	// Streaming text part — a single word or several.
// 	// 	const textPart = chunk.choices[0]?.delta?.content || '';

// 	// 	// Demo: Print the stream — you can use it however.
// 	// 	process.stdout.write(textPart);
// 	// }

// 	for await (const textPart of stream.textStream) {
// 		// Demo: Print the stream — you can use it however you like
// 		process.stdout.write(textPart);
// 	}

// 	// // Helper function to create a new stream for each example
// 	// async function getStream(prompt: string): Promise<StreamTextResponse> {
// 	// 	const options: GenerateOptions = {
// 	// 		messages: [{role: 'user', content: prompt}],
// 	// 		model: 'gpt-3.5-turbo',
// 	// 	};
// 	// 	return pipe.streamText(options);
// 	// }

// 	// // Example 1: Basic usage with async iteration
// 	// async function basicStreamExample() {
// 	// 	const stream = await getStream('Tell me a short story about a robot.');
// 	// 	const [streamForChunks, streamForText] = stream.tee();

// 	// 	console.log('Streaming story (chunks):');
// 	// 	for await (const chunk of streamForChunks) {
// 	// 		process.stdout.write(chunk.choices[0]?.delta?.content || '');
// 	// 	}
// 	// 	console.log('\nStream finished');

// 	// 	console.log('\nStreaming story (text):');
// 	// 	for await (const text of stream.textStream) {
// 	// 		process.stdout.write(text);
// 	// 	}
// 	// 	console.log('\nStream finished');

// 	// 	console.log('Finish reason:', stream.finishReason);
// 	// }

// 	// // Example 2: Using textStream directly
// 	// async function textStreamExample() {
// 	// 	const stream = await getStream('List 5 interesting facts about space.');

// 	// 	console.log('Streaming facts:');
// 	// 	for await (const chunk of stream.textStream) {
// 	// 		process.stdout.write(chunk);
// 	// 	}

// 	// 	console.log('\nStream finished');
// 	// 	console.log('Finish reason:', stream.finishReason);
// 	// }

// 	// // Example 3: Cancelling the stream
// 	// async function cancellableStreamExample() {
// 	// 	const stream = await getStream(
// 	// 		'Write a long essay about artificial intelligence.',
// 	// 	);

// 	// 	console.log('Streaming essay (will cancel after 5 seconds):');
// 	// 	setTimeout(() => {
// 	// 		console.log('\nCancelling stream...');
// 	// 		stream.controller.abort();
// 	// 	}, 5000);

// 	// 	try {
// 	// 		for await (const chunk of stream.textStream) {
// 	// 			process.stdout.write(chunk);
// 	// 		}
// 	// 	} catch (error) {
// 	// 		if (error.name === 'AbortError') {
// 	// 			console.log('Stream was cancelled');
// 	// 		} else {
// 	// 			console.error('An error occurred:', error);
// 	// 		}
// 	// 	}

// 	// 	console.log('Finish reason:', stream.finishReason);
// 	// }

// 	// // Run the examples
// 	// (async () => {
// 	// 	console.log('Running basic stream example:');
// 	// 	await basicStreamExample();

// 	// 	console.log('\n\nRunning textStream example:');
// 	// 	await textStreamExample();

// 	// 	console.log('\n\nRunning cancellable stream example:');
// 	// 	await cancellableStreamExample();
// 	// })();
// })();
