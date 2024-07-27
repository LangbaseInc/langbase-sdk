import 'dotenv/config';
import {Pipe} from 'langbase';

// STREAM: OFF
console.log('STREAM-OFF: generateText()');

// 1. Initiate the Pipe.
const pipe = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY!,
});

// 3. Generate the text by asking a question.
const result = await pipe.generateText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 4. Done: You got the generated completion.
console.log(result.completion);

// ======= OR ======== //

// STREAM: ON
console.log('');
console.log('STREAM-ON: streamText()');

// 2. Generate a stream by asking a question
const stream = await pipe.streamText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 3. Print the stream
for await (const chunk of stream) {
	// Streaming text part — a single word or several.
	const textPart = chunk.choices[0]?.delta?.content || '';

	// Demo: Print the stream — you can use it however.
	process.stdout.write(textPart);
}
