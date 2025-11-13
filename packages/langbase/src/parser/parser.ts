import {Request} from '../common/request';
import {convertDocToFormData} from '../lib/utils/doc-to-formdata';
import {ParseOptions, ParseResponse} from './types';

/**
 * Parses a document using the Langbase API.
 *
 * @param request - The Request instance to use for API calls
 * @param options - The options for parsing the document
 * @param options.document - The document to be parsed
 * @param options.documentName - The name of the document
 * @param options.contentType - The content type of the document
 *
 * @returns A promise that resolves to the parse response from the API
 *
 * @throws {Error} If the API request fails
 */
export async function parseDocument(
	request: Request,
	options: ParseOptions,
): Promise<ParseResponse> {
	const formData = await convertDocToFormData({
		document: options.document,
		documentName: options.documentName,
		contentType: options.contentType,
	});

	const response = await fetch(`${request.baseUrl}/v1/parser`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${request.apiKey}`,
		},
		body: formData,
	});

	return response.json();
}
