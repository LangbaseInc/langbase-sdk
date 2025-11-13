import 'dotenv/config';
import { Langbase, getToolsFromRun } from '../../packages/langbase/src';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createSummaryAgent();

	const userMsg = "What's the weather in San Francisco?";

	const response = await langbase.pipes.run({
		stream: false,
		name: 'summary-agent',
		messages: [{ role: 'user', content: userMsg }],
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

	const toolCalls = await getToolsFromRun(response);
	const hasToolCalls = toolCalls.length > 0;

	if (hasToolCalls) {
		console.log('Tool calls detected:', JSON.stringify(toolCalls, null, 2));

		// Execute the tool (simulated)
		const toolResults = toolCalls.map((call) => {
			// Simulate weather API call
			return {
				role: 'tool' as const,
				tool_call_id: call.id,
				content: JSON.stringify({
					temperature: 72,
					unit: 'fahrenheit',
					condition: 'sunny',
				}),
			};
		});

		// Send tool results back to get final response
		const finalResponse = await langbase.pipes.run({
			stream: false,
			name: 'summary-agent',
			threadId: response.threadId!,
			messages: [{ role: 'user', content: userMsg }, ...toolResults],
		});

		console.log('\nFinal response:', finalResponse.completion);
	} else {
		console.log('Direct response:', response.completion);
	}
}

async function createSummaryAgent() {
	try {
		await langbase.pipes.create({
			name: 'summary-agent',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that helps users with their questions.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating summary agent:', error);
	}
}

main();
