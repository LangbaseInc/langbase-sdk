// @deno-types="npm:langbase@1.2.0"
import {Workflow} from 'npm:langbase@1.2.0';

async function main() {
	const workflow = new Workflow({debug: true});
	const result = await workflow.step({
		id: 'hello',
		run: async () => 'world',
	});
	console.log({result});
}

main().catch(console.error);
