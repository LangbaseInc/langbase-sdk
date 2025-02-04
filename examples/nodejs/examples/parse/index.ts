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
		'parse',
		'composable-ai.md',
	);

	const results = await langbase.parse({
		document: fs.readFileSync(documentPath),
		documentName: 'composable-ai.md',
		contentType: 'application/pdf',
	});

	console.log(results);
}

main();
