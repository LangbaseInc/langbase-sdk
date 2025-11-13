import {Request} from '../common/request';
import {
	AgentRunOptions,
	AgentRunOptionsStream,
	AgentRunResponse,
} from './types';

export interface RunResponseStream {
	stream: ReadableStream<any>;
	threadId: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

/**
 * Runs an agent with the specified options.
 *
 * @param request - The Request instance to use for API calls
 * @param options - The agent run options
 * @returns A promise that resolves to the agent run response or stream
 * @throws {Error} If LLM API key is not provided
 */
export async function runAgent(
	request: Request,
	options: AgentRunOptionsStream,
): Promise<RunResponseStream>;

export async function runAgent(
	request: Request,
	options: AgentRunOptions,
): Promise<AgentRunResponse>;

export async function runAgent(
	request: Request,
	options: AgentRunOptions | AgentRunOptionsStream,
): Promise<AgentRunResponse | RunResponseStream> {
	if (!options.apiKey) {
		throw new Error('LLM API key is required to run this LLM.');
	}

	// Remove stream property if it's not set to true
	if (typeof options.stream === 'undefined') {
		delete options.stream;
	}

	return request.post({
		endpoint: '/v1/agent/run',
		body: options,
		headers: {
			...(options.apiKey && {'LB-LLM-Key': options.apiKey}),
		},
	});
}
