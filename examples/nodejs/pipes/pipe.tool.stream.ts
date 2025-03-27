import 'dotenv/config';
import {Langbase, getToolsFromRunStream} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const userMsg = "What's the weather in SF";

	const response = await langbase.pipes.run({
		messages: [
			{
				role: 'user',
				content: userMsg,
			},
		],
		stream: true,
		name: 'summary',
		tools: [
			{
				type: 'function',
				function: {
					name: 'get_current_weather',
					description: 'Get the current weather of a given location',
					parameters: {
						type: 'object',
						required: ['location'],
						properties: {
							unit: {
								enum: ['celsius', 'fahrenheit'],
								type: 'string',
							},
							location: {
								type: 'string',
								description:
									'The city and state, e.g. San Francisco, CA',
							},
						},
					},
				},
			},
		],
	});

	const [streamForResponse, streamForToolCall] = response.stream.tee();

	const toolCalls = await getToolsFromRunStream(streamForToolCall);
	const hasToolCalls = toolCalls.length > 0;

	if (hasToolCalls) {
		// handle the tool calls
		console.log('Tools:', toolCalls);
	} else {
		// handle the response stream
	}
}

main();
