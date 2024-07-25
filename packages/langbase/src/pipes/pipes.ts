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

export type FinishReason =
	| 'stop'
	| 'length'
	| 'content-filter'
	| 'tool-calls'
	| 'error'
	| 'other'
	| 'unknown';

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

export interface GenerateTextResponse extends GenerateNonStreamResponse {
	finishReason: FinishReason;
	text: Promise<string>;
}

export interface StreamTextResponse extends GenerateStreamResponse {
	finishReason: FinishReason;
	text: Promise<string>;
	textStream: AsyncIterable<string> & ReadableStream<string>;
}

export interface PipeOptions {
	apiKey: string;
	baseUrl?: string;
}

type PublicStreamMethods<T> = Stream<T>;

export interface StreamTextResponse extends Stream<GenerateStreamChunk> {
	finishReason: FinishReason;
	text: Promise<string>;
	textStream: AsyncIterable<string> & ReadableStream<string>;
}

// Custom type that combines AsyncIterable and ReadableStream
type AsyncIterableReadableStream<T> = AsyncIterable<T> & ReadableStream<T>;

/**
 * Represents a Pipe object used for generating and streaming text.
 */
export class Pipe {
	private request: Request;

	/**
	 * Constructs a new Pipe object.
	 * @param options - The options for the Pipe.
	 */
	constructor(options: PipeOptions) {
		const baseUrl = options.baseUrl || 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	/**
	 * Generates text based on the provided options.
	 * @param options - The options for generating text.
	 * @returns A Promise that resolves to a GenerateTextResponse.
	 */
	async generateText(
		options: GenerateOptions,
	): Promise<GenerateTextResponse> {
		const response = await this.request.post<
			GenerateNonStreamResponse['raw']
		>({
			endpoint: '/beta/generate',
			body: options,
		});

		const completion = response.choices[0]?.message?.content || '';
		const finishReason: FinishReason = response.choices[0]?.message?.content
			? 'stop'
			: 'unknown';
		const text = Promise.resolve(completion);

		return {
			text,
			completion,
			raw: response,
			finishReason,
		};
	}

	/**
	 * Streams text based on the provided options.
	 * @param options - The options for streaming text.
	 * @returns A Promise that resolves to a StreamTextResponse.
	 */
	async streamText(options: GenerateOptions): Promise<StreamTextResponse> {
		const response = await this.request.post<GenerateStreamResponse>({
			endpoint: '/beta/generate',
			body: options,
			stream: true,
		});

		let finishReason: FinishReason = 'unknown';
		let fullText = '';

		const stream = new Stream<GenerateStreamChunk>(
			() => response[Symbol.asyncIterator](),
			response.controller,
		);

		const createTextStream = () =>
			new ReadableStream<string>({
				async start(controller) {
					try {
						for await (const chunk of stream) {
							const content =
								chunk.choices[0]?.delta?.content || '';
							fullText += content;
							controller.enqueue(content);
							if (
								chunk.choices[0]?.delta?.content === undefined
							) {
								finishReason = 'stop';
								controller.close();
							}
						}
					} catch (error) {
						controller.error(error);
					}
				},
			});

		const text = new Promise<string>(resolve => {
			const reader = createTextStream().getReader();
			reader.read().then(function process({done, value}): any {
				if (done) {
					resolve(fullText);
					return;
				}
				fullText += value;
				return reader.read().then(process);
			});
		});

		return Object.assign(stream, {
			finishReason,
			text,
			get textStream() {
				return {
					...createTextStream(),
					[Symbol.asyncIterator]: async function* () {
						const reader = createTextStream().getReader();
						try {
							while (true) {
								const {done, value} = await reader.read();
								if (done) break;
								yield value;
							}
						} finally {
							reader.releaseLock();
						}
					},
				};
			},
		}) as StreamTextResponse;
	}
}
