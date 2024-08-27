/**
 * Generates a text completion using `streamText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/stream-text
 */
import 'dotenv/config';
import type {StreamText} from 'langbase';
import {Pipe, printStreamToStdout} from 'langbase';

// You can write your own — or use printStreamToStdout() from the SDK.
const helperPrintStream = async (stream: StreamText) => {
	for await (const chunk of stream) {
		// Streaming text part — a single word or several.
		const textPart = chunk.choices[0]?.delta?.content || '';

		// Demo: Print the stream — you can use it however.
		process.stdout.write(textPart);
	}
};

// Helper function to print the chat.
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

(async () => {
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

	// Print chat to the console.
	await printChat({userMessage: userMsg, stream});
})();
