/**
 * Generates a text completion using `generateText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/generate-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

// 1. Initiate the Pipe.
const myPipe = new Pipe({
	apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
});

// 3. Generate the text by asking a question.
const {completion} = await myPipe.generateText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 4. Done: You got the generated completion.
console.log(completion);
