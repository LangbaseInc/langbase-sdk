import 'dotenv/config';
import {Memory} from 'langbase';
import fs from 'fs';
import path from 'path';

const memory = new Memory({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const src = path.join(
		process.cwd(),
		'examples',
		'memory',
		'memory.upload.doc.ts',
	);
	const file = fs.readFileSync(src);

	const response = await memory.uploadDoc({
		file,
		memoryName: 'memory-sdk',
		fileName: 'memory.upload.doc.ts',
		contentType: 'text/plain',
		meta: {
			extension: 'ts',
			description: 'This is a test file',
		},
	});

	console.log(response);
}

main();
