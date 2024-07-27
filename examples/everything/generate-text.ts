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
