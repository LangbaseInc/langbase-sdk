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
	ip?: string;
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
	isChat: boolean;
	threadId: string | null;
}

export class Request {
	private config: RequestConfig;
	private demo: string = '';

	constructor(config: RequestConfig) {
		this.config = config;
		this.demo = process.env.LB_DEMO || '';
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

		const threadId = response.headers.get('lb-thread-id');

		if (options.body.stream) {
			return this.handleStreamResponse({response}) as T;
		}

		return this.handleGenerateResponse({
			response,
			isChat: options.body.chat,
			threadId,
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
			'lb-meta-external-user-id': this.config.ip || '',
			demo: this.demo,
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
			signal: AbortSignal.timeout(this.config.timeout || 30000),
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

	private async handleGenerateResponse({
		response,
		isChat,
		threadId,
	}: HandleGenerateResponseParams): Promise<any> {
		const generateResponse = await response.json();
		const buildResponse = generateResponse.raw
			? {
					completion: generateResponse.completion,
					...generateResponse.raw,
				}
			: generateResponse;

		// Chat.
		if (isChat && threadId) {
			return {
				threadId,
				...buildResponse,
			};
		}

		// Generate.
		return buildResponse;
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
