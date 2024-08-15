import {Request} from '../common/request';
import {Stream} from '../common/stream';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
	role: Role;
	content: string | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: {
		id: string;
		type: 'function';
		function: Record<string, any>;
	}[];
}

export interface GenerateOptions {
	messages: Message[];
}

interface ChoiceNonStream {
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
}

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface GenerateNonStreamResponse {
	completion: string;
	raw: {
		id: string;
		object: string;
		created: number;
		model: string;
		choices: ChoiceNonStream[];
		usage: Usage;
		system_fingerprint: string | null;
	};
}

export type GenerateStreamResponse = Stream<GenerateStreamChunk>;

export interface GenerateStreamChunk {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceStream[];
}

export interface PipeOptions {
	apiKey: string;
	baseUrl?: string;
}

export class Pipe {
	private request: Request;

	constructor(options: PipeOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	async generateText(
		options: GenerateOptions,
	): Promise<GenerateNonStreamResponse> {
		return this.request.post<GenerateNonStreamResponse>({
			endpoint: '/beta/generate',
			body: options,
		});
	}

	async streamText(
		options: GenerateOptions,
	): Promise<GenerateStreamResponse> {
		return this.request.post<GenerateStreamResponse>({
			endpoint: '/beta/generate',
			body: {...options, stream: true},
			stream: true, // TODO: @ahmadbilaldev - why we need to add here as well?
		});
	}
}
