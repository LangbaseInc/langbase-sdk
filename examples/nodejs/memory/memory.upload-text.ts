import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const textContent = `
# Langbase SDK Memory Upload Example

This is a sample text that demonstrates how to upload text directly to memory
without needing to handle files. This feature allows you to:

- Upload plain text content to memory
- Add metadata to the uploaded text
- Automatically generate document names or provide custom ones

This makes it easy to add content from variables, API responses, or any other text source.
	`.trim();

	const response = await langbase.memories.uploadText({
		memoryName: 'memory-sdk',
		text: textContent,
		documentName: 'sdk-demo-text.txt',
		meta: {
			type: 'demo',
			source: 'sdk-example',
			description: 'Example of uploadText functionality',
		},
	});

	console.log('Text upload response status:', response.status);
	console.log('Upload successful:', response.ok);
}

main().catch(console.error);