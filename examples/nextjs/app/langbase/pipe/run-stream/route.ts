import {Langbase} from 'langbase';
import {NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
	const options = await req.json();

	// 1. Initiate the Pipe.
	const langbase = new Langbase({
		apiKey: process.env.LANGBASE_API_KEY!,
	});

	// 2. Generate a stream by asking a question
	const {stream, threadId} = await langbase.pipes.run({
		messages: options.messages,
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
