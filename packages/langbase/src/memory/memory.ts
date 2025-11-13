import {Request} from '../common/request';
import type {
	MemoryCreateOptions,
	MemoryCreateResponse,
	MemoryDeleteOptions,
	MemoryDeleteResponse,
	MemoryListResponse,
	MemoryRetrieveOptions,
	MemoryRetrieveResponse,
	MemoryListDocOptions,
	MemoryListDocResponse,
	MemoryDeleteDocOptions,
	MemoryDeleteDocResponse,
	MemoryUploadDocOptions,
	MemoryRetryDocEmbedOptions,
	MemoryRetryDocEmbedResponse,
} from './types';

/**
 * Creates a new memory on Langbase.
 *
 * @param {Request} request - The request instance
 * @param {MemoryCreateOptions} options - The options to create the memory instance.
 * @param {string} options.name - The name of the memory.
 * @param {string} options.description - The description of the memory.
 * @param {string} options.embedding_model - The embedding model to use.
 * @param {number} options.top_k - The top K similar items to retrieve.
 * @param {number} options.chunk_size - The size of each chunk.
 * @param {number} options.chunk_overlap - The overlap between chunks.
 * @returns {Promise<MemoryCreateResponse>} A promise that resolves to the response of the memory creation.
 */
export async function createMemory(
	request: Request,
	options: MemoryCreateOptions,
): Promise<MemoryCreateResponse> {
	return request.post({
		endpoint: '/v1/memory',
		body: options,
	});
}

/**
 * Retrieves a list of all memories on Langbase.
 *
 * @param {Request} request - The request instance
 * @returns {Promise<MemoryListResponse[]>} A promise that resolves to an array of memory list responses.
 */
export async function listMemory(
	request: Request,
): Promise<MemoryListResponse[]> {
	return request.get({
		endpoint: '/v1/memory',
	});
}

/**
 * Deletes a memory on Langbase.
 *
 * @param {Request} request - The request instance
 * @param {MemoryDeleteOptions} options - The options for deleting the memory resource.
 * @param {string} options.name - The name of the memory to delete.
 * @returns {Promise<MemoryDeleteResponse>} A promise that resolves to the response of the delete operation.
 */
export async function deleteMemory(
	request: Request,
	options: MemoryDeleteOptions,
): Promise<MemoryDeleteResponse> {
	return request.delete({
		endpoint: `/v1/memory/${options.name}`,
	});
}

/**
 * Retrieves similar text from the memory.
 *
 * @param {Request} request - The request instance
 * @param {MemoryRetrieveOptions} options - The options to use for retrieving memory data.
 * @param {string} options.query - The query text to search for.
 * @param {object[]} options.memory - The memory to search in.
 * @param {number} [options.topK] - The number of similar texts to retrieve.
 * @returns A promise that resolves to an array of `MemoryRetrieveResponse` objects.
 */
export async function retrieveMemory(
	request: Request,
	options: MemoryRetrieveOptions,
): Promise<MemoryRetrieveResponse[]> {
	return request.post({
		endpoint: '/v1/memory/retrieve',
		body: options,
	});
}

/**
 * Retrieves a list of documents inside a memory.
 *
 * @param {Request} request - The request instance
 * @param {MemoryListDocOptions} options - The options for listing documents, including the memory name.
 * @param {string} options.memoryName - The name of the memory to list documents from.
 * @returns A promise that resolves to an array of `MemoryListDocResponse` objects.
 */
export async function listDocs(
	request: Request,
	options: MemoryListDocOptions,
): Promise<MemoryListDocResponse[]> {
	return request.get({
		endpoint: `/v1/memory/${options.memoryName}/documents`,
	});
}

/**
 * Deletes a document from a memory.
 *
 * @param {Request} request - The request instance
 * @param {MemoryDeleteDocOptions} options - The options for deleting the document.
 * @param {string} options.memoryName - The name of the memory to delete the document from.
 * @param {string} options.documentName - The name of the document to delete.
 * @returns A promise that resolves to a `MemoryDeleteDocResponse` indicating the result of the delete operation.
 */
export async function deleteDoc(
	request: Request,
	options: MemoryDeleteDocOptions,
): Promise<MemoryDeleteDocResponse> {
	return request.delete({
		endpoint: `/v1/memory/${options.memoryName}/documents/${options.documentName}`,
	});
}

/**
 * Uploads a document to the memory.
 *
 * @param {Request} request - The request instance
 * @param {string} apiKey - The API key for authentication
 * @param {string} baseUrl - The base URL for the API
 * @param {MemoryUploadDocOptions} options - The options for uploading the document.
 * @param {string} options.memoryName - The name of the memory to upload the document to.
 * @param {string} options.documentName - The name of the file being uploaded.
 * @param {object} [options.meta] - Optional metadata associated with the document.
 * @param {string} options.contentType - The MIME type of the file being uploaded.
 * @param {Blob | Buffer | FormData | ReadableStream} options.document - The file content to be uploaded.
 * @returns {Promise<Response>} The response from the upload request.
 * @throws Will throw an error if the upload fails.
 */
export async function uploadDocs(
	request: Request,
	apiKey: string,
	baseUrl: string,
	options: MemoryUploadDocOptions,
): Promise<Response> {
	try {
		const response = (await request.post({
			endpoint: `/v1/memory/documents`,
			body: {
				memoryName: options.memoryName,
				fileName: options.documentName,
				meta: options.meta,
			},
		})) as unknown as {signedUrl: string};

		const uploadUrl = response.signedUrl;

		return await fetch(uploadUrl, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': options.contentType,
			},
			body: options.document as any,
		});
	} catch (error) {
		throw error;
	}
}

/**
 * Retries the embedding process for a specific document in memory.
 *
 * @param {Request} request - The request instance
 * @param {MemoryRetryDocEmbedOptions} options - The options required to retry the document embedding.
 * @param {string} options.memoryName - The name of the memory containing the document.
 * @param {string} options.documentName - The name of the document to retry embedding for.
 * @returns A promise that resolves to the response of the retry operation.
 */
export async function retryDocEmbed(
	request: Request,
	options: MemoryRetryDocEmbedOptions,
): Promise<MemoryRetryDocEmbedResponse> {
	return request.get({
		endpoint: `/v1/memory/${options.memoryName}/documents/${options.documentName}/embeddings/retry`,
	});
}
