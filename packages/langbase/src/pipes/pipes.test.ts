import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Request} from '../common/request';
import {
	GenerateNonStreamResponse,
	GenerateOptions,
	GenerateStreamResponse,
	Pipe,
} from './pipes';

// Mock the Request class
vi.mock('../common/request');

describe('Pipe', () => {
	let pipe: Pipe;
	const mockApiKey = 'test-api-key';

	beforeEach(() => {
		pipe = new Pipe({apiKey: mockApiKey});
	});

	describe('generateText', () => {
		it('should call request.post with correct parameters', async () => {
			const mockOptions: GenerateOptions = {
				messages: [{role: 'user', content: 'Hello'}],
			};
			const mockResponse: GenerateNonStreamResponse = {
				completion: 'Hello, how can I help you?',
				raw: {
					id: 'test-id',
					object: 'test-object',
					created: 123456789,
					model: 'test-model',
					choices: [
						{
							index: 0,
							message: {
								role: 'assistant',
								content: 'Hello, how can I help you?',
							},
						},
					],
					usage: {
						prompt_tokens: 5,
						completion_tokens: 10,
						total_tokens: 15,
					},
					system_fingerprint: null,
				},
			};

			(Request.prototype.post as any).mockResolvedValue(mockResponse);

			const result = await pipe.generateText(mockOptions);

			expect(Request.prototype.post).toHaveBeenCalledWith({
				endpoint: '/beta/generate',
				body: mockOptions,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('streamText', () => {
		it('should call request.post with correct parameters and stream option', async () => {
			const mockOptions: GenerateOptions = {
				messages: [{role: 'user', content: 'Hello'}],
			};
			const mockStreamResponse: GenerateStreamResponse =
				{} as GenerateStreamResponse; // You might need to create a more detailed mock

			(Request.prototype.post as any).mockResolvedValue(
				mockStreamResponse,
			);

			const result = await pipe.streamText(mockOptions);

			expect(Request.prototype.post).toHaveBeenCalledWith({
				endpoint: '/beta/generate',
				body: mockOptions,
				stream: true,
			});
			expect(result).toEqual(mockStreamResponse);
		});
	});
});
