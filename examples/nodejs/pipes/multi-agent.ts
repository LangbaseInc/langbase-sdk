// Basic example to demonstrate how to feed the output of an agent as an input to another agent.

import dotenv from 'dotenv';
import {Langbase} from 'langbase';

dotenv.config();

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	// First agent: Summarize text
	const summarizeAgent = async (text: string) => {
		const response = await langbase.pipes.run({
			stream: false,
			name: 'summarize',
			messages: [
				{
					role: 'system',
					content: `You are a helpful assistant that summarizes text.`,
				},
				{
					role: 'user',
					content: `Summarize the following text: ${text}`,
				},
			],
		});
		return response.completion;
	};

	// Second agent: Generate questions
	const questionsAgent = async (summary: string) => {
		const response = await langbase.pipes.run({
			stream: false,
			name: 'generate-questions',
			messages: [
				{
					role: 'system',
					content: `You are a helpful assistant that generates questions.`,
				},
				{
					role: 'user',
					content: `Generate 3 questions based on this summary: ${summary}`,
				},
			],
		});
		return response.completion;
	};

	// Router agent: Orchestrate the flow
	const workflow = async (inputText: string) => {
		const summary = await summarizeAgent(inputText);
		const questions = await questionsAgent(summary);
		return {summary, questions};
	};

	// Example usage
	const inputText =
		'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.';

	const result = await workflow(inputText);
	console.log('Summary:', result.summary);
	console.log('Questions:', result.questions);
}

main().catch(console.error);
