import 'dotenv/config';
import {Pipe} from 'langbase';

// STREAM: OFF
const pipeStreamOff = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY!,
});

const result = await pipeStreamOff.generateText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

console.log('STEAM-OFF');
console.log(result.completion);

// STREAM: ON
const pipeStreaming = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY_STREAM!,
});

const stream = await pipeStreaming.streamText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

console.log('\n');
console.log('STEAM-ON');
for await (const chunk of stream) {
	process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
