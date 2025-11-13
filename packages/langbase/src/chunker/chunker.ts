import {Request} from '../common/request';
import {ChunkOptions, ChunkResponse} from './types';

/**
 * Splits a given document into multiple chunks using the Langbase API.
 *
 * @param request - The request instance for making API calls
 * @param options - The chunking options.
 * @param options.content - The content to be chunked.
 * @param options.chunkMaxLength - An optional maximum length for each chunk.
 * @param options.chunkOverlap - An optional number of overlapping characters between chunks.
 * @returns A promise that resolves to the chunked document response.
 */
export async function chunkDocument(
	request: Request,
	options: ChunkOptions,
): Promise<ChunkResponse> {
	return request.post({
		endpoint: '/v1/chunker',
		body: options,
	});
}
