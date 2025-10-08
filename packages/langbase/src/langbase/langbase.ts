import {convertDocToFormData} from '@/lib/utils/doc-to-formdata';
import {Request} from '../common/request';
import {Workflow} from './workflows';
import {
	Images,
	ImageGenerationOptions,
	ImageGenerationResponse,
} from './images';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface RunOptionsBase {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string;
	rawResponse?: boolean;
	runTools?: boolean;
	tools?: Tools[];
	name?: string; // Pipe name for SDK,
	apiKey?: string; // pipe level key for SDK
	llmKey?: string; // LLM API key
	json?: boolean;
	memory?: RuntimeMemory;
}

export interface RunOptionsT extends RunOptionsBase {
	stream?: false;
}

export interface RunOptionsStreamT extends RunOptionsBase {
	stream: true;
}

export interface AgentRunOptionsBase {
	input: string | PromptMessage[];
	instructions?: string | null;
	model: string;
	apiKey: string;
	top_p?: number;
	max_tokens?: number;
	temperature?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	stop?: string[];
	tools?: Tools[];
	tool_choice?: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls?: boolean;
	mcp_servers?: McpServerSchema[];
	reasoning_effort?: string | null;
	max_completion_tokens?: number;
	response_format?: ResponseFormat;
	customModelParams?: Record<string, any>;
}

export type AgentRunOptionsWithoutMcp = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream?: false;
};

export type AgentRunOptionsWithMcp = AgentRunOptionsBase & {
	mcp_servers: McpServerSchema[];
	stream: false;
};

export type AgentRunOptionsStreamT = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream: true;
};

export type AgentRunOptions =
	| AgentRunOptionsWithoutMcp
	| AgentRunOptionsWithMcp;
export type AgentRunOptionsStream = AgentRunOptionsStreamT;

export interface McpServerSchema {
	name: string;
	type: 'url';
	url: string;
	authorization_token?: string;
	tool_configuration?: {
		allowed_tools?: string[];
		enabled?: boolean;
	};
	custom_headers?: Record<string, string>;
}

