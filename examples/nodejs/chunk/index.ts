// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.
import 'dotenv/config';
import fs from 'fs';
import {Langbase} from 'langbase';
import path from 'path';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const documentPath = path.join(
		process.cwd(),
		'examples',
		'chunk',
		'index.ts',
	);

	const results = await langbase.chunk({
		document: fs.readFileSync(documentPath),
		documentName: 'chunk.txt',
		contentType: 'text/plain',
		chunkMaxLength: '1024',
		chunkOverlap: '256',
	});

	console.log(results);
}

main();
