import 'dotenv/config';
import {Langbase, Tools} from '../langbase/dist/index.js';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createAgent();

	const response = await langbase.pipes.run({
		stream: false,
		name: 'pipe-with-tools',
		messages: [{role: 'user', content: "What's the weather in SF?"}],
		tools: [weatherToolSchema],
	});

	const finalResponse = await langbase.pipes.handleToolCalls({
		response,
		tools,
		onComplete: logToolCallFlow, // Optional: for demo logging
	});

	console.log('Final answer:', finalResponse.choices[0].message.content);
}

// Mock implementation of the weather function
async function getCurrentWeather(args: {location: string}) {
	return 'Sunny, 75°F';
}

// Weather tool schema
const weatherToolSchema: Tools = {
	type: 'function',
	function: {
		name: 'getCurrentWeather',
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
					description: 'The city and state, e.g. San Francisco, CA',
				},
			},
		},
	},
};

// Object to hold all tools
const tools = {
	getCurrentWeather,
};

/**
 * Creates a summary agent pipe if it doesn't already exist.
 *
 * This function checks if a pipe with the name 'pipe-with-tools' exists in the system.
 * If the pipe doesn't exist, it creates a new private pipe with a system message
 * configuring it as a helpful assistant.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 * @throws {Error} Logs any errors encountered during the creation process
 */
async function createAgent() {
	try {
		await langbase.pipes.create({
			name: 'pipe-with-tools',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content: 'You are a helpful assistant.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating summary agent:', error);
	}
}

main();

// ============================================================================
// CONSOLE LOGGING (for demo purposes only)
// ============================================================================
// NOTE: The logging below is purely for demonstration and debugging.
// In production, you can remove the onComplete callback or use your own logging.

/**
 * Logs the actual messages exchanged in the conversation (for demo/debugging)
 */
function logToolCallFlow({
	toolCalls,
	toolResults,
	finalResponse,
}: {
	toolCalls: any[];
	toolResults: any[];
	finalResponse: any;
}) {
	console.log('\n' + '='.repeat(70));
	console.log('💬 MESSAGES EXCHANGED');
	console.log('='.repeat(70) + '\n');

	// Message 1: User's question
	console.log('Message 1 - User:');
	console.log(`  (sent in initial pipe.run() call)\n`);

	// Message 2: AI requests tool calls
	console.log('Message 2 - AI (requests tools):');
	toolCalls.forEach((call, i) => {
		const args = JSON.parse(call.function.arguments);
		console.log(
			`  Tool ${i + 1}: ${call.function.name}(${JSON.stringify(args)})`,
		);
	});

	// Message 3: Tool results sent back to AI
	console.log('\nMessage 3 - Tool Results:');
	toolResults.forEach(result => {
		console.log(`  ${result.name} → "${result.content}"`);
	});

	// Message 4: AI's final response
	console.log('\nMessage 4 - AI (final response):');
	const content = finalResponse.choices?.[0]?.message?.content;
	if (content) {
		console.log(`  "${content}"`);
	} else {
		console.log('  [Debug: No content found]');
		console.log(
			'  Response structure:',
			JSON.stringify(finalResponse, null, 2),
		);
	}

	console.log('\n' + '='.repeat(70) + '\n');

	// Optional: Full response details (commented out by default)
	// Uncomment the line below to see the complete API response
	// console.log('\n📋 Full Response:\n', JSON.stringify(finalResponse, null, 2));
}
