import {Request} from '../common/request';
import {Stream} from '../common/stream';

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface GenerateOptions {
	messages: Message[];
	model?: string;
	temperature?: number;
	max_tokens?: number;
}

export interface Choice {
	index: number;
	delta?: {
		content?: string;
	};
	message?: Message;
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
		choices: Choice[];
		usage: Usage;
		system_fingerprint: string | null;
	};
}

export interface GenerateStreamChunk {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Choice[];
}

export type GenerateStreamResponse = Stream<GenerateStreamChunk>;

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
