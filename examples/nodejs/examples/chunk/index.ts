import 'dotenv/config';
import {Langbase} from 'langbase';
import fs from 'fs';
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
