/**
 * Generates a text completion using `streamText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/stream-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

// 1. Initiate the Pipe.
const pipe = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY!,
});

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
