import {Request} from './common/request';
import * as Pipes from './pipes';
import * as Memory from './memory';
import * as Agent from './agent';
import * as Tools from './tools';
import * as Threads from './threads';
import * as Chunker from './chunker';
import * as Embed from './embed';
import * as Parser from './parser';
import {Images} from './images';
import {Workflow} from './workflows';

// Re-export all types (with explicit named exports to avoid conflicts)
export type {
	// Pipes types
	RunOptions,
	RunOptionsT,
	RunOptionsBase,
	RunOptionsStream,
	RunOptionsStreamT,
	RunResponse,
	RunResponseStream,
	PipeListResponse,
	PipeCreateOptions,
	PipeUpdateOptions,
	PipeCreateResponse,
	PipeUpdateResponse,
	// Shared types from pipes
	Role,
	Message,
	PromptMessage,
	MessageContentType,
	Variable,
	Usage,
	ResponseFormat,
	Function,
	ToolCall,
	Tools,
	RuntimeMemory,
	ToolChoice,
	ThreadMessage,
} from './pipes/types';

export type {
	// Memory types
	MemoryCreateOptions,
	MemoryDeleteOptions,
	MemoryRetrieveOptions,
	MemoryListDocOptions,
	MemoryDeleteDocOptions,
	MemoryUploadDocOptions,
	MemoryRetryDocEmbedOptions,
	MemoryCreateResponse,
	MemoryListResponse,
	MemoryDeleteResponse,
	MemoryRetrieveResponse,
	MemoryListDocResponse,
	MemoryDeleteDocResponse,
	MemoryRetryDocEmbedResponse,
} from './memory/types';

export type {
	// Agent types
	AgentRunOptionsBase,
	AgentRunOptionsWithoutMcp,
	AgentRunOptionsWithMcp,
	AgentRunOptionsStreamT as AgentRunOptionsStream,
	AgentRunOptions,
	AgentRunResponse,
	McpServerSchema,
} from './agent/types';

export type {
	// Tools types
	ToolWebSearchOptions,
	ToolWebSearchResponse,
	ToolCrawlOptions,
	ToolCrawlResponse,
} from './tools/types';

export type {
	// Threads types
	ThreadsCreate,
	ThreadsUpdate,
	ThreadsGet,
	DeleteThreadOptions,
	ThreadsBaseResponse,
	ThreadMessagesCreate,
	ThreadMessagesList,
	ThreadMessagesBaseResponse,
} from './threads/types';

export type {
	// Chunker types
	ChunkOptions,
	ChunkResponse,
} from './chunker/types';

export type {
	// Embed types
	EmbeddingModels,
	EmbedOptions,
	EmbedResponse,
} from './embed/types';

export type {
	// Parser types
	ParseOptions,
	ParseResponse,
} from './parser/types';

// Export images and workflows
export * from './images';
export * from './workflows';

export interface LangbaseOptions {
	apiKey?: string;
	baseUrl?: string;
}

/**
 * Langbase SDK - Main client for interacting with the Langbase API
 *
 * This is a thin facade that delegates to functional primitives.
 * Each primitive (pipes, memory, agent, etc.) is implemented as pure functions.
 */
export class Langbase {
	private request: Request;
	private apiKey: string;
	private baseUrl: string;

