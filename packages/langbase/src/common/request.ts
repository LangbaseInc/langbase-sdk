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

export class Request {
	private config: RequestConfig;

	constructor(config: RequestConfig) {
		this.config = config;
	}

	private async send<T>(options: RequestOptions): Promise<T> {
		const url = `${this.config.baseUrl}${options.endpoint}`;
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.config.apiKey}`,
			...options.headers,
		};

		let response: Response;
		try {
			response = await fetch(url, {
				method: options.method,
				headers,
				body: JSON.stringify(options.body),
				signal: AbortSignal.timeout(this.config.timeout || 30000),
			});
		} catch (error) {
			throw new APIConnectionError({
				cause: error instanceof Error ? error : undefined,
			});
		}

		if (!response.ok) {
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

		if (options.stream) {
			const controller = new AbortController();
			return Stream.fromSSEResponse(response, controller) as unknown as T;
		} else {
			return response.json();
		}
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
