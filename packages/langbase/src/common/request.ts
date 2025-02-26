import {Headers} from './../../types'; // Ensure this import is correct
import {APIConnectionError, APIError} from './errors';
import {Stream} from './stream';

interface RequestOptions {
	endpoint: string;
	method: string;
	headers?: Headers;
	body?: any;
	stream?: boolean;
}

interface RequestConfig {
	apiKey: string;
	baseUrl: string;
	timeout?: number;
}

interface SendOptions extends RequestOptions {
	endpoint: string;
}

interface MakeRequestParams {
	url: string;
	options: RequestOptions;
	headers: Record<string, string>;
}

interface HandleGenerateResponseParams {
	response: Response;
	threadId: string | null;
	rawResponse: boolean;
}

export class Request {
	private config: RequestConfig;

	constructor(config: RequestConfig) {
		this.config = config;
	}

	// Main send function
	private async send<T>({endpoint, ...options}: SendOptions): Promise<T> {
		const url = this.buildUrl({endpoint});
		const headers = this.buildHeaders({headers: options.headers});

		let response: Response;
		try {
			response = await this.makeRequest({url, options, headers});
		} catch (error) {
			throw new APIConnectionError({
				cause: error instanceof Error ? error : undefined,
			});
		}

		if (!response.ok) {
			await this.handleErrorResponse({response});
		}

		if (!options.body) {
			return this.handleRunResponse({
				response,
				threadId: null,
				rawResponse: options.body?.rawResponse ?? false,
			});
		}

		const threadId = response.headers.get('lb-thread-id');

		if (options.body?.stream && url.includes('run')) {
			return this.handleRunResponseStream({
				response,
				rawResponse: options.body.rawResponse,
			}) as T;
		}

		if (options.body.stream) {
			return this.handleStreamResponse({response}) as T;
		}

		return this.handleRunResponse({
			response,
			threadId,
			rawResponse: options.body?.rawResponse ?? false,
		});
	}

	private buildUrl({endpoint}: {endpoint: string}): string {
		return `${this.config.baseUrl}${endpoint}`;
	}

	private buildHeaders({
		headers,
	}: {
		headers?: Record<string, string>;
	}): Record<string, string> {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.config.apiKey}`,
			...headers,
		};
	}

	private async makeRequest({
		url,
		options,
		headers,
	}: MakeRequestParams): Promise<Response> {
		return fetch(url, {
			method: options.method,
			headers,
			body: JSON.stringify(options.body),
			// signal: AbortSignal.timeout(this.config.timeout || 30000),
		});
	}

	private async handleErrorResponse({
		response,
	}: {
		response: Response;
	}): Promise<never> {
		let errorBody;
		try {
			errorBody = await response.json();
		} catch {
			errorBody = await response.text();
		}
		throw APIError.generate(
			response.status,
			errorBody,
			response.statusText,
			response.headers as unknown as Headers,
		);
	}

	private handleStreamResponse({response}: {response: Response}): {
		stream: any;
		threadId: string | null;
	} {
		const controller = new AbortController();
		const stream = Stream.fromSSEResponse(response, controller);
		return {stream, threadId: response.headers.get('lb-thread-id')};
	}

	private handleRunResponseStream({
		response,
		rawResponse,
	}: {
		response: Response;
		rawResponse?: boolean;
	}): {
		stream: any;
		threadId: string | null;
		rawResponse?: {
			headers: Record<string, string>;
		};
	} {
		const controller = new AbortController();
		const streamSSE = Stream.fromSSEResponse(response, controller);
		const stream = streamSSE.toReadableStream();

		const result: {
			stream: ReadableStream<any>;
			threadId: string | null;
			rawResponse?: {
				headers: Record<string, string>;
			};
		} = {
			stream,
			threadId: response.headers.get('lb-thread-id'),
		};
		if (rawResponse) {
			result.rawResponse = {
				headers: Object.fromEntries(response.headers.entries()),
			};
		}
		return result;
	}

	private async handleRunResponse({
		response,
		threadId,
		rawResponse,
	}: HandleGenerateResponseParams): Promise<any> {
		const generateResponse = await response.json();
		const buildResponse = generateResponse.raw
			? {
					completion: generateResponse.completion,
					...generateResponse.raw,
				}
			: generateResponse;

		const result: any = {
			...buildResponse,
		};

		if (threadId) {
			result.threadId = threadId;
		}

		if (rawResponse) {
			result.rawResponse = {
				headers: Object.fromEntries(response.headers.entries()),
			};
		}

		return result;
	}

	async post<T>(options: Omit<RequestOptions, 'method'>): Promise<T> {
		return this.send<T>({...options, method: 'POST'});
	}

	async get<T>(options: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
		return this.send<T>({...options, method: 'GET'});
	}

	async put<T>(options: Omit<RequestOptions, 'method'>): Promise<T> {
		return this.send<T>({...options, method: 'PUT'});
	}

	async delete<T>(
		options: Omit<RequestOptions, 'method' | 'body'>,
	): Promise<T> {
		return this.send<T>({...options, method: 'DELETE'});
	}
}
