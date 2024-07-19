import {Stream} from './stream'; // Assuming the Stream class is in a file named stream.ts

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
	private apiKey: string;
	private baseUrl: string;

	constructor(options: PipeOptions) {
		this.apiKey = options.apiKey;
		this.baseUrl = options.baseUrl || 'https://api.langbase.com';
	}

	async generateText(
		options: GenerateOptions,
	): Promise<GenerateNonStreamResponse> {
		const {messages} = options;

		const response = await fetch(`${this.baseUrl}/beta/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				messages,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return (await response.json()) as GenerateNonStreamResponse;
	}

	async streamText(
		options: GenerateOptions,
	): Promise<GenerateStreamResponse> {
		const {messages} = options;

		const response = await fetch(`${this.baseUrl}/beta/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				messages,
				stream: true,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const controller = new AbortController();
		return Stream.fromSSEResponse<GenerateStreamChunk>(
			response,
			controller,
		);
	}
}
