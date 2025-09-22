import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Stream, _decodeChunks, _iterSSEMessages} from './stream';

// Mock AbortController
global.AbortController = vi.fn().mockImplementation(() => ({
	abort: vi.fn(),
	signal: {},
}));

describe('Stream', () => {
	let mockController: AbortController;

	beforeEach(() => {
		mockController = new AbortController();
		vi.resetAllMocks();
	});

	describe('Stream construction', () => {
		it('should create a stream with iterator and controller', () => {
			const iterator = vi.fn();
			const stream = new Stream(iterator, mockController);

			expect(stream).toBeInstanceOf(Stream);
			expect(stream.controller).toBe(mockController);
		});
	});

	describe('fromSSEResponse', () => {
		it('should create stream from SSE response', async () => {
			// Mock response with SSE data
			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						// Simulate SSE chunks
						controller.enqueue(new TextEncoder().encode('data: {"id": 1}\n\n'));
						controller.enqueue(new TextEncoder().encode('data: {"id": 2}\n\n'));
						controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual([{id: 1}, {id: 2}]);
		});

		it('should handle SSE events with event type', async () => {
			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(
							new TextEncoder().encode('event: completion\ndata: {"text": "hello"}\n\n')
						);
						controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual([{event: 'completion', data: {text: 'hello'}}]);
		});

		it('should handle error events', async () => {
			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(
							new TextEncoder().encode(
								'event: error\ndata: {"message": "Something went wrong"}\n\n'
							)
						);
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);

			await expect(async () => {
				for await (const chunk of stream) {
					// Should throw before we get here
				}
			}).rejects.toThrow('Something went wrong');
		});

		it('should handle data with errors', async () => {
			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(
							new TextEncoder().encode('data: {"error": "API error occurred"}\n\n')
						);
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);

			await expect(async () => {
				for await (const chunk of stream) {
					// Should throw before we get here
				}
			}).rejects.toThrow('API error occurred');
		});

		it('should handle malformed JSON gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(new TextEncoder().encode('data: {invalid json}\n\n'));
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);

			await expect(async () => {
				for await (const chunk of stream) {
					// Should throw due to JSON parse error
				}
			}).rejects.toThrow();

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('should prevent multiple iterations over the same stream', async () => {
			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(new TextEncoder().encode('data: {"id": 1}\n\n'));
						controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
						controller.close();
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, mockController);

			// First iteration should work
			const firstResults = [];
			for await (const chunk of stream) {
				firstResults.push(chunk);
			}
			expect(firstResults).toEqual([{id: 1}]);

			// Second iteration should throw
			await expect(async () => {
				for await (const chunk of stream) {
					// Should not reach here
				}
			}).rejects.toThrow('Cannot iterate over a consumed stream');
		});

		it('should handle AbortError gracefully', async () => {
			const abortController = new AbortController();

			const mockResponse = {
				body: new ReadableStream({
					start(controller) {
						controller.enqueue(new TextEncoder().encode('data: {"id": 1}\n\n'));
						// Simulate abort during processing
						setTimeout(() => {
							abortController.abort();
						}, 10);
					},
				}),
			} as Response;

			const stream = Stream.fromSSEResponse(mockResponse, abortController);

			// Mock the AbortError
			const mockIterSSE = vi.fn().mockImplementation(async function* () {
				yield {event: null, data: '{"id": 1}', raw: []};
				throw new Error('AbortError');
			});

			// This should not throw an error, just exit gracefully
			const results = [];
			try {
				for await (const chunk of stream) {
					results.push(chunk);
				}
			} catch (error) {
				// AbortErrors should be handled gracefully
				if ((error as Error).name !== 'AbortError') {
					throw error;
				}
			}
		});
	});

	describe('fromReadableStream', () => {
		it('should create stream from ReadableStream with JSON lines', async () => {
			const mockStream = new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode('{"id": 1}\n'));
					controller.enqueue(new TextEncoder().encode('{"id": 2}\n'));
					controller.enqueue(new TextEncoder().encode('{"id": 3}\n'));
					controller.close();
				},
			});

			const stream = Stream.fromReadableStream(mockStream, mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual([{id: 1}, {id: 2}, {id: 3}]);
		});

		it('should prevent multiple iterations', async () => {
			const mockStream = new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode('{"id": 1}\n'));
					controller.close();
				},
			});

			const stream = Stream.fromReadableStream(mockStream, mockController);

			// First iteration
			for await (const chunk of stream) {
				expect(chunk).toEqual({id: 1});
			}

			// Second iteration should throw
			await expect(async () => {
				for await (const chunk of stream) {
					// Should not reach here
				}
			}).rejects.toThrow('Cannot iterate over a consumed stream');
		});
	});

	describe('tee', () => {
		it('should split stream into two independent streams', async () => {
			const chunks = [{id: 1}, {id: 2}, {id: 3}];
			let chunkIndex = 0;

			const mockIterator = vi.fn().mockImplementation(async function* () {
				for (const chunk of chunks) {
					yield chunk;
				}
			});

			const originalStream = new Stream(() => mockIterator(), mockController);
			const [stream1, stream2] = originalStream.tee();

			const results1 = [];
			const results2 = [];

			// Read from first stream
			for await (const chunk of stream1) {
				results1.push(chunk);
			}

			// Read from second stream
			for await (const chunk of stream2) {
				results2.push(chunk);
			}

			expect(results1).toEqual(chunks);
			expect(results2).toEqual(chunks);
		});
	});

	describe('toReadableStream', () => {
		it('should convert stream to ReadableStream', async () => {
			const chunks = [{id: 1}, {id: 2}, {id: 3}];

			const mockIterator = vi.fn().mockImplementation(async function* () {
				for (const chunk of chunks) {
					yield chunk;
				}
			});

			const stream = new Stream(() => mockIterator(), mockController);
			const readableStream = stream.toReadableStream();

			expect(readableStream).toBeInstanceOf(ReadableStream);

			const reader = readableStream.getReader();
			const results = [];

			try {
				while (true) {
					const {done, value} = await reader.read();
					if (done) break;

					const text = new TextDecoder().decode(value);
					const lines = text.trim().split('\n');
					for (const line of lines) {
						if (line) {
							results.push(JSON.parse(line));
						}
					}
				}
			} finally {
				reader.releaseLock();
			}

			expect(results).toEqual(chunks);
		});
	});

	describe('Symbol.asyncIterator', () => {
		it('should make stream async iterable', async () => {
			const chunks = [{id: 1}, {id: 2}];

			const mockIterator = vi.fn().mockImplementation(async function* () {
				for (const chunk of chunks) {
					yield chunk;
				}
			});

			const stream = new Stream(() => mockIterator(), mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual(chunks);
		});
	});

	describe('_decodeChunks helper', () => {
		it('should decode text chunks into lines', () => {
			const chunks = ['line1\nline2\n', 'line3\n', 'line4'];
			const lines = _decodeChunks(chunks);

			expect(lines).toEqual(['line1', 'line2', 'line3']);
		});

		it('should handle chunks without newlines', () => {
			const chunks = ['partial1', 'partial2\ncomplete\n'];
			const lines = _decodeChunks(chunks);

			expect(lines).toEqual(['partial1partial2', 'complete']);
		});

		it('should handle empty chunks', () => {
			const chunks: string[] = [];
			const lines = _decodeChunks(chunks);

			expect(lines).toEqual([]);
		});
	});

	describe('Edge cases', () => {
		it('should handle empty stream', async () => {
			const mockIterator = vi.fn().mockImplementation(async function* () {
				// Empty generator
				return;
			});

			const stream = new Stream(() => mockIterator(), mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual([]);
		});

		it('should handle stream with undefined values', async () => {
			const mockIterator = vi.fn().mockImplementation(async function* () {
				yield {id: 1};
				yield undefined;
				yield {id: 2};
			});

			const stream = new Stream(() => mockIterator(), mockController);
			const results = [];

			for await (const chunk of stream) {
				results.push(chunk);
			}

			expect(results).toEqual([{id: 1}, undefined, {id: 2}]);
		});
	});
});