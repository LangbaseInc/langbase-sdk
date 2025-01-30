import {Request} from '../common/request';
import {
	Pipe as PipeBaseAI,
	RunOptions as RunOptionsT,
	RunOptionsStream as RunOptionsStreamT,
	RunResponse,
	RunResponseStream,
} from '@baseai/core';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

// Base types without name and apiKey
type BaseRunOptions = Omit<RunOptionsT, 'name' | 'apiKey'> & {
	messages: Message[];
	llmKey?: string;
};

// Union type for RunOptions
export type RunOptions =
	| (BaseRunOptions & {name: string; apiKey?: never})
	| (BaseRunOptions & {name?: never; apiKey: string});

// Similar structure for RunOptionsStream
type BaseRunOptionsStream = Omit<RunOptionsStreamT, 'name' | 'apiKey'> & {
	messages: Message[];
	llmKey?: string;
};

export type RunOptionsStream =
	| (BaseRunOptionsStream & {name: string; apiKey?: never})
	| (BaseRunOptionsStream & {name?: never; apiKey: string});

export interface Function {
	name: string;
	arguments: string;
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: Function;
}

export interface Message {
	role: Role;
	content: string | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface Variable {
	name: string;
	value: string;
}

interface ToolChoice {
	type: 'function';
	function: {name: string};
}

interface PipeBaseOptions {
	name: string;
	description?: string;
	status?: 'public' | 'private';
	upsert?: boolean;
	model?: string;
	stream?: boolean;
	json?: boolean;
	store?: boolean;
	moderate?: boolean;
	top_p?: number;
	max_tokens?: number;
	temperature?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	stop?: string[];
	tools?: {
		type: 'function';
		function: {
			name: string;
			description?: string;
			parameters?: Record<string, any>;
		};
	}[];
	tool_choice?: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls?: boolean;
	messages?: Message[];
	variables?: Variable[];
	memory?: {
		name: string;
	}[];
}

export interface PipeListResponse {
	name: string;
	description: string;
	status: 'public' | 'private';
	owner_login: string;
	url: string;
	model: string;
	stream: boolean;
	json: boolean;
	store: boolean;
	moderate: boolean;
	top_p: number;
	max_tokens: number;
	temperature: number;
	presence_penalty: number;
	frequency_penalty: number;
	stop: string[];
	tool_choice: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls: boolean;
	messages: Message[];
	variables: Variable[] | [];
	tools:
		| {
				type: 'function';
				function: {
					name: string;
					description?: string;
					parameters?: Record<string, any>;
				};
		  }[]
		| [];
	memory:
		| {
				name: string;
		  }[]
		| [];
}

interface PipeBaseResponse {
	name: string;
	description: string;
	status: 'public' | 'private';
	owner_login: string;
	url: string;
	type: 'chat' | 'generate' | 'run';
	api_key: string;
}

export interface PipeCreateOptions extends PipeBaseOptions {}
export interface PipeUpdateOptions extends PipeBaseOptions {}
export interface PipeCreateResponse extends PipeBaseResponse {}
export interface PipeUpdateResponse extends PipeBaseResponse {}

interface MemoryBaseResponse {
	name: string;
	description: string;
	owner_login: string;
	url: string;
}

export type EmbeddingModels =
	| 'openai:text-embedding-3-large'
	| 'cohere:embed-multilingual-v3.0'
	| 'cohere:embed-multilingual-light-v3.0'
	| 'google:text-embedding-004';

export interface MemoryCreateOptions {
	name: string;
	description?: string;
	embedding_model?: EmbeddingModels;
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
	documentName: string;
	meta?: Record<string, string>;
	document: Buffer | File | FormData | ReadableStream;
	contentType:
		| 'application/pdf'
		| 'text/plain'
		| 'text/markdown'
		| 'text/csv'
		| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		| 'application/vnd.ms-excel';
}

export interface MemoryRetryDocEmbedOptions {
	memoryName: string;
	documentName: string;
}

export interface MemoryCreateResponse extends MemoryBaseResponse {
	embedding_model: EmbeddingModels;
}
export interface MemoryListResponse extends MemoryBaseResponse {
	embedding_model: EmbeddingModels;
}
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
		type:
			| 'application/pdf'
			| 'text/plain'
			| 'text/markdown'
			| 'text/csv'
			| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			| 'application/vnd.ms-excel';
	};
	enabled: boolean;
	chunk_size: number;
	chunk_overlap: number;
	owner_login: string;
}

export interface LangbaseOptions {
	apiKey: string;
}

export interface ToolWebSearchOptions {
	query: string;
	total_results?: number;
	domains?: string[];
	apiKey?: string;
}

export interface ToolWebSearchResponse {
	url: string;
	content: string;
}

export class Langbase {
	private request: Request;
	private apiKey: string;
	public pipe: {
		list: () => Promise<PipeListResponse[]>;
		create: (options: PipeCreateOptions) => Promise<PipeCreateResponse>;
		update: (options: PipeUpdateOptions) => Promise<PipeUpdateResponse>;
		run: {
			(options: RunOptionsStream): Promise<RunResponseStream>;
			(options: RunOptions): Promise<RunResponse>;
		};
	};
	public memory: {
		create: (options: MemoryCreateOptions) => Promise<MemoryCreateResponse>;
		delete: (options: MemoryDeleteOptions) => Promise<MemoryDeleteResponse>;
		retrieve: (
			options: MemoryRetrieveOptions,
		) => Promise<MemoryRetrieveResponse[]>;
		list: () => Promise<MemoryListResponse[]>;
		documents: {
			list: (
				options: MemoryListDocOptions,
			) => Promise<MemoryListDocResponse[]>;
			delete: (
				options: MemoryDeleteDocOptions,
			) => Promise<MemoryDeleteDocResponse>;
			upload: (options: MemoryUploadDocOptions) => Promise<Response>;
			embedding: {
				retry: (
					options: MemoryRetryDocEmbedOptions,
				) => Promise<MemoryRetryDocEmbedResponse>;
			};
		};
	};

