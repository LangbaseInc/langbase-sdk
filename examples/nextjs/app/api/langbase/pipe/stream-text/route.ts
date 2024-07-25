import {Pipe} from 'langbase';
import {NextRequest} from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
	const {prompt} = await req.json();

	// 1. Initiate the Pipe.
	const pipe = new Pipe({
		apiKey: process.env.LANGBASE_PIPE_LESS_WORDY_STREAM!,
	});

	// 2. Generate a stream by asking a question
	const stream = await pipe.streamText({
		messages: [{role: 'user', content: prompt}],
	});

	// 3. Create a ReadableStream from the Langbase stream
	const readableStream = new ReadableStream({
		async start(controller) {
			for await (const chunk of stream) {
				controller.enqueue(JSON.stringify(chunk) + '\n');
			}
			controller.close();
		},
	});

	// 4. Return the stream
	return new Response(readableStream, {
		headers: {
			'Content-Type': 'application/x-ndjson',
		},
	});
}
