import {Request} from '../common/request';

export interface MemoryOptions {
	apiKey: string;
}

interface MemoryBaseResponse {
	name: string;
	description: string;
	owner_login: string;
	url: string;
}

export interface MemoryCreateOptions {
	name: string;
	description?: string;
}

export interface MemoryDeleteOptions {
	name: string;
}

export interface MemoryRetrieveOptions {
	query: string;
	memory: {
		name: string;
	}[];
	topK?: number;
}

export interface MemoryListDocOptions {
	memoryName: string;
}

export interface MemoryDeleteDocOptions {
	memoryName: string;
	documentName: string;
}

export interface MemoryUploadDocOptions {
	memoryName: string;
	fileName: string;
	meta?: Record<string, string>;
	file: Buffer | File | FormData | ReadableStream;
	contentType:
		| 'application/pdf'
		| 'text/plain'
		| 'text/markdown'
		| 'text/csv';
}

export interface MemoryRetryDocEmbedOptions {
	memoryName: string;
	documentName: string;
}

export interface MemoryCreateResponse extends MemoryBaseResponse {}
export interface MemoryListResponse extends MemoryBaseResponse {}
export interface BaseDeleteResponse {
	success: boolean;
}

export interface MemoryDeleteResponse extends BaseDeleteResponse {}
export interface MemoryDeleteDocResponse extends BaseDeleteResponse {}
export interface MemoryRetryDocEmbedResponse extends BaseDeleteResponse {}

export interface MemoryRetrieveResponse {
	text: string;
	similarity: number;
	meta: Record<string, string>;
}

export interface MemoryListDocResponse {
	name: string;
	status: 'queued' | 'in_progress' | 'completed' | 'failed';
	status_message: string | null;
	metadata: {
		size: number;
		type: 'application/pdf' | 'text/plain' | 'text/markdown' | 'text/csv';
	};
	enabled: boolean;
	chunk_size: number;
	chunk_overlap: number;
	owner_login: string;
}

export class Memory {
	private request: Request;
	private apiKey: string;

	constructor(options: MemoryOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.apiKey = options.apiKey;
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	/**
	 * Creates a new memory on Langbase.
	 *
	 * @param {MemoryCreateOptions} options - The options to create the memory instance.
	 * @param {string} options.name - The name of the memory.
	 * @param {string} options.description - The description of the memory.
	 * @returns {Promise<MemoryCreateResponse>} A promise that resolves to the response of the memory creation.
	 */
	async create(options: MemoryCreateOptions): Promise<MemoryCreateResponse> {
		return this.request.post({
			endpoint: '/v1/memory',
			body: options,
		});
	}

	/**
	 * Retrieves a list of all memories on Langbase.
	 *
	 * @returns {Promise<MemoryListResponse[]>} A promise that resolves to an array of memory list responses.
	 */
	async list(): Promise<MemoryListResponse[]> {
		return this.request.get({
			endpoint: '/v1/memory',
		});
	}

	/**
	 * Deletes a memory on Langbase.
	 *
	 * @param {MemoryDeleteOptions} options - The options for deleting the memory resource.
	 * @param {string} options.name - The name of the memory to delete.
	 * @returns {Promise<MemoryDeleteResponse>} A promise that resolves to the response of the delete operation.
	 */
	async delete(options: MemoryDeleteOptions): Promise<MemoryDeleteResponse> {
		return this.request.delete({
			endpoint: `/v1/memory/${options.name}`,
		});
	}

	/**
	 * Retrieves similar text from the memory.
	 *
	 * @param {MemoryRetrieveOptions} options - The options to use for retrieving memory data.
	 * @param {string} options.query - The query text to search for.
	 * @param {object[]} options.memory - The memory to search in.
	 * @param {number} [options.topK] - The number of similar texts to retrieve.
	 * @returns A promise that resolves to an array of `MemoryRetrieveResponse` objects.
	 */
	async retrieve(
		options: MemoryRetrieveOptions,
	): Promise<MemoryRetrieveResponse[]> {
		return this.request.post({
			endpoint: '/v1/memory/retrieve',
			body: options,
		});
	}

	/**
	 * Retrieves a list of documents inside a memory.
	 *
	 * @param {MemoryListDocOptions} options - The options for listing documents, including the memory name.
	 * @param {string} options.memoryName - The name of the memory to list documents from.
	 * @returns A promise that resolves to an array of `MemoryListDocResponse` objects.
	 */
	async listDocs(
		options: MemoryListDocOptions,
	): Promise<MemoryListDocResponse[]> {
		return this.request.get({
			endpoint: `/v1/memory/${options.memoryName}/documents`,
		});
	}

	/**
	 * Deletes a document from a memory.
	 *
	 * @param {MemoryDeleteDocOptions} options - The options for deleting the document.
	 * @param {string} options.memoryName - The name of the memory to delete the document from.
	 * @param {string} options.documentName - The name of the document to delete.
	 * @returns A promise that resolves to a `MemoryDeleteDocResponse` indicating the result of the delete operation.
	 */
	async deleteDoc(
		options: MemoryDeleteDocOptions,
	): Promise<MemoryDeleteDocResponse> {
		return this.request.delete({
			endpoint: `/v1/memory/${options.memoryName}/documents/${options.documentName}`,
		});
	}

	/**
	 * Uploads a document to the memory.
	 *
	 * @param {MemoryUploadDocOptions} options - The options for uploading the document.
	 * @param {string} options.memoryName - The name of the memory to upload the document to.
	 * @param {string} options.fileName - The name of the file being uploaded.
	 * @param {object} [options.meta] - Optional metadata associated with the document.
	 * @param {string} options.contentType - The MIME type of the file being uploaded.
	 * @param {Blob | Buffer} options.file - The file content to be uploaded.
	 * @returns {Promise<Response>} The response from the upload request.
	 * @throws Will throw an error if the upload fails.
	 */
	async uploadDoc(
		options: MemoryUploadDocOptions,
	): Promise<Response> {
		try {
			const response = (await this.request.post({
				endpoint: `/v1/memory/documents`,
				body: {
					memoryName: options.memoryName,
					fileName: options.fileName,
					meta: options.meta,
				},
			})) as unknown as {signedUrl: string};

			const uploadUrl = response.signedUrl;

			return await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': options.contentType,
				},
				body: options.file,
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Retries the embedding process for a specific document in memory.
	 *
	 * @param options - The options required to retry the document embedding.
	 * @param options.memoryName - The name of the memory containing the document.
	 * @param options.documentName - The name of the document to retry embedding for.
	 * @returns A promise that resolves to the response of the retry operation.
	 */
	async retryDocEmbed(
		options: MemoryRetryDocEmbedOptions,
	): Promise<MemoryRetryDocEmbedResponse> {
		return this.request.get({
			endpoint: `/v1/memory/${options.memoryName}/documents/${options.documentName}/embeddings/retry`,
		});
	}
}