	public pipes: {
		list: () => Promise<Pipes.PipeListResponse[]>;
		create: (options: Pipes.PipeCreateOptions) => Promise<Pipes.PipeCreateResponse>;
		update: (options: Pipes.PipeUpdateOptions) => Promise<Pipes.PipeUpdateResponse>;
		run: {
			(options: Pipes.RunOptionsStream): Promise<Pipes.RunResponseStream>;
			(options: Pipes.RunOptions): Promise<Pipes.RunResponse>;
		};
		handleToolCalls: (options: {
			response: Pipes.RunResponse;
			tools: Record<string, (args: any) => Promise<string>>;
			onComplete?: (data: {
				toolCalls: any[];
				toolResults: any[];
				finalResponse: Pipes.RunResponse;
			}) => void;
		}) => Promise<Pipes.RunResponse>;
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.pipes`
	 */
	public pipe: {
		list: () => Promise<Pipes.PipeListResponse[]>;
		create: (options: Pipes.PipeCreateOptions) => Promise<Pipes.PipeCreateResponse>;
		update: (options: Pipes.PipeUpdateOptions) => Promise<Pipes.PipeUpdateResponse>;
		run: {
			(options: Pipes.RunOptionsStream): Promise<Pipes.RunResponseStream>;
			(options: Pipes.RunOptions): Promise<Pipes.RunResponse>;
		};
		handleToolCalls: (options: {
			response: Pipes.RunResponse;
			tools: Record<string, (args: any) => Promise<string>>;
			onComplete?: (data: {
				toolCalls: any[];
				toolResults: any[];
				finalResponse: Pipes.RunResponse;
			}) => void;
		}) => Promise<Pipes.RunResponse>;
	};

	public memories: {
		create: (options: Memory.MemoryCreateOptions) => Promise<Memory.MemoryCreateResponse>;
		delete: (options: Memory.MemoryDeleteOptions) => Promise<Memory.MemoryDeleteResponse>;
		retrieve: (
			options: Memory.MemoryRetrieveOptions,
		) => Promise<Memory.MemoryRetrieveResponse[]>;
		list: () => Promise<Memory.MemoryListResponse[]>;
		documents: {
			list: (
				options: Memory.MemoryListDocOptions,
			) => Promise<Memory.MemoryListDocResponse[]>;
			delete: (
				options: Memory.MemoryDeleteDocOptions,
			) => Promise<Memory.MemoryDeleteDocResponse>;
			upload: (options: Memory.MemoryUploadDocOptions) => Promise<Response>;
			embeddings: {
				retry: (
					options: Memory.MemoryRetryDocEmbedOptions,
				) => Promise<Memory.MemoryRetryDocEmbedResponse>;
			};
		};
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.memories`
	 */
	public memory: {
		create: (options: Memory.MemoryCreateOptions) => Promise<Memory.MemoryCreateResponse>;
		delete: (options: Memory.MemoryDeleteOptions) => Promise<Memory.MemoryDeleteResponse>;
		retrieve: (
			options: Memory.MemoryRetrieveOptions,
		) => Promise<Memory.MemoryRetrieveResponse[]>;
		list: () => Promise<Memory.MemoryListResponse[]>;
		documents: {
			list: (
				options: Memory.MemoryListDocOptions,
			) => Promise<Memory.MemoryListDocResponse[]>;
			delete: (
				options: Memory.MemoryDeleteDocOptions,
			) => Promise<Memory.MemoryDeleteDocResponse>;
			upload: (options: Memory.MemoryUploadDocOptions) => Promise<Response>;
			embedding: {
				retry: (
					options: Memory.MemoryRetryDocEmbedOptions,
				) => Promise<Memory.MemoryRetryDocEmbedResponse>;
			};
		};
	};

	public threads: {
		create: (options: Threads.ThreadsCreate) => Promise<Threads.ThreadsBaseResponse>;
		update: (options: Threads.ThreadsUpdate) => Promise<Threads.ThreadsBaseResponse>;
		get: (options: Threads.ThreadsGet) => Promise<Threads.ThreadsBaseResponse>;
		delete: (options: Threads.DeleteThreadOptions) => Promise<{success: boolean}>;
		append: (
			options: Threads.ThreadMessagesCreate,
		) => Promise<Threads.ThreadMessagesBaseResponse[]>;
		messages: {
			list: (
				options: Threads.ThreadMessagesList,
			) => Promise<Threads.ThreadMessagesBaseResponse[]>;
		};
	};

	/**
	 * @deprecated This method is deprecated and will be removed in a future version.
	 *
	 * Please use `langbase.tools`
	 */
	public tool: {
		crawl: (options: Tools.ToolCrawlOptions) => Promise<Tools.ToolCrawlResponse[]>;
		webSearch: (
			options: Tools.ToolWebSearchOptions,
		) => Promise<Tools.ToolWebSearchResponse[]>;
	};

	public tools: {
		crawl: (options: Tools.ToolCrawlOptions) => Promise<Tools.ToolCrawlResponse[]>;
		webSearch: (
			options: Tools.ToolWebSearchOptions,
		) => Promise<Tools.ToolWebSearchResponse[]>;
	};

	public embed: (options: Embed.EmbedOptions) => Promise<Embed.EmbedResponse>;
	public chunk: (options: Chunker.ChunkOptions) => Promise<Chunker.ChunkResponse>;
	public chunker: (options: Chunker.ChunkOptions) => Promise<Chunker.ChunkResponse>;
	public parse: (options: Parser.ParseOptions) => Promise<Parser.ParseResponse>;
	public parser: (options: Parser.ParseOptions) => Promise<Parser.ParseResponse>;

	public agent: {
		run: {
			(options: Agent.AgentRunOptionsStream): Promise<Pipes.RunResponseStream>;
			(options: Agent.AgentRunOptions): Promise<Agent.AgentRunResponse>;
		};
	};

	public workflow: (config?: {debug?: boolean; name?: string}) => Workflow;

	public traces: {
		create: (trace: any) => Promise<any>;
	};

	public images: {
		generate: (
			options: import('./images').ImageGenerationOptions,
		) => Promise<import('./images').ImageGenerationResponse>;
	};

	constructor(options?: LangbaseOptions) {
		this.baseUrl = options?.baseUrl ?? 'https://api.langbase.com';
		this.apiKey = options?.apiKey ?? '';
		this.request = new Request({
			apiKey: this.apiKey,
			baseUrl: this.baseUrl,
		});

		// Initialize pipes - delegate to functional primitives
		this.pipes = {
			list: () => Pipes.listPipe(this.request),
			create: (options) => Pipes.createPipe(this.request, options),
			update: (options) => Pipes.updatePipe(this.request, options),
			run: ((options: any) => Pipes.runPipe(this.request, this.baseUrl, options)) as any,
			handleToolCalls: async (options) => {
				const {handleToolCalls} = await import('./lib/helpers');
				return handleToolCalls({
					...options,
					langbase: this,
				});
			},
		};

		// Deprecated pipe alias
		this.pipe = this.pipes;

		// Initialize memories - delegate to functional primitives
		this.memories = {
			create: (options) => Memory.createMemory(this.request, options),
			delete: (options) => Memory.deleteMemory(this.request, options),
			retrieve: (options) => Memory.retrieveMemory(this.request, options),
			list: () => Memory.listMemory(this.request),
			documents: {
				list: (options) => Memory.listDocs(this.request, options),
				delete: (options) => Memory.deleteDoc(this.request, options),
				upload: (options) => Memory.uploadDocs(this.request, this.apiKey, this.baseUrl, options),
				embeddings: {
					retry: (options) => Memory.retryDocEmbed(this.request, options),
				},
			},
		};

		// Deprecated memory alias
		this.memory = {
			...this.memories,
			documents: {
				...this.memories.documents,
				embedding: this.memories.documents.embeddings,
			},
		};

		// Initialize tools - delegate to functional primitives
		this.tools = {
			crawl: (options) => Tools.webCrawl(this.request, options),
			webSearch: (options) => Tools.webSearch(this.request, options),
		};

		// Deprecated tool alias
		this.tool = this.tools;

		// Initialize simple primitives - delegate to functional primitives
		this.embed = (options) => Embed.generateEmbeddings(this.request, options);
		this.chunk = (options) => Chunker.chunkDocument(this.request, options);
		this.chunker = this.chunk;
		this.parse = (options) => Parser.parseDocument(this.request, options);
		this.parser = this.parse;

		// Initialize threads - delegate to functional primitives
		this.threads = {
			create: (options) => Threads.createThread(this.request, options),
			update: (options) => Threads.updateThread(this.request, options),
			get: (options) => Threads.getThread(this.request, options),
			delete: (options) => Threads.deleteThread(this.request, options),
			append: (options) => Threads.appendThreadMessages(this.request, options),
			messages: {
				list: (options) => Threads.listThreadMessages(this.request, options),
			},
		};

		// Initialize agent - delegate to functional primitives
		this.agent = {
			run: ((options: any) => Agent.runAgent(this.request, options)) as any,
		};

		// Initialize workflow
		this.workflow = (config = {}) =>
			new Workflow({...config, langbase: this});

		// Initialize traces (placeholder - needs implementation)
		this.traces = {
			create: async (trace: any) => {
				// TODO: Implement trace creation
				return trace;
			},
		};

		// Initialize images primitive
		const imagesInstance = new Images(this.request);
		this.images = {
			generate: imagesInstance.generate.bind(imagesInstance),
		};
	}
}
