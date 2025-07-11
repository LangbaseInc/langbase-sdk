// @deno-types="npm:langbase@1.2.0"
import {Langbase, Workflow} from 'npm:langbase@1.2.0';

async function main() {
	const langbase = new Langbase({
		apiKey: Deno.env.get('LANGBASE_API_KEY') ?? 'YOUR_API_KEY',
	});
	const workflow = new Workflow({debug: true, langbase});
	const result = await workflow.step({
		id: 'hello',
		run: async () => 'world',
	});
	console.log({result});
}

main().catch(console.error);
