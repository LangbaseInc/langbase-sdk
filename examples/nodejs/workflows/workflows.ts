// Test script for the simplified proxy approach
import 'dotenv/config';
import {Langbase} from 'langbase';

// Create Langbase instance
const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	// Create a workflow with debug mode enabled
	const workflow = langbase.workflow({
		name: 'simplified-proxy-test',
		debug: true, // Enable debug logging
	});

	try {
		// STEP 1: Call langbase.agent.run but don't return its result directly
		const step1Result = await workflow.step({
			id: 'call-but-return-custom',
			run: async () => {
				// Return custom result instead
				return {
					customField: 'Custom result from simplified proxy',
					timestamp: new Date().toISOString(),
				};
			},
		});

		// STEP 2: Return agent.run result directly
		const step2Result = await workflow.step({
			id: 'return-agent-run-directly',
			run: async () => {
				// Call Langbase API and return the result directly
				return langbase.agent.run({
					model: 'openai:gpt-4o-mini',
					apiKey: process.env.OPENAI_API_KEY!,
					instructions: 'Be brief and concise.',
					input: 'What is 2+2?',
					stream: false,
				});
			},
		});

		// STEP 3: Make multiple Langbase calls in one step
		const step3Result = await workflow.step({
			id: 'multiple-calls',
			run: async () => {
				// First call
				const call1 = await langbase.agent.run({
					model: 'openai:gpt-4o-mini',
					apiKey: process.env.OPENAI_API_KEY!,
					instructions: 'Be brief.',
					input: 'First proxy test',
					stream: false,
				});

				// Second call with different method
				const call2 = await langbase.agent.run({
					model: 'openai:gpt-4o-mini',
					apiKey: process.env.OPENAI_API_KEY!,
					instructions: 'Be brief.',
					input: 'Second proxy test',
					stream: false,
				});

				// Return combined result
				return {
					summary: 'Multiple calls completed with simplified proxy',
					calls: 2,
					firstOutput: call1.output,
					secondOutput: call2.output,
				};
			},
		});
	} catch (error) {
		console.error('❌ Workflow error:', error);
	} finally {
		// End the workflow to show trace report
		workflow.end();
	}
}

// Run the test
main().catch(console.error);