	public tool: {
		webSearch: (
			options: ToolWebSearchOptions,
		) => Promise<ToolWebSearchResponse[]>;
	};

	constructor(options?: LangbaseOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.apiKey = options?.apiKey ?? '';
		this.request = new Request({apiKey: this.apiKey, baseUrl});

		// Initialize pipe property with method bindings
		this.pipe = {
			list: this.listPipe.bind(this),
			create: this.createPipe.bind(this),
			update: this.updatePipe.bind(this),
			run: this.runPipe.bind(this),
		};

		// Initialize memory property with method bindings
		this.memory = {
			create: this.createMemory.bind(this),
			delete: this.deleteMemory.bind(this),
			retrieve: this.retrieveMemory.bind(this),
			list: this.listMemory.bind(this),
			documents: {
				list: this.listDocs.bind(this),
				delete: this.deleteDoc.bind(this),
				upload: this.uploadDocs.bind(this),
				embedding: {
					retry: this.retryDocEmbed.bind(this),
				},
			},
		};

		this.tool = {
			webSearch: this.webSearch.bind(this),
		};
	}

	private async runPipe(
		options: RunOptionsStream,
	): Promise<RunResponseStream>;
	private async runPipe(options: RunOptions): Promise<RunResponse>;
	private async runPipe(
		options: RunOptions | RunOptionsStream,
	): Promise<RunResponse | RunResponseStream> {
		if (!options.name?.trim() && !options.apiKey) {
			throw new Error(
				'Pipe name or Pipe API key is required to run the pipe.',
			);
		}

		const pipe = new PipeBaseAI({
			apiKey: options.apiKey ?? this.apiKey,
			name: options.name?.trim() || '', // Pipe name
			prod: true,
			// default values
			model: 'openai:gpt-4o-mini',
			tools: [],
		} as any);

		return await pipe.run({...options, runTools: false});
	}

	/**
	 * Creates a new pipe on Langbase.
	 *
	 * @param {PipeCreateOptions} options - The options for creating the pipe.
	 * @returns {Promise<PipeCreateResponse>} A promise that resolves to the response of the pipe creation.
	 */
	private async createPipe(
		options: PipeCreateOptions,
	): Promise<PipeCreateResponse> {
		return this.request.post({
			endpoint: '/v1/pipes',
			body: options,
		});
	}

	/**
	 * Updates a pipe on Langbase.
	 *
	 * @param {PipeUpdateOptions} options - The options for updating the pipe.
	 * @returns {Promise<PipeUpdateResponse>} A promise that resolves to the response of the update operation.
	 */
	private async updatePipe(
		options: PipeUpdateOptions,
	): Promise<PipeUpdateResponse> {
		return this.request.post({
			endpoint: `/v1/pipes/${options.name}`,
			body: options,
		});
	}

	/**
	 * Retrieves a list of pipes.
	 *
	 * @returns {Promise<PipeListResponse[]>} A promise that resolves to an array of PipeListResponse objects.
	 */
	private async listPipe(): Promise<PipeListResponse[]> {
		return this.request.get({
			endpoint: '/v1/pipes',
		});
	}

	/**
	 * Creates a new memory on Langbase.
	 *
	 * @param {MemoryCreateOptions} options - The options to create the memory instance.
	 * @param {string} options.name - The name of the memory.
	 * @param {string} options.description - The description of the memory.
	 * @returns {Promise<MemoryCreateResponse>} A promise that resolves to the response of the memory creation.
	 */
	private async createMemory(
		options: MemoryCreateOptions,
	): Promise<MemoryCreateResponse> {
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
	private async listMemory(): Promise<MemoryListResponse[]> {
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
	private async deleteMemory(
		options: MemoryDeleteOptions,
	): Promise<MemoryDeleteResponse> {
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
	private async retrieveMemory(
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
	private async listDocs(
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
	private async deleteDoc(
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
	private async uploadDocs(
		options: MemoryUploadDocOptions,
	): Promise<Response> {
		try {
			const response = (await this.request.post({
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
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': options.contentType,
				},
				body: options.document,
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
	private async retryDocEmbed(
		options: MemoryRetryDocEmbedOptions,
	): Promise<MemoryRetryDocEmbedResponse> {
		return this.request.get({
			endpoint: `/v1/memory/${options.memoryName}/documents/${options.documentName}/embeddings/retry`,
		});
	}

	/**
	 * Performs a web search using the Langbase API.
	 *
	 * @param options - Web search configuration options
	 * @param options.apiKey - Optional API key for web search authentication
	 * @returns Promise that resolves to an array of web search results
	 */
	private async webSearch(
		options: ToolWebSearchOptions,
	): Promise<ToolWebSearchResponse[]> {
		return this.request.post({
			endpoint: '/v1/tools/web-search',
			body: options,
			headers: {
				...(options.apiKey && {
					'LB-WEB-SEARCH-KEY': options.apiKey,
				}),
			},
		});
	}
}
