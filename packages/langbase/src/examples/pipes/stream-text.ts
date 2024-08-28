import 'dotenv/config';
import {getTextDelta, Pipe, printStreamToStdout, StreamText} from '../../pipes/pipes';

const printChat = async ({userMessage, stream}: {userMessage: string; stream: StreamText}) => {
	console.log(`\n`);
	console.log(`User: `, userMessage);
	console.log(`AI: `);
	await printStreamToStdout(stream);
};

const myGeneratePipe = async () => {
	console.log('\n============= GENERATE PIPE =============');

	// Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
	});

	// Generate the text by asking a question.
	const userMsg = 'Who is an AI Engineer?';
	let {threadId} = await myPipe.streamText({
		messages: [{role: 'user', content: userMsg}],
		onStart: () => console.log('Stream started'),
		onChunk: ({chunk}) => process.stdout.write(getTextDelta(chunk)),
		onFinish: () => console.log('Stream finished'),
	});
};

const myChatPipe = async () => {
	console.log('\n\n============= CHAT PIPE =============');

	//  Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_CHAT_PIPE!,
	});

	// Message 1: Tell the AI about something.
	const userMsg1 = 'My company is ⌘ Langbase.';
	let {stream, threadId} = await myPipe.streamText({
		messages: [{role: 'user', content: userMsg1}],
		chat: true,
	});

	await printChat({userMessage: userMsg1, stream});

	// Message 2: Ask the AI about what you told in previous message.
	const userMsg2 = 'What is the name of my company?';
	const {stream: stream2} = await myPipe.streamText({
		messages: [{role: 'user', content: userMsg2}],
		threadId,
		chat: true,
	});
	await printChat({userMessage: userMsg2, stream: stream2});
};

(async () => {
	await myGeneratePipe();
	// await myChatPipe();
})();
