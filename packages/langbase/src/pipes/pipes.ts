import {Request} from '../common/request';
import type {
	RunOptions,
	RunOptionsStream,
	RunResponse,
	RunResponseStream,
	PipeCreateOptions,
	PipeCreateResponse,
	PipeUpdateOptions,
	PipeUpdateResponse,
	PipeListResponse,
} from './types';

/**
 * Run a pipe with the given options
 */
export async function runPipe(
	request: Request,
	baseUrl: string,
	options: RunOptionsStream,
): Promise<RunResponseStream>;
export async function runPipe(
	request: Request,
	baseUrl: string,
	options: RunOptions,
): Promise<RunResponse>;
export async function runPipe(
	request: Request,
	baseUrl: string,
	options: RunOptions | RunOptionsStream,
): Promise<RunResponse | RunResponseStream> {
	if (!options.name?.trim() && !options.apiKey) {
		throw new Error('Pipe name or Pipe API key is required to run the pipe.');
	}

	// Remove stream property if it's not set to true
	if (typeof options.stream === 'undefined') {
		delete options.stream;
	}

	// if apikey is provided, create a new request instance
	let requestInstance = request;
	if (options.apiKey) {
		requestInstance = new Request({
			apiKey: options.apiKey,
			baseUrl: baseUrl,
		});
	}

	const response = await requestInstance.post({
		endpoint: '/v1/pipes/run',
		body: options,
		headers: {
			...(options.llmKey && {
				'LB-LLM-KEY': options.llmKey,
			}),
		},
	}) as RunResponse | RunResponseStream;

	// Attach metadata for tool calling helper (only for non-stream responses)
	if (response && typeof response === 'object' && !('stream' in response)) {
		(response as any)._meta = {
			name: options.name,
			apiKey: options.apiKey,
		};
	}

	return response;
}

/**
 * Creates a new pipe on Langbase.
 */
export async function createPipe(
	request: Request,
	options: PipeCreateOptions,
): Promise<PipeCreateResponse> {
	return request.post({
		endpoint: '/v1/pipes',
		body: options,
	});
}

/**
 * Updates an existing pipe on Langbase.
 */
export async function updatePipe(
	request: Request,
	options: PipeUpdateOptions,
): Promise<PipeUpdateResponse> {
	return request.post({
		endpoint: `/v1/pipes/${options.name}`,
		body: options,
	});
}

/**
 * Lists all pipes associated with the authenticated user.
 */
export async function listPipe(
	request: Request,
): Promise<PipeListResponse[]> {
	return request.get({
		endpoint: '/v1/pipes',
	});
}
