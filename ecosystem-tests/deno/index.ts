// If you are using the Deno VSCode extension or Deno CLI for type checking, the following line enables Deno global types:
// /// <reference types="deno.ns" />
// If you see 'Cannot find type definition file for deno.ns', you can safely remove the line above unless you are using Deno tooling.
// Deno will run this file fine without it.
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
