import 'dotenv/config';
import {Pipe} from '../../pipes/pipes';

const myGeneratePipe = async () => {
	console.log('\n============= GENERATE PIPE =============');

	//  Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
	});

	// Generate the text by asking a question.
	let {completion} = await myPipe.generateText({
		messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
	});
	console.log(completion);
};

const myChatPipe = async () => {
	console.log('\n============= CHAT PIPE =============');

	// Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_CHAT_PIPE!,
	});

	// Message 1: Tell the AI about something.
	const userMsg1 = 'My company is ⌘ Langbase.';
	let {completion, threadId} = await myPipe.generateText({
		messages: [{role: 'user', content: userMsg1}],
		chat: true,
	});
	console.log(`User: `, userMsg1);
	console.log(`AI: `, completion);

	// Message 2: Ask the AI about what you told in previous message.
	const userMsg2 = 'What is the name of my company?';
	const {completion: completion2} = await myPipe.generateText({
		messages: [{role: 'user', content: userMsg2}],
		threadId,
		chat: true,
	});
	console.log(`User: `, userMsg2);
	console.log(`AI: `, completion2);
};

(async () => {
	await myGeneratePipe();
	await myChatPipe();
})();
