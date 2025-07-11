import {Workflow} from 'langbase';

export default {
	async fetch(request: Request) {
		// Simple workflow step
		const workflow = new Workflow({debug: true});
		const result = await workflow.step({
			id: 'hello',
			run: async () => 'world',
		});
		return new Response(JSON.stringify({result}), {
			headers: {'content-type': 'application/json'},
		});
	},
};
