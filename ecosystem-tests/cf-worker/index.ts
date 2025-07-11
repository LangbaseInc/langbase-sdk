import {Langbase, Workflow} from 'langbase';

export default {
	async fetch(request: Request) {
		// Instantiate Langbase
		const langbase = new Langbase({
			apiKey: 'YOUR_API_KEY', // Replace with actual API key or env var
		});
		// Create workflow with langbase instance
		const workflow = new Workflow({debug: true, langbase});
		const result = await workflow.step({
			id: 'hello',
			run: async () => 'world',
		});
		return new Response(JSON.stringify({result}), {
			headers: {'content-type': 'application/json'},
		});
	},
};
