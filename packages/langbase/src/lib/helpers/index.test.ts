import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
	ChunkStream,
	fromReadableStream,
	getRunner,
	getTextPart,
	getToolsFromRun,
	getToolsFromRunStream,
	getToolsFromStream,
	handleResponseStream,
} from './index';
import {RunResponse} from '@/langbase/langbase';

// Mock openai stream classes
vi.mock('openai/lib/ChatCompletionStream', () => ({
	ChatCompletionStream: {
		fromReadableStream: vi.fn().mockReturnValue({
			finalChatCompletion: vi.fn().mockResolvedValue({
				choices: [
					{
						message: {
							tool_calls: [
								{
									id: 'call_123',
									type: 'function',
									function: {
										name: 'test_function',
										arguments: '{"param": "value"}',
									},
								},
							],
						},
					},
				],
			}),
		}),
	},
}));

vi.mock('openai/streaming', () => ({
	Stream: {
		fromSSEResponse: vi.fn().mockReturnValue({
			toReadableStream: vi.fn().mockReturnValue(new ReadableStream()),
		}),
	},
}));

describe('Helpers', () => {
	let mockReadableStream: ReadableStream;

	beforeEach(() => {
		mockReadableStream = new ReadableStream({
			start(controller) {
				controller.enqueue('chunk1');
				controller.enqueue('chunk2');
				controller.close();
			},
		});
		vi.resetAllMocks();
	});

	describe('fromReadableStream', () => {
		it('should convert ReadableStream to Runner', () => {
			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			
			const runner = fromReadableStream(mockReadableStream);

			expect(ChatCompletionStream.fromReadableStream).toHaveBeenCalledWith(mockReadableStream);
			expect(runner).toBeDefined();
		});
	});

	describe('getRunner', () => {
		it('should be an alias for fromReadableStream', () => {
			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			
			const runner = getRunner(mockReadableStream);

			expect(ChatCompletionStream.fromReadableStream).toHaveBeenCalledWith(mockReadableStream);
			expect(runner).toBeDefined();
		});
	});

	describe('getTextPart', () => {
		it('should extract text content from chunk', () => {
			const chunk: ChunkStream = {
				id: 'chunk-123',
				object: 'chat.completion.chunk',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						delta: {
							role: 'assistant',
							content: 'Hello world!',
						},
						logprobs: null,
						finish_reason: '',
					},
				],
			};

			const textPart = getTextPart(chunk);

			expect(textPart).toBe('Hello world!');
		});

		it('should return empty string when no content exists', () => {
			const chunk: ChunkStream = {
				id: 'chunk-123',
				object: 'chat.completion.chunk',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						delta: {
							role: 'assistant',
						},
						logprobs: null,
						finish_reason: '',
					},
				],
			};

			const textPart = getTextPart(chunk);

			expect(textPart).toBe('');
		});

		it('should return empty string when no choices exist', () => {
			const chunk: ChunkStream = {
				id: 'chunk-123',
				object: 'chat.completion.chunk',
				created: 1234567890,
				model: 'gpt-4',
				choices: [],
			};

			const textPart = getTextPart(chunk);

			expect(textPart).toBe('');
		});

		it('should handle null content gracefully', () => {
			const chunk: ChunkStream = {
				id: 'chunk-123',
				object: 'chat.completion.chunk',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						delta: {
							role: 'assistant',
							content: null as any,
						},
						logprobs: null,
						finish_reason: '',
					},
				],
			};

			const textPart = getTextPart(chunk);

			expect(textPart).toBe('');
		});
	});

	describe('handleResponseStream', () => {
		it('should handle response stream with thread ID', () => {
			const mockHeaders = new Headers();
			mockHeaders.set('lb-thread-id', 'thread-123');
			mockHeaders.set('content-type', 'text/event-stream');

			const mockResponse = {
				headers: mockHeaders,
			} as Response;

			const {Stream} = require('openai/streaming');

			const result = handleResponseStream({
				response: mockResponse,
				rawResponse: false,
			});

			expect(Stream.fromSSEResponse).toHaveBeenCalledWith(
				mockResponse,
				expect.any(AbortController)
			);
			expect(result.threadId).toBe('thread-123');
			expect(result.stream).toBeInstanceOf(ReadableStream);
			expect(result.rawResponse).toBeUndefined();
		});

		it('should include raw response headers when requested', () => {
			const mockHeaders = new Headers();
			mockHeaders.set('lb-thread-id', 'thread-456');
			mockHeaders.set('x-custom-header', 'custom-value');
			mockHeaders.set('content-type', 'text/event-stream');

			const mockResponse = {
				headers: mockHeaders,
			} as Response;

			const result = handleResponseStream({
				response: mockResponse,
				rawResponse: true,
			});

			expect(result.threadId).toBe('thread-456');
			expect(result.rawResponse).toEqual({
				headers: {
					'lb-thread-id': 'thread-456',
					'x-custom-header': 'custom-value',
					'content-type': 'text/event-stream',
				},
			});
		});

		it('should handle response without thread ID', () => {
			const mockHeaders = new Headers();
			mockHeaders.set('content-type', 'text/event-stream');

			const mockResponse = {
				headers: mockHeaders,
			} as Response;

			const result = handleResponseStream({
				response: mockResponse,
			});

			expect(result.threadId).toBeNull();
		});
	});

	describe('getToolsFromStream', () => {
		it('should extract tool calls from stream', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockResolvedValue({
					choices: [
						{
							message: {
								tool_calls: [
									{
										id: 'call_123',
										type: 'function',
										function: {
											name: 'search_web',
											arguments: '{"query": "test"}',
										},
									},
									{
										id: 'call_456',
										type: 'function',
										function: {
											name: 'get_weather',
											arguments: '{"location": "NYC"}',
										},
									},
								],
							},
						},
					],
				}),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			const tools = await getToolsFromStream(mockReadableStream);

			expect(tools).toHaveLength(2);
			expect(tools[0]).toEqual({
				id: 'call_123',
				type: 'function',
				function: {
					name: 'search_web',
					arguments: '{"query": "test"}',
				},
			});
			expect(tools[1]).toEqual({
				id: 'call_456',
				type: 'function',
				function: {
					name: 'get_weather',
					arguments: '{"location": "NYC"}',
				},
			});
		});

		it('should return empty array when no tool calls exist', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockResolvedValue({
					choices: [
						{
							message: {
								tool_calls: null,
							},
						},
					],
				}),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			const tools = await getToolsFromStream(mockReadableStream);

			expect(tools).toEqual([]);
		});

		it('should handle undefined tool_calls', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockResolvedValue({
					choices: [
						{
							message: {},
						},
					],
				}),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			const tools = await getToolsFromStream(mockReadableStream);

			expect(tools).toEqual([]);
		});
	});

	describe('getToolsFromRunStream', () => {
		it('should be an alias for getToolsFromStream', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockResolvedValue({
					choices: [
						{
							message: {
								tool_calls: [
									{
										id: 'call_789',
										type: 'function',
										function: {
											name: 'calculate',
											arguments: '{"expression": "2+2"}',
										},
									},
								],
							},
						},
					],
				}),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			const tools = await getToolsFromRunStream(mockReadableStream);

			expect(tools).toHaveLength(1);
			expect(tools[0].id).toBe('call_789');
		});
	});

	describe('getToolsFromRun', () => {
		it('should extract tool calls from non-stream response', async () => {
			const runResponse: RunResponse = {
				completion: 'Here are the results',
				id: 'run-123',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						message: {
							role: 'assistant',
							content: 'Here are the results',
							tool_calls: [
								{
									id: 'call_abc',
									type: 'function',
									function: {
										name: 'database_query',
										arguments: '{"table": "users", "limit": 10}',
									},
								},
							],
						},
						logprobs: null,
						finish_reason: 'tool_calls',
					},
				],
				usage: {
					prompt_tokens: 20,
					completion_tokens: 10,
					total_tokens: 30,
				},
				system_fingerprint: null,
			};

			const tools = await getToolsFromRun(runResponse);

			expect(tools).toHaveLength(1);
			expect(tools[0]).toEqual({
				id: 'call_abc',
				type: 'function',
				function: {
					name: 'database_query',
					arguments: '{"table": "users", "limit": 10}',
				},
			});
		});

		it('should return empty array when no tool calls in response', async () => {
			const runResponse: RunResponse = {
				completion: 'No tools needed',
				id: 'run-456',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						message: {
							role: 'assistant',
							content: 'No tools needed',
							tool_calls: undefined,
						},
						logprobs: null,
						finish_reason: 'stop',
					},
				],
				usage: {
					prompt_tokens: 15,
					completion_tokens: 5,
					total_tokens: 20,
				},
				system_fingerprint: null,
			};

			const tools = await getToolsFromRun(runResponse);

			expect(tools).toEqual([]);
		});

		it('should handle null tool_calls in response', async () => {
			const runResponse: RunResponse = {
				completion: 'Simple response',
				id: 'run-789',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [
					{
						index: 0,
						message: {
							role: 'assistant',
							content: 'Simple response',
							tool_calls: null as any,
						},
						logprobs: null,
						finish_reason: 'stop',
					},
				],
				usage: {
					prompt_tokens: 10,
					completion_tokens: 3,
					total_tokens: 13,
				},
				system_fingerprint: null,
			};

			const tools = await getToolsFromRun(runResponse);

			expect(tools).toEqual([]);
		});
	});

	describe('Edge Cases', () => {
		it('should handle stream errors gracefully', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockRejectedValue(new Error('Stream error')),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			await expect(getToolsFromStream(mockReadableStream)).rejects.toThrow('Stream error');
		});

		it('should handle malformed response gracefully', async () => {
			const mockRunner = {
				finalChatCompletion: vi.fn().mockResolvedValue({
					choices: [], // Empty choices array
				}),
			};

			const {ChatCompletionStream} = require('openai/lib/ChatCompletionStream');
			ChatCompletionStream.fromReadableStream.mockReturnValue(mockRunner);

			await expect(getToolsFromStream(mockReadableStream)).rejects.toThrow();
		});
	});
});