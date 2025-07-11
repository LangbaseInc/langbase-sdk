import {Workflow} from 'langbase';

async function main() {
	const workflow = new Workflow({debug: true});
	const result = await workflow.step({
		id: 'hello',
		run: async () => 'world',
	});
	console.log({result});
}

main().catch(console.error);
