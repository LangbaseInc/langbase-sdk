/**
 * Generates a text completion using `generateText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/generate-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

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
