import 'dotenv/config';
import {Langbase} from 'langbase';
import fs from 'fs';
import path from 'path';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const src = path.join(
		process.cwd(),
		'examples',
		'memory',
		'memory.docs.upload.ts',
	);

	const response = await langbase.memory.documents.upload({
		document: fs.readFileSync(src),
		memoryName: 'memory-sdk',
		documentName: 'memory.docs.upload.ts',
		contentType: 'text/plain',
		meta: {
			extension: 'ts',
			description: 'This is a test file',
		},
	});

	console.log(response);
}

main();
