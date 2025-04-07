/**
 * Converts various document formats to FormData.
 *
 * @param options - The conversion options
 * @param options.document - The document to convert. Can be Buffer, File, FormData or ReadableStream
 * @param options.documentName - The name of the document
 * @param options.contentType - The MIME type of the document
 *
 * @returns A Promise that resolves to FormData containing the document
 *
 * @example
 * ```ts
 * const buffer = Buffer.from('Hello World');
 * const formData = await convertDocToFormData({
 *   document: buffer,
 *   documentName: 'hello.txt',
 *   contentType: 'text/plain'
 * });
 * ```
 */
export async function convertDocToFormData(options: {
	document: Buffer | File | FormData | ReadableStream;
	documentName: string;
	contentType: string;
}) {
	let formData = new FormData();

	if (options.document instanceof Buffer) {
		const documentBlob = new Blob([options.document], {
			type: options.contentType,
		});
		formData.append('document', documentBlob, options.documentName);
	} else if (options.document instanceof File) {
		formData.append('document', options.document, options.documentName);
	} else if (options.document instanceof FormData) {
		formData = options.document;
	} else if (options.document instanceof ReadableStream) {
		const chunks: Uint8Array[] = [];
		const reader = options.document.getReader();

		while (true) {
			const {done, value} = await reader.read();
			if (done) break;
			chunks.push(value);
		}

		const documentBlob = new Blob(chunks, {type: options.contentType});
		formData.append('document', documentBlob, options.documentName);
	}

	formData.append('documentName', options.documentName);

	return formData;
}
