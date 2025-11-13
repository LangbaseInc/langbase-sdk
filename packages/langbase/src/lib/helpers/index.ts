import {ChatCompletionStream} from 'openai/lib/ChatCompletionStream';
import {Stream} from 'openai/streaming';
import {ChatCompletionMessageToolCall} from 'openai/resources/chat/completions';
import {RunResponse, RunResponseStream} from '@/langbase';

export interface Runner extends ChatCompletionStream {}

export interface ToolCallResult extends ChatCompletionMessageToolCall {}

export type MessageRole = 'function' | 'assistant' | 'system' | 'user' | 'tool';

interface Delta {
	role?: MessageRole;
	content?: string;
	tool_calls?: ToolCallResult[];
}

interface ChoiceStream {
	index: number;
	delta: Delta;
	logprobs: boolean | null;
	finish_reason: string;
}

export interface ChunkStream {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceStream[];
}

/**
 * Converts a ReadableStream into a Runner.
 *
 * @param readableStream - The ReadableStream to convert.
 * @returns The converted Runner.
 */
export const fromReadableStream = (readableStream: ReadableStream): Runner => {
	return ChatCompletionStream.fromReadableStream(readableStream);
};

/**
 * Returns a runner for the given readable stream.
 *
 * @param readableStream - The readable stream to create a runner for.
 * @returns A runner for the given readable stream.
 */
export const getRunner = (readableStream: ReadableStream) => {
	return fromReadableStream(readableStream);
};

/**
 * Retrieves the text part from a given ChunkStream.
 *
 * @param chunk - The ChunkStream object.
 * @returns The text content of the first choice's delta, or an empty string if it doesn't exist.
 */
export const getTextPart = (chunk: ChunkStream) => {
	return chunk.choices[0]?.delta?.content || '';
};

/**
 * Handles the response stream from a given `Response` object.
 *
 * @param {Object} params - The parameters for handling the response stream.
 * @param {Response} params.response - The API response to handle.
 * @param {boolean} params.rawResponse - Optional flag to include raw response headers.
 *
 * @returns {Object} An object containing the processed stream, thread ID, and optionally raw response headers.
 * @returns {ReadableStream<any>} return.stream - The readable stream created from the response.
 * @returns {string | null} return.threadId - The thread ID extracted from the response headers.
 * @returns {Object} [return.rawResponse] - Optional raw response headers.
 * @returns {Record<string, string>} return.rawResponse.headers - The headers from the raw response.
 */
export function handleResponseStream({
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

/**
 * Retrieves tool calls from a given readable stream.
 *
 * @param stream - The readable stream from which to extract tool calls.
 * @returns A promise that resolves to an array of `ToolCall` objects.
 */
export async function getToolsFromStream(
	stream: ReadableStream<any>,
): Promise<ChatCompletionMessageToolCall[]> {
	let run = getRunner(stream);
	const {choices} = await run.finalChatCompletion();
	const tools = choices[0].message.tool_calls;
	return tools ?? [];
}

/**
 * Retrieves tools from a readable stream asynchronously.
 *
 * @param stream - The readable stream to extract tools from
 * @returns A promise that resolves with the tools extracted from the stream
 */
export async function getToolsFromRunStream(stream: ReadableStream<any>) {
	return getToolsFromStream(stream);
}

/**
 * Extracts tool calls from non-stream response.
 * @param response - The run response object
 * @returns A promise that resolves to an array of tool calls. Returns empty array if no tools are present.
 */
export async function getToolsFromRun(
	response: RunResponse,
): Promise<ChatCompletionMessageToolCall[]> {
	const tools = response.choices[0].message.tool_calls;
	return tools ?? [];
}

/**
 * Options for handling automatic tool calls
 */
export interface HandleToolCallsOptions {
	/** The initial response from pipes.run() that may contain tool calls */
	response: RunResponse & {_meta?: {name?: string; apiKey?: string}};
	/** Object mapping tool names to their implementation functions */
	tools: Record<string, (args: any) => Promise<string>>;
	/** The Langbase instance for making API calls */
	langbase: any;
	/** Optional callback to log or handle the conversation flow */
	onComplete?: (data: {
		toolCalls: ChatCompletionMessageToolCall[];
		toolResults: any[];
		finalResponse: RunResponse;
	}) => void;
}

/**
 * Automatically handles the tool calling loop for Langbase pipes.
 *
 * This function provides complete control over the tool calling process:
 * 1. Checks if the AI requested any tool calls
 * 2. Executes the requested tools with their parameters
 * 3. Sends the tool results back to the AI
 * 4. Returns the final AI response
 *
 * @example
 * ```typescript
 * const response = await langbase.pipes.run({
 *   name: 'my-pipe',
 *   messages: [{role: 'user', content: 'What's the weather?'}],
 *   tools: [weatherToolSchema],
 * });
 *
 * const finalResponse = await handleToolCalls({
 *   response,
 *   tools: { getCurrentWeather },
 *   langbase,
 * });
 * ```
 *
 * @param options - Configuration options for handling tool calls
 * @returns The final response from the AI after processing tool calls, or the original response if no tools were called
 */
export async function handleToolCalls({
	response,
	tools,
	langbase,
	onComplete,
}: HandleToolCallsOptions): Promise<RunResponse> {
	const toolCalls = await getToolsFromRun(response);
	const hasToolCalls = toolCalls.length > 0;

	// If no tool calls, return the original response
	if (!hasToolCalls) {
		return response;
	}

	// Execute all tool calls in parallel
	const toolResultPromises = toolCalls.map(async (toolCall) => {
		const toolName = toolCall.function.name;
		const toolParameters = JSON.parse(toolCall.function.arguments);
		const toolFunction = tools[toolName];

		if (!toolFunction) {
			throw new Error(`Tool function "${toolName}" not found in tools object`);
		}

		const toolResponse = await toolFunction(toolParameters);

		return {
			role: 'tool' as const,
			name: toolName,
			content: toolResponse,
			tool_call_id: toolCall.id,
		};
	});

	const toolResults = await Promise.all(toolResultPromises);

	// Send tool results back to the AI using the threadId from the original response
	// We need either name or apiKey from the original request
	const runOptions: any = {
		threadId: response.threadId,
		messages: toolResults,
		stream: false, // Always use non-streaming for tool results
	};

	// Use metadata from response if available, otherwise user must handle it
	if (response._meta?.name) {
		runOptions.name = response._meta.name;
	} else if (response._meta?.apiKey) {
		runOptions.apiKey = response._meta.apiKey;
	}

	const finalResponse = await langbase.pipes.run(runOptions);

	// Call the optional completion callback
	if (onComplete) {
		onComplete({ toolCalls, toolResults, finalResponse });
	}

	return finalResponse;
}
