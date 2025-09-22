import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Request} from './request';
import {
	APIError,
	APIConnectionError,
	AuthenticationError,
	BadRequestError,
	ConflictError,
	InternalServerError,
	NotFoundError,
	PermissionDeniedError,
	RateLimitError,
	UnprocessableEntityError,
} from './errors';

// Mock the constants
vi.mock('@/data/constants', () => ({
	GENERATION_ENDPOINTS: [
		'/v1/pipes/run',
		'/beta/chat',
		'/beta/generate',
		'/v1/agent/run',
	],
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Request', () => {
	let request: Request;
	const mockApiKey = 'test-api-key';
	const mockBaseUrl = 'https://api.langbase.com';

	beforeEach(() => {
		request = new Request({
			apiKey: mockApiKey,
			baseUrl: mockBaseUrl,
		});
		vi.resetAllMocks();
		global.fetch = vi.fn();
	});

	describe('Constructor', () => {
		it('should initialize with provided config', () => {
			const config = {
				apiKey: 'custom-key',
				baseUrl: 'https://custom-api.com',
				timeout: 60000,
			};
			const customRequest = new Request(config);
			expect(customRequest).toBeInstanceOf(Request);
		});
	});

	describe('HTTP Methods', () => {
		describe('POST requests', () => {
			it('should make successful POST request', async () => {
				const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({data: 'test'})};
				(global.fetch as any).mockResolvedValue(mockResponse);

				const result = await request.post({
					endpoint: '/v1/test',
					body: {message: 'test'},
				});

				expect(global.fetch).toHaveBeenCalledWith(
					'https://api.langbase.com/v1/test',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer test-api-key',
						},
						body: JSON.stringify({message: 'test'}),
					}
				);
				expect(result).toEqual({data: 'test'});
			});

			it('should make POST request with custom headers', async () => {
				const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({data: 'test'})};
				(global.fetch as any).mockResolvedValue(mockResponse);

				await request.post({
					endpoint: '/v1/test',
					body: {message: 'test'},
					headers: {
						'Custom-Header': 'custom-value',
						'LB-LLM-KEY': 'llm-key',
					},
				});

				expect(global.fetch).toHaveBeenCalledWith(
					'https://api.langbase.com/v1/test',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer test-api-key',
							'Custom-Header': 'custom-value',
							'LB-LLM-KEY': 'llm-key',
						},
						body: JSON.stringify({message: 'test'}),
					}
				);
			});
		});

		describe('GET requests', () => {
			it('should make successful GET request', async () => {
				const mockResponse = {ok: true, json: vi.fn().mockResolvedValue([{id: 1}, {id: 2}])};
				(global.fetch as any).mockResolvedValue(mockResponse);

				const result = await request.get({
					endpoint: '/v1/items',
				});

				expect(global.fetch).toHaveBeenCalledWith(
					'https://api.langbase.com/v1/items',
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer test-api-key',
						},
						body: JSON.stringify(undefined),
					}
				);
				expect(result).toEqual([{id: 1}, {id: 2}]);
			});
		});

		describe('PUT requests', () => {
			it('should make successful PUT request', async () => {
				const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({updated: true})};
				(global.fetch as any).mockResolvedValue(mockResponse);

				const result = await request.put({
					endpoint: '/v1/item/123',
					body: {name: 'Updated Name'},
				});

				expect(global.fetch).toHaveBeenCalledWith(
					'https://api.langbase.com/v1/item/123',
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer test-api-key',
						},
						body: JSON.stringify({name: 'Updated Name'}),
					}
				);
				expect(result).toEqual({updated: true});
			});
		});

		describe('DELETE requests', () => {
			it('should make successful DELETE request', async () => {
				const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({success: true})};
				(global.fetch as any).mockResolvedValue(mockResponse);

				const result = await request.delete({
					endpoint: '/v1/item/123',
				});

				expect(global.fetch).toHaveBeenCalledWith(
					'https://api.langbase.com/v1/item/123',
					{
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer test-api-key',
						},
						body: JSON.stringify(undefined),
					}
				);
				expect(result).toEqual({success: true});
			});
		});
	});

	describe('Raw Response Handling', () => {
		it('should include rawResponse for non-generation endpoints when requested', async () => {
			const mockHeaders = new Headers();
			mockHeaders.set('x-request-id', 'req-123');
			mockHeaders.set('x-ratelimit-remaining', '99');

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({data: 'test'}),
				headers: mockHeaders,
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await request.post({
				endpoint: '/v1/test',
				body: {message: 'test', rawResponse: true},
			});

			expect(result).toEqual({
				data: 'test',
				rawResponse: {
					headers: {
						'x-request-id': 'req-123',
						'x-ratelimit-remaining': '99',
					},
				},
			});
		});

		it('should handle rawResponse for array responses', async () => {
			const mockHeaders = new Headers();
			mockHeaders.set('x-total-count', '100');

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue([{id: 1}, {id: 2}]),
				headers: mockHeaders,
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await request.get({
				endpoint: '/v1/items',
				body: {rawResponse: true},
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			expect((result as any).rawResponse).toEqual({
				headers: {
					'x-total-count': '100',
				},
			});
		});
	});

	describe('Generation Endpoints', () => {
		it('should handle run endpoint with stream', async () => {
			const mockHeaders = new Headers();
			mockHeaders.set('lb-thread-id', 'thread-123');

			const mockResponse = {
				ok: true,
				headers: mockHeaders,
				body: new ReadableStream(),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			// Mock the Stream.fromSSEResponse
			const mockStream = {
				toReadableStream: vi.fn().mockReturnValue(new ReadableStream()),
			};
			vi.doMock('@/common/stream', () => ({
				Stream: {
					fromSSEResponse: vi.fn().mockReturnValue(mockStream),
				},
			}));

			const result = await request.post({
				endpoint: '/v1/pipes/run',
				body: {stream: true},
			});

			expect(result).toHaveProperty('stream');
			expect(result).toHaveProperty('threadId', 'thread-123');
		});

		it('should handle run endpoint without stream', async () => {
			const mockHeaders = new Headers();
			mockHeaders.set('lb-thread-id', 'thread-456');

			const mockResponse = {
				ok: true,
				headers: mockHeaders,
				json: vi.fn().mockResolvedValue({
					completion: 'Test completion',
					raw: {
						id: 'resp-123',
						object: 'chat.completion',
						created: 1234567890,
						model: 'gpt-4',
						choices: [],
						usage: {prompt_tokens: 10, completion_tokens: 5, total_tokens: 15},
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await request.post({
				endpoint: '/v1/pipes/run',
				body: {},
			});

			expect(result).toEqual({
				completion: 'Test completion',
				id: 'resp-123',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [],
				usage: {prompt_tokens: 10, completion_tokens: 5, total_tokens: 15},
				threadId: 'thread-456',
			});
		});

		it('should handle agent run endpoint', async () => {
			const mockResponse = {
				ok: true,
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					output: 'Agent response',
					raw: {
						id: 'agent-123',
						object: 'chat.completion',
						created: 1234567890,
						model: 'gpt-4',
						choices: [],
						usage: {prompt_tokens: 15, completion_tokens: 8, total_tokens: 23},
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await request.post({
				endpoint: '/v1/agent/run',
				body: {input: 'Test input', model: 'gpt-4'},
			});

			expect(result).toEqual({
				output: 'Agent response',
				id: 'agent-123',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [],
				usage: {prompt_tokens: 15, completion_tokens: 8, total_tokens: 23},
			});
		});
	});

	describe('Error Handling', () => {
		it('should throw APIConnectionError for network failures', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network failure'));

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(APIConnectionError);
		});

		it('should handle 400 Bad Request error', async () => {
			const mockResponse = {
				ok: false,
				status: 400,
				statusText: 'Bad Request',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Invalid request body',
						code: 'invalid_request',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(BadRequestError);
		});

		it('should handle 401 Authentication error', async () => {
			const mockResponse = {
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Invalid API key',
						code: 'invalid_api_key',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(AuthenticationError);
		});

		it('should handle 403 Permission Denied error', async () => {
			const mockResponse = {
				ok: false,
				status: 403,
				statusText: 'Forbidden',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Insufficient permissions',
						code: 'permission_denied',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(PermissionDeniedError);
		});

		it('should handle 404 Not Found error', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Resource not found',
						code: 'not_found',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.get({
					endpoint: '/v1/nonexistent',
				})
			).rejects.toThrow(NotFoundError);
		});

		it('should handle 409 Conflict error', async () => {
			const mockResponse = {
				ok: false,
				status: 409,
				statusText: 'Conflict',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Resource already exists',
						code: 'conflict',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/resource',
					body: {name: 'existing'},
				})
			).rejects.toThrow(ConflictError);
		});

		it('should handle 422 Unprocessable Entity error', async () => {
			const mockResponse = {
				ok: false,
				status: 422,
				statusText: 'Unprocessable Entity',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Validation failed',
						code: 'validation_error',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/validate',
					body: {invalid: 'data'},
				})
			).rejects.toThrow(UnprocessableEntityError);
		});

		it('should handle 429 Rate Limit error', async () => {
			const mockResponse = {
				ok: false,
				status: 429,
				statusText: 'Too Many Requests',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Rate limit exceeded',
						code: 'rate_limit_exceeded',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(RateLimitError);
		});

		it('should handle 500 Internal Server error', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: 'Internal server error',
						code: 'internal_error',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(InternalServerError);
		});

		it('should handle generic API error for unknown status codes', async () => {
			const mockResponse = {
				ok: false,
				status: 418,
				statusText: "I'm a teapot",
				headers: new Headers(),
				json: vi.fn().mockResolvedValue({
					error: {
						message: "I'm a teapot",
						code: 'teapot_error',
					},
				}),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(APIError);
		});

		it('should handle error response with text body when JSON parsing fails', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				headers: new Headers(),
				json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
				text: vi.fn().mockResolvedValue('Server error occurred'),
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await expect(
				request.post({
					endpoint: '/v1/test',
					body: {},
				})
			).rejects.toThrow(InternalServerError);
		});
	});

	describe('URL Building', () => {
		it('should build correct URL with baseUrl and endpoint', async () => {
			const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({})};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await request.get({endpoint: '/v1/test/path'});

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.langbase.com/v1/test/path',
				expect.any(Object)
			);
		});

		it('should work with custom base URL', async () => {
			const customRequest = new Request({
				apiKey: 'key',
				baseUrl: 'https://eu-api.langbase.com',
			});

			const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({})};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await customRequest.get({endpoint: '/v1/custom'});

			expect(global.fetch).toHaveBeenCalledWith(
				'https://eu-api.langbase.com/v1/custom',
				expect.any(Object)
			);
		});
	});

	describe('Header Building', () => {
		it('should include default headers', async () => {
			const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({})};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await request.post({
				endpoint: '/v1/test',
				body: {},
			});

			const [, options] = (global.fetch as any).mock.calls[0];
			expect(options.headers).toEqual({
				'Content-Type': 'application/json',
				Authorization: 'Bearer test-api-key',
			});
		});

		it('should merge custom headers with defaults', async () => {
			const mockResponse = {ok: true, json: vi.fn().mockResolvedValue({})};
			(global.fetch as any).mockResolvedValue(mockResponse);

			await request.post({
				endpoint: '/v1/test',
				body: {},
				headers: {
					'X-Custom': 'value',
					'Content-Type': 'application/custom+json', // Should override default
				},
			});

			const [, options] = (global.fetch as any).mock.calls[0];
			expect(options.headers).toEqual({
				'Content-Type': 'application/custom+json',
				Authorization: 'Bearer test-api-key',
				'X-Custom': 'value',
			});
		});
	});
});