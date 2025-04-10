import 'dotenv/config';
import {Langbase} from 'langbase';
import {z} from 'zod';
import {zodToJsonSchema} from 'zod-to-json-schema';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

// Define the Strucutred Output JSON schema with Zod
const MathReasoningSchema = z.object({
	steps: z.array(
		z.object({
			explanation: z.string(),
			output: z.string(),
		}),
	),
	final_answer: z.string(),
});

const jsonSchema = zodToJsonSchema(MathReasoningSchema, {target: 'openAi'});

async function createMathTutorPipe() {
	const pipe = await langbase.pipes.create({
		name: 'math-tutor',
		model: 'openai:gpt-4o',
		messages: [
			{
				role: 'system',
				content:
					'You are a helpful math tutor. Guide the user through the solution step by step.',
			},
		],
		json: true,
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'math_reasoning',
				schema: jsonSchema,
			},
		},
	});

	console.log('✅ Math Tutor pipe created:', pipe);
}

async function runMathTutorPipe(question: string) {
	const {completion} = await langbase.pipes.run({
		name: 'math-tutor',
		messages: [{role: 'user', content: question}],
		stream: false,
	});

	// Parse and validate the response using Zod
	const solution = MathReasoningSchema.parse(JSON.parse(completion));

	console.log('✅ Structured Output Response:', solution);
}

async function main() {
	if (!process.env.LANGBASE_API_KEY) {
		console.error('❌ Missing LANGBASE_API_KEY in environment variables.');
		process.exit(1);
	}

	// Run this only once to create the pipe. Uncomment if it's your first time setting it up.
	// await createMathTutorPipe();
	await runMathTutorPipe('How can I solve 8x + 22 = -23?');
}

main();
