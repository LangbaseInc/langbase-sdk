import 'dotenv/config';
import { Langbase } from '../../packages/langbase/src';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	await createAgents();

	const inputText = `
    Artificial Intelligence (AI) has revolutionized various industries by automating
    complex tasks and providing intelligent solutions. Machine learning, a subset of AI,
    enables systems to learn from data and improve over time without explicit programming.
    Deep learning, using neural networks, has achieved remarkable results in image recognition,
    natural language processing, and autonomous systems.
  `;

	const workflow = await runMultiAgentWorkflow(inputText);

	console.log('=== SUMMARY ===');
	console.log(workflow.summary);
	console.log('\n=== QUESTIONS ===');
	console.log(workflow.questions);
}

async function runMultiAgentWorkflow(
	inputText: string
): Promise<{ summary: string; questions: string }> {
	// Step 1: Summarize the text
	const summary = await summarizeAgent(inputText);

	// Step 2: Generate questions based on the summary
	const questions = await questionsAgent(summary);

	return { summary, questions };
}

async function summarizeAgent(text: string): Promise<string> {
	const response = await langbase.pipes.run({
		name: 'summary-agent',
		stream: false,
		messages: [
			{
				role: 'user',
				content: `Summarize the following text in 2-3 sentences: ${text}`,
			},
		],
	});

	return response.completion;
}

async function questionsAgent(summary: string): Promise<string> {
	const response = await langbase.pipes.run({
		name: 'questions-agent',
		stream: false,
		messages: [
			{
				role: 'user',
				content: `Generate 3 thoughtful questions based on this summary: ${summary}`,
			},
		],
	});

	return response.completion;
}

async function createAgents() {
	try {
		// Create summary agent
		await langbase.pipes.create({
			name: 'summary-agent',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that summarizes text concisely.',
				},
			],
		});

		// Create questions agent
		await langbase.pipes.create({
			name: 'questions-agent',
			upsert: true,
			status: 'private',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that generates insightful questions based on given text.',
				},
			],
		});
	} catch (error) {
		console.error('Error creating agents:', error);
	}
}

main();
