import {Pipe} from 'langbase';
import {NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
	const {prompt} = await req.json();

	// 1. Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_API_KEY!,
		name: 'summary',
	});

	// 2. Generate a stream by asking a question
	const result = await myPipe.run({
		messages: [{role: 'user', content: prompt}],
		stream: false,
	});

	// 3. Done, return the stream in a readable stream format.
	return new Response(JSON.stringify(result));
}