interface ChoiceGenerate {
	index: number;
	message: Message;
	logprobs: boolean | null;
	finish_reason: string;
}

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface RunResponse {
	completion: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

export interface AgentRunResponse {
	output: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

export interface RunResponseStream {
	stream: ReadableStream<any>;
	threadId: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

// Union type for RunOptions
export type RunOptions =
	| (RunOptionsT & {name: string; apiKey?: never})
	| (RunOptionsT & {name?: never; apiKey: string});

export type RunOptionsStream =
	| (RunOptionsStreamT & {name: string; apiKey?: never})
	| (RunOptionsStreamT & {name?: never; apiKey: string});

export interface Function {
	name: string;
	arguments: string;
}

export type RuntimeMemory = {
	name: string;
}[];

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

// Message with proper content type for Vision support
export interface PromptMessage {
	role: Role;
	content: string | MessageContentType[] | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface MessageContentType {
	type: string;
	text?: string;
	image_url?: {
		url: string;
		detail?: string;
	};
	cache_control?: {
		type: 'ephemeral';
	};
}

export type ResponseFormat =
	| {type: 'text'}
	| {type: 'json_object'}
	| {
			type: 'json_schema';
			json_schema: {
				description?: string;
				name: string;
				schema?: Record<string, unknown>;
				strict?: boolean | null;
			};
	  };

export interface ThreadMessage extends Message {
	attachments?: any[];
	metadata?: Record<string, string>;
}

export interface Variable {
	name: string;
	value: string;
}

interface ToolChoice {
	type: 'function';
	function: {name: string};
}

export interface Tools {
	type: 'function';
	function: {
		name: string;
		description?: string;
		parameters?: Record<string, any>;
	};
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
	tools?: Tools[];
	tool_choice?: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls?: boolean;
	messages?: Message[];
	variables?: Variable[] | Record<string, string>;
	memory?: {
		name: string;
	}[];
	response_format?: ResponseFormat;
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
	tools: Tools[] | [];
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

export type ContentType =
	| 'application/pdf'
	| 'text/plain'
	| 'text/markdown'
	| 'text/csv'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/vnd.ms-excel';

export interface MemoryCreateOptions {
	name: string;
	description?: string;
	embedding_model?: EmbeddingModels;
	top_k?: number;
	chunk_size?: number;
	chunk_overlap?: number;
}

export interface MemoryDeleteOptions {
	name: string;
}

type FilterOperator = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'And' | 'Or';
type FilterConnective = 'And' | 'Or';
type FilterValue = string | string[];
type FilterCondition = [string, FilterOperator, FilterValue];
type MemoryFilters = [FilterConnective, MemoryFilters[]] | FilterCondition;

export interface MemoryRetrieveOptions {
	query: string;
	memory: {
		name: string;
		filters?: MemoryFilters;
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
	contentType: ContentType;
}

export interface MemoryRetryDocEmbedOptions {
	memoryName: string;
	documentName: string;
}

export interface MemoryCreateResponse extends MemoryBaseResponse {
	chunk_size: number;
	chunk_overlap: number;
	embedding_model: EmbeddingModels;
}
export interface MemoryListResponse extends MemoryBaseResponse {
	embeddingModel: EmbeddingModels;
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
		type: ContentType;
	};
	enabled: boolean;
	chunk_size: number;
	chunk_overlap: number;
	owner_login: string;
}

export interface LangbaseOptions {
	apiKey: string;
	baseUrl?: 'https://api.langbase.com' | 'https://eu-api.langbase.com';
}

export interface ToolWebSearchOptions {
	query: string;
	service: 'exa';
	totalResults?: number;
	domains?: string[];
	apiKey: string;
}

export interface ToolWebSearchResponse {
	url: string;
	content: string;
}

export interface ToolCrawlOptions {
	url: string[];
	maxPages?: number;
	apiKey: string;
	service?: 'spider' | 'firecrawl';
}

export interface ToolCrawlResponse {
	url: string;
	content: string;
}

export interface EmbedOptions {
	chunks: string[];
	embeddingModel?: EmbeddingModels;
}

export type EmbedResponse = number[][];

export interface ChunkOptions {
	content: string;
	chunkOverlap?: number;
	chunkMaxLength?: number;
}

export type ChunkResponse = string[];

export type ParseOptions = {
	document: Buffer | File | FormData | ReadableStream;
	documentName: string;
	contentType: ContentType;
};

export type ParseResponse = {
	documentName: string;
	content: string;
};

export interface ThreadsCreate {
	threadId?: string;
	metadata?: Record<string, string>;
	messages?: ThreadMessage[];
}

export interface ThreadsUpdate {
	threadId: string;
	metadata: Record<string, string>;
}

export interface ThreadsGet {
	threadId: string;
}

export interface DeleteThreadOptions {
	threadId: string;
}

export interface ThreadsBaseResponse {
	id: string;
	object: 'thread';
	created_at: number;
	metadata: Record<string, string>;
}

export interface ThreadMessagesCreate {
	threadId: string;
	messages: ThreadMessage[];
}

export interface ThreadMessagesList {
	threadId: string;
}

export interface ThreadMessagesBaseResponse {
	id: string;
	created_at: number;
	thread_id: string;
	content: string;
	role: Role;
	tool_call_id: string | null;
	tool_calls: ToolCall[] | [];
	name: string | null;
	attachments: any[] | [];
	metadata: Record<string, string> | {};
}

interface ChoiceGenerate {
	index: number;
	message: Message;
	logprobs: boolean | null;
	finish_reason: string;
}

export class Langbase {
	private request: Request;
	private apiKey: string;
	private baseUrl: string;
	public pipes: {
		list: () => Promise<PipeListResponse[]>;
		create: (options: PipeCreateOptions) => Promise<PipeCreateResponse>;
		update: (options: PipeUpdateOptions) => Promise<PipeUpdateResponse>;
		run: {
			(options: RunOptionsStream): Promise<RunResponseStream>;
			(options: RunOptions): Promise<RunResponse>;
		};
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.pipes`
	 */
	public pipe: {
		list: () => Promise<PipeListResponse[]>;
		create: (options: PipeCreateOptions) => Promise<PipeCreateResponse>;
		update: (options: PipeUpdateOptions) => Promise<PipeUpdateResponse>;
		run: {
			(options: RunOptionsStream): Promise<RunResponseStream>;
			(options: RunOptions): Promise<RunResponse>;
		};
	};

	public memories: {
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
			embeddings: {
				retry: (
					options: MemoryRetryDocEmbedOptions,
				) => Promise<MemoryRetryDocEmbedResponse>;
			};
		};
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.memories`
	 */
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

	public threads: {
		create: (options: ThreadsCreate) => Promise<ThreadsBaseResponse>;
		update: (options: ThreadsUpdate) => Promise<ThreadsBaseResponse>;
		get: (options: ThreadsGet) => Promise<ThreadsBaseResponse>;
		delete: (options: DeleteThreadOptions) => Promise<{success: boolean}>;
		append: (
			options: ThreadMessagesCreate,
		) => Promise<ThreadMessagesBaseResponse[]>;
		messages: {
			list: (
				options: ThreadMessagesList,
			) => Promise<ThreadMessagesBaseResponse[]>;
		};
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.tools`
	 */
	public tool: {
		crawl: (options: ToolCrawlOptions) => Promise<ToolCrawlResponse[]>;
		webSearch: (
			options: ToolWebSearchOptions,
		) => Promise<ToolWebSearchResponse[]>;
	};

	public tools: {
		crawl: (options: ToolCrawlOptions) => Promise<ToolCrawlResponse[]>;
		webSearch: (
			options: ToolWebSearchOptions,
		) => Promise<ToolWebSearchResponse[]>;
	};

	public embed: (options: EmbedOptions) => Promise<EmbedResponse>;
	public chunk: (options: ChunkOptions) => Promise<ChunkResponse>;
	public chunker: (options: ChunkOptions) => Promise<ChunkResponse>;
	public parse: (options: ParseOptions) => Promise<ParseResponse>;
	public parser: (options: ParseOptions) => Promise<ParseResponse>;

	public agent: {
		run: {
			(options: AgentRunOptionsStream): Promise<RunResponseStream>;
			(options: AgentRunOptions): Promise<AgentRunResponse>;
		};
	};

	public workflow: (config?: {debug?: boolean; name?: string}) => Workflow;

	public traces: {
		create: (trace: any) => Promise<any>;
	};

	public images: {
		generate: (
			options: ImageGenerationOptions,
		) => Promise<ImageGenerationResponse>;
	};

	constructor(options?: LangbaseOptions) {
		this.baseUrl = options?.baseUrl ?? 'https://api.langbase.com';
		this.apiKey = options?.apiKey ?? '';
		this.request = new Request({
			apiKey: this.apiKey,
			baseUrl: this.baseUrl,
		});

		// Initialize pipe property with method bindings
		this.pipe = {
			list: this.listPipe.bind(this),
			create: this.createPipe.bind(this),
			update: this.updatePipe.bind(this),
			run: this.runPipe.bind(this),
		};

		this.pipes = {
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

		// Initialize memory property with method bindings
		this.memories = {
			create: this.createMemory.bind(this),
			delete: this.deleteMemory.bind(this),
			retrieve: this.retrieveMemory.bind(this),
			list: this.listMemory.bind(this),
			documents: {
				list: this.listDocs.bind(this),
				delete: this.deleteDoc.bind(this),
				upload: this.uploadDocs.bind(this),
				embeddings: {
					retry: this.retryDocEmbed.bind(this),
				},
			},
		};

		this.tools = {
			crawl: this.webCrawl.bind(this),
			webSearch: this.webSearch.bind(this),
		};

		this.tool = {
			crawl: this.webCrawl.bind(this),
			webSearch: this.webSearch.bind(this),
		};

		this.embed = this.generateEmbeddings.bind(this);
		this.chunk = this.chunkDocument.bind(this);
		this.chunker = this.chunkDocument.bind(this);
		this.parse = this.parseDocument.bind(this);
		this.parser = this.parseDocument.bind(this);
		this.threads = {
			create: this.createThread.bind(this),
			update: this.updateThread.bind(this),
			get: this.getThread.bind(this),
			delete: this.deleteThread.bind(this),
			append: this.appendThreadMessages.bind(this),
			messages: {
				list: this.listThreadMessages.bind(this),
			},
		};

		this.agent = {
			run: this.runAgent.bind(this),
		};

		this.workflow = (config = {}) =>
			new Workflow({...config, langbase: this});

		this.traces = {
			create: this.createTrace.bind(this),
		};

		// Initialize images primitive
		const imagesInstance = new Images(this.request);
		this.images = {
			generate: imagesInstance.generate.bind(imagesInstance),
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

		// Remove stream property if it's not set to true
		if (typeof options.stream === 'undefined') {
			delete options.stream;
		}

		// if apikey is provided, create a new request instance
		if (options.apiKey) {
			this.request = new Request({
				apiKey: options.apiKey,
				baseUrl: this.baseUrl,
			});
		}

		return this.request.post({
			endpoint: '/v1/pipes/run',
			body: options,
			headers: {
				...(options.llmKey && {
					'LB-LLM-KEY': options.llmKey,
				}),
			},
		});
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
				body: options.document as any,
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
				'LB-WEB-SEARCH-KEY': options.apiKey,
			},
		});
	}

	/**
	 * Performs a web crawls on target websites using the Langbase API.
	 *
	 * @param options - Crawl configuration options
	 * @returns An array of responses containing data from the crawl operation.
	 */
	private async webCrawl(
		options: ToolCrawlOptions,
	): Promise<ToolCrawlResponse[]> {
		return this.request.post({
			endpoint: '/v1/tools/crawl',
			body: options,
			headers: {
				'LB-CRAWL-KEY': options.apiKey,
			},
		});
	}

	/**
	 * Generates embeddings for the given input using the LangBase API.
	 *
	 * @param options - Embed options
	 * @returns Promise that resolves to the embedding response containing vector representations
	 */
	private async generateEmbeddings(
		options: EmbedOptions,
	): Promise<EmbedResponse> {
		return this.request.post({
			endpoint: '/v1/embed',
			body: options,
		});
	}

	/**
	 * Splits a given document into multiple chunks using the Langbase API.
	 *
	 * @param options - The chunking options.
	 * @param options.document - The document to be chunked.
	 * @param options.chunk_max_length - An optional maximum length for each chunk.
	 * @param options.chunk_overlap - An optional number of overlapping characters between chunks.
	 * @param options.separator - An optional separator used to split the document.
	 * @returns A promise that resolves to the chunked document response.
	 */
	private async chunkDocument(options: ChunkOptions): Promise<ChunkResponse> {
		return this.request.post({
			endpoint: '/v1/chunker',
			body: options,
		});
	}

	/**
	 * Parses a document using the Langbase API.
	 *
	 * @param options - The options for parsing the document
	 * @param options.document - The document to be parsed
	 * @param options.documentName - The name of the document
	 * @param options.contentType - The content type of the document
	 *
	 * @returns A promise that resolves to the parse response from the API
	 *
	 * @throws {Error} If the API request fails
	 */
	private async parseDocument(options: ParseOptions): Promise<ParseResponse> {
		const formData = await convertDocToFormData({
			document: options.document,
			documentName: options.documentName,
			contentType: options.contentType,
		});

		const response = await fetch(`${this.baseUrl}/v1/parser`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: formData,
		});

		return response.json();
	}

	/**
	 * Creates a new thread with specified options.
	 * @param {ThreadsCreate} options - The options object containing thread creation parameters.
	 * @returns {Promise<ThreadsBaseResponse>} A promise that resolves to the created thread response.
	 * @private
	 */
	private async createThread(
		options: ThreadsCreate,
	): Promise<ThreadsBaseResponse> {
		return this.request.post({
			endpoint: '/v1/threads',
			body: options,
		});
	}

	/**
	 * Updates an existing thread with the provided options.
	 *
	 * @param options - The options to update the thread with
	 * @param options.threadId - The ID of the thread to update
	 * @returns A promise that resolves to the updated thread response
	 * @throws {Error} If the request fails
	 */
	private async updateThread(
		options: ThreadsUpdate,
	): Promise<ThreadsBaseResponse> {
		return this.request.post({
			endpoint: `/v1/threads/${options.threadId}`,
			body: options,
		});
	}

	/**
	 * Retrieves a thread by its ID.
	 * @param {ThreadsGet} options - The options object containing the thread ID.
	 * @param {string} options.threadId - The unique identifier of the thread to retrieve.
	 * @returns {Promise<ThreadsBaseResponse>} A promise that resolves to the thread data.
	 */
	private async getThread(options: ThreadsGet): Promise<ThreadsBaseResponse> {
		return this.request.get({
			endpoint: `/v1/threads/${options.threadId}`,
		});
	}

	private async deleteThread(
		options: DeleteThreadOptions,
	): Promise<{success: boolean}> {
		return this.request.delete({
			endpoint: `/v1/threads/${options.threadId}`,
		});
	}

	private async appendThreadMessages(
		options: ThreadMessagesCreate,
	): Promise<ThreadMessagesBaseResponse[]> {
		return this.request.post({
			endpoint: `/v1/threads/${options.threadId}/messages`,
			body: options.messages,
		});
	}

	private async listThreadMessages(
		options: ThreadMessagesList,
	): Promise<ThreadMessagesBaseResponse[]> {
		return this.request.get({
			endpoint: `/v1/threads/${options.threadId}/messages`,
		});
	}

	// Add the private implementation
	private async runAgent(
		options: AgentRunOptionsStream,
	): Promise<RunResponseStream>;

	private async runAgent(options: AgentRunOptions): Promise<AgentRunResponse>;

	private async runAgent(
		options: AgentRunOptions | AgentRunOptionsStream,
	): Promise<AgentRunResponse | RunResponseStream> {
		if (!options.apiKey) {
			throw new Error('LLM API key is required to run this LLM.');
		}

		// Remove stream property if it's not set to true
		if (typeof options.stream === 'undefined') {
			delete options.stream;
		}

		return this.request.post({
			endpoint: '/v1/agent/run',
			body: options,
			headers: {
				...(options.apiKey && {'LB-LLM-Key': options.apiKey}),
			},
		});
	}

	/**
	 * Creates a new trace on Langbase.
	 *
	 * @param {any} trace - The trace data to send.
	 * @returns {Promise<any>} A promise that resolves to the response of the trace creation.
	 */
	private async createTrace(trace: any): Promise<any> {
		return this.request.post({
			endpoint: '/v1/traces',
			body: trace,
		});
	}
}
