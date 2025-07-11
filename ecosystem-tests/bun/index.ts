import {Langbase, Workflow} from 'langbase';

async function main() {
	const langbase = new Langbase({
		apiKey: 'YOUR_API_KEY', // Replace with actual API key or env var
	});
	const workflow = new Workflow({debug: true, langbase});
	const result = await workflow.step({
		id: 'hello',
		run: async () => 'world',
	});
	console.log({result});
}

main().catch(console.error);
