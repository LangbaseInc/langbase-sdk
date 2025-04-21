import { heading } from '@/utils/heading';
import * as p from '@clack/prompts';
import { Langbase } from 'langbase';
import { getApiKey } from '@/utils/get-langbase-api-key';
import { fromZodError } from 'zod-validation-error';
import { memoryNameSchema } from 'types/memory';
import fs from 'fs';
import path from 'path';
import { ContentType } from 'langbase';

export async function uploadDocs() {
	const apiKey = await getApiKey();

	p.intro(heading({ text: 'MEMORY', sub: 'Upload a document' }));
	await p
		.group(
			{
				name: () =>
					p.text({
						message: 'Name of the memory',
						placeholder: 'cli-memory',
						validate: value => {
							const validatedName =
								memoryNameSchema.safeParse(value);
							if (!validatedName.success) {
								const validationError = fromZodError(
									validatedName.error
								).toString();
								return validationError;
							}
							return;
						}
					}),
				documentName: () =>
					p.text({
						message: 'Name of the document',
						placeholder: 'cli-document'
					}),
				filePath: () =>
					p.text({
						message: 'Path to the document',
						placeholder: '/path/to/your/file',
						validate: value => {
							if (!fs.existsSync(value)) {
								return 'File does not exist';
							}
							return;
						}
					})
			},
			{
				onCancel: () => {
					p.cancel('Operation cancelled.');
					process.exit(0);
				}
			}
		)
		.then(async ({ name, documentName, filePath }) => {
			const langbase = new Langbase({
				apiKey: apiKey
			});

			const spinner = p.spinner();
			spinner.start('Document is being uploaded...');

			// Read the file
			const document = fs.readFileSync(filePath);

			// Determine content type based on file extension
			const ext = path.extname(filePath).toLowerCase();
			let contentType: ContentType = 'text/plain';

			// Map common extensions to content types
			const contentTypeMap: Record<string, ContentType> = {
				'.txt': 'text/plain',
				'.md': 'text/markdown',
				'.pdf': 'application/pdf',
				'.csv': 'text/csv',
				'.xls': 'application/vnd.ms-excel',
				'.xlsx':
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			};

			contentType = contentTypeMap[ext] || 'text/plain';

			await langbase.memories.documents.upload({
				memoryName: name,
				documentName: documentName,
				document: document,
				contentType: contentType
			});

			spinner.stop('Document uploaded successfully!');
			console.log(`${documentName} uploaded successfully!`);
		});
}
