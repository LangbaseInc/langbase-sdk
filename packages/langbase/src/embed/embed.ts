import {Request} from '../common/request';
import {EmbedOptions, EmbedResponse} from './types';

/**
 * Generates embeddings for the given input using the Langbase API.
 *
 * @param request - The Request instance for making API calls
 * @param options - Embed options
 * @param options.chunks - Array of text chunks to generate embeddings for
 * @param options.embeddingModel - Optional embedding model to use
 * @returns Promise that resolves to the embedding response containing vector representations
 */
export async function generateEmbeddings(
	request: Request,
	options: EmbedOptions,
): Promise<EmbedResponse> {
	return request.post({
		endpoint: '/v1/embed',
		body: options,
	});
}
