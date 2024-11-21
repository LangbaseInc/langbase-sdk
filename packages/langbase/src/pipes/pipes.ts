import {Request} from '../common/request';
import {Stream} from '../common/stream';
import {
	Pipe as PipeBaseAI,
	RunOptions as RunOptionsT,
	RunOptionsStream as RunOptionsStreamT,
	RunResponse,
	RunResponseStream,
} from '@baseai/core';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface RunOptions extends RunOptionsT {
	name: string;
}

export interface RunOptionsStream extends RunOptionsStreamT {
	name: string;
}

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
	name?: 'json' | 'safety' | 'opening' | 'rag';
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface Variable {
	name: string;
	value: string;
}

export interface GenerateOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string;
	chat?: boolean;
}

export interface StreamOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string | null;
	chat?: boolean;
}

interface ChoiceGenerate {
	index: number;
	message: Message;
	logprobs: boolean | null;
	finish_reason: string;
}

interface ChoiceStream {
	index: number;
	delta: Delta;
	logprobs: boolean | null;
	finish_reason: string;
}

interface Delta {
	role?: Role;
	content?: string;
	tool_calls?: ToolCall[];
}

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface GenerateResponse {
	completion: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
}

export type StreamText = Stream<StreamChunk>;

export interface StreamResponse {
	stream: StreamText;
	threadId: string | null;
}

export interface StreamChunk {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceStream[];
}

export interface PipeOptions {
	apiKey: string;
	baseUrl?: string;
	name?: string;
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

export class Pipe {
	private request: Request;
	private pipe: PipeBaseAI;
	private pipeOptions;

	constructor(options: PipeOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
		this.pipeOptions = options;

		this.pipe = new PipeBaseAI({
			apiKey: options.apiKey, // Langbase API key
			name: options.name?.trim() || '', // Pipe name
			prod: true,
			// default values
			model: 'openai:gpt-4o-mini',
			tools: [],
		} as any);
	}

	public async run(options: RunOptionsStream): Promise<RunResponseStream>;
	public async run(options: RunOptions): Promise<RunResponse>;
	public async run(
		options: RunOptions | RunOptionsStream,
	): Promise<RunResponse | RunResponseStream> {
		return await this.pipe.run({...options, runTools: false});
	}

	async generateText(options: GenerateOptions): Promise<GenerateResponse> {
		return this.request.post<GenerateResponse>({
			endpoint: options.chat ? '/beta/chat' : '/beta/generate',
			body: {...options, stream: false},
		});
	}

	async streamText(options: StreamOptions): Promise<StreamResponse> {
		return this.request.post<StreamResponse>({
			endpoint: options.chat ? '/beta/chat' : '/beta/generate',
			body: {...options, stream: true},
		});
	}

	/**
	 * Creates a new pipe on Langbase.
	 *
	 * @param {PipeCreateOptions} options - The options for creating the pipe.
	 * @returns {Promise<PipeCreateResponse>} A promise that resolves to the response of the pipe creation.
	 */
	async create(options: PipeCreateOptions): Promise<PipeCreateResponse> {
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
	async update(options: PipeUpdateOptions): Promise<PipeUpdateResponse> {
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
	async list(): Promise<PipeListResponse[]> {
		return this.request.get({
			endpoint: '/v1/pipes',
		});
	}
}

/**
 * Print stream to standard output (console).
 * @param stream The stream to print
 */
export const printStreamToStdout = async (
	stream: StreamText,
): Promise<void> => {
	for await (const chunk of stream) {
		const textPart = chunk.choices[0]?.delta?.content || '';
		process.stdout.write(textPart);
	}
};
