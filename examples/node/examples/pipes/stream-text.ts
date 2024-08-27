/**
 * Generates a text completion using `streamText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/stream-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

// 1. Initiate the Pipe.
const pipe = new Pipe({
	apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
});

// 2. Generate a stream by asking a question
const {stream} = await pipe.streamText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 3. Print the stream in Node environment.
// For Next.js and more examples see the SDK documentation.
// https://langbase.com/docs/langbase-sdk/examples
for await (const chunk of stream) {
	// Streaming text part — a single word or several.
	const textPart = chunk.choices[0]?.delta?.content || '';

	// Demo: Print the stream — you can use it however.
	process.stdout.write(textPart);
}
