import 'dotenv/config';
import {Langbase, getToolsFromRun} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const userMsg = "What's the weather in SF";

	const response = await langbase.pipe.run({
		messages: [
			{
				role: 'user',
				content: userMsg,
			},
		],
		stream: false,
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

	const tools = await getToolsFromRun(response);

	if (tools.length) {
		// handle the tool calls
		console.log('Tools:', tools);
	} else {
		// handle the response
		console.log('Response:', response);
	}
}

main();
