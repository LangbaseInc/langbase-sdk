import {Pipe} from 'langbase';
import {NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
	const {prompt} = await req.json();

	// 1. Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_API_KEY!,
	});

	// 2. Generate a stream by asking a question
	const {stream, threadId} = await myPipe.run({
		messages: [{role: 'user', content: prompt}],
		stream: true,
		name: 'summary',
	});

	// 3. Done, return the stream in a readable stream format.
	return new Response(stream, {
		status: 200,
		headers: {
			'lb-thread-id': threadId ?? '',
		},
	});
}
