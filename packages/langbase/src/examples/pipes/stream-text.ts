import 'dotenv/config';
import {Pipe, printStreamToStdout, StreamText} from '../../pipes/pipes';

// You can write your own — or use printStreamToStdout() from the SDK.
const helperPrintStream = async (stream: StreamText) => {
	for await (const chunk of stream) {
		// Streaming text part — a single word or several.
		const textPart = chunk.choices[0]?.delta?.content || '';

		// Demo: Print the stream — you can use it however.
		process.stdout.write(textPart);
	}
};

const printChat = async ({
	userMessage,
	stream,
}: {
	userMessage: string;
	stream: StreamText;
}) => {
	console.log(`\n`);
	console.log(`User: `, userMessage);
	console.log(`AI: `);
	await printStreamToStdout(stream);
};

const myGeneratePipe = async () => {
	console.log('\n============= GENERATE PIPE =============');

	//  Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
	});

	// Generate the text by asking a question.
	const userMsg = 'Who is an AI Engineer?';
	let {stream} = await myPipe.streamText({
		messages: [{role: 'user', content: userMsg}],
	});

	// Print.
	await printChat({userMessage: userMsg, stream});
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
	await myChatPipe();
})();
