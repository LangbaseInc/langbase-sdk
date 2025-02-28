import {Langbase} from 'langbase';

// Placeholder for user code
export default async function Route(request, env) {
	const langbase = new Langbase({
		apiKey: 'API_KEY',
	});

	const pipes = await langbase.pipes.list();

	// User code will be injected here
	return new Response(JSON.stringify(pipes), {status: 200});
}
