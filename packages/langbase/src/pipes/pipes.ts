import {Request} from '../common/request';
import {Stream} from '../common/stream';
import {
	Pipe as PipeBaseAI,
	RunOptions,
	RunOptionsStream,
	RunResponse,
	RunResponseStream,
} from '@baseai/core';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

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

interface BaseOptions {
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

interface BaseResponse {
	name: string;
	description: string;
	status: 'public' | 'private';
	owner_login: string;
	url: string;
}

export interface CreateOptions extends BaseOptions {}
export interface UpdateOptions extends BaseOptions {}
export interface CreateResponse extends BaseResponse {}
export interface UpdateResponse extends BaseResponse {}

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
		if (!this.pipeOptions.name) {
			throw new Error(
				'Pipe name is required with run. Please provide pipe name when creating Pipe instance.',
			);
		}
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

	async create(options: CreateOptions): Promise<CreateResponse> {
		return this.request.post({
			endpoint: '/v1/pipes',
			body: options,
		});
	}

	async update(options: UpdateOptions): Promise<UpdateResponse> {
		return this.request.post({
			endpoint: `/v1/pipes/${options.name}`,
			body: options,
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
