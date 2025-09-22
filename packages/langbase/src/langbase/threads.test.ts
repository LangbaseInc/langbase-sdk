import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Langbase} from './langbase';

// Mock the Request class
vi.mock('../common/request');

describe('Langbase Threads Operations', () => {
	let langbase: Langbase;
	const mockApiKey = 'test-api-key';

	beforeEach(() => {
		langbase = new Langbase({apiKey: mockApiKey});
		vi.resetAllMocks();
	});

	describe('threads.create', () => {
		it('should create a new thread with no options', async () => {
			const createOptions = {};
			const mockResponse = {
				id: 'thread_123',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {},
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.create(createOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads',
				body: createOptions,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should create a thread with custom threadId and metadata', async () => {
			const createOptions = {
				threadId: 'custom-thread-id',
				metadata: {
					user: 'john_doe',
					session: 'session_123',
				},
			};

			const mockResponse = {
				id: 'custom-thread-id',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {
					user: 'john_doe',
					session: 'session_123',
				},
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.create(createOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads',
				body: createOptions,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should create a thread with initial messages', async () => {
			const createOptions = {
				messages: [
					{
						role: 'user' as const,
						content: 'Hello, I need help with something.',
						metadata: {priority: 'high'},
					},
					{
						role: 'assistant' as const,
						content: 'I would be happy to help! What do you need assistance with?',
						metadata: {},
					},
				],
				metadata: {
					topic: 'customer_support',
				},
			};

			const mockResponse = {
				id: 'thread_456',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {
					topic: 'customer_support',
				},
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.create(createOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads',
				body: createOptions,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('threads.update', () => {
		it('should update thread metadata', async () => {
			const updateOptions = {
				threadId: 'thread_123',
				metadata: {
					status: 'resolved',
					updated_by: 'support_agent',
				},
			};

			const mockResponse = {
				id: 'thread_123',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {
					status: 'resolved',
					updated_by: 'support_agent',
				},
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.update(updateOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_123',
				body: updateOptions,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('threads.get', () => {
		it('should retrieve a thread by ID', async () => {
			const getOptions = {threadId: 'thread_789'};
			const mockResponse = {
				id: 'thread_789',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {
					user: 'jane_doe',
					category: 'technical_support',
				},
			};

			const mockGet = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {get: mockGet};

			const result = await langbase.threads.get(getOptions);

			expect(mockGet).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_789',
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('threads.delete', () => {
		it('should delete a thread by ID', async () => {
			const deleteOptions = {threadId: 'thread_to_delete'};
			const mockResponse = {success: true};

			const mockDelete = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {delete: mockDelete};

			const result = await langbase.threads.delete(deleteOptions);

			expect(mockDelete).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_to_delete',
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('threads.append', () => {
		it('should append messages to a thread', async () => {
			const appendOptions = {
				threadId: 'thread_123',
				messages: [
					{
						role: 'user' as const,
						content: 'I have another question.',
						metadata: {timestamp: '2023-01-01T12:00:00Z'},
					},
					{
						role: 'assistant' as const,
						content: 'Of course! What would you like to know?',
						metadata: {},
					},
				],
			};

			const mockResponse = [
				{
					id: 'msg_1',
					created_at: 1234567890,
					thread_id: 'thread_123',
					content: 'I have another question.',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {timestamp: '2023-01-01T12:00:00Z'},
				},
				{
					id: 'msg_2',
					created_at: 1234567891,
					thread_id: 'thread_123',
					content: 'Of course! What would you like to know?',
					role: 'assistant' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
			];

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.append(appendOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_123/messages',
				body: appendOptions.messages,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should append messages with tool calls', async () => {
			const appendOptions = {
				threadId: 'thread_456',
				messages: [
					{
						role: 'user' as const,
						content: 'Please search for information about AI.',
						metadata: {},
					},
					{
						role: 'assistant' as const,
						content: null,
						tool_calls: [
							{
								id: 'call_123',
								type: 'function' as const,
								function: {
									name: 'web_search',
									arguments: JSON.stringify({query: 'artificial intelligence'}),
								},
							},
						],
						metadata: {},
					},
					{
						role: 'tool' as const,
						content: 'Search results: AI is a field of computer science...',
						tool_call_id: 'call_123',
						metadata: {},
					},
				],
			};

			const mockResponse = [
				{
					id: 'msg_3',
					created_at: 1234567892,
					thread_id: 'thread_456',
					content: 'Please search for information about AI.',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
				{
					id: 'msg_4',
					created_at: 1234567893,
					thread_id: 'thread_456',
					content: null,
					role: 'assistant' as const,
					tool_call_id: null,
					tool_calls: [
						{
							id: 'call_123',
							type: 'function',
							function: {
								name: 'web_search',
								arguments: JSON.stringify({query: 'artificial intelligence'}),
							},
						},
					],
					name: null,
					attachments: [],
					metadata: {},
				},
				{
					id: 'msg_5',
					created_at: 1234567894,
					thread_id: 'thread_456',
					content: 'Search results: AI is a field of computer science...',
					role: 'tool' as const,
					tool_call_id: 'call_123',
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
			];

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.threads.append(appendOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_456/messages',
				body: appendOptions.messages,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('threads.messages.list', () => {
		it('should list all messages in a thread', async () => {
			const listOptions = {threadId: 'thread_list_test'};
			const mockResponse = [
				{
					id: 'msg_1',
					created_at: 1234567890,
					thread_id: 'thread_list_test',
					content: 'Hello, I need help.',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {priority: 'high'},
				},
				{
					id: 'msg_2',
					created_at: 1234567891,
					thread_id: 'thread_list_test',
					content: 'I can help you with that!',
					role: 'assistant' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
				{
					id: 'msg_3',
					created_at: 1234567892,
					thread_id: 'thread_list_test',
					content: 'Thank you for the assistance.',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
			];

			const mockGet = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {get: mockGet};

			const result = await langbase.threads.messages.list(listOptions);

			expect(mockGet).toHaveBeenCalledWith({
				endpoint: '/v1/threads/thread_list_test/messages',
			});
			expect(result).toEqual(mockResponse);
		});

		it('should list messages in empty thread', async () => {
			const listOptions = {threadId: 'empty_thread'};
			const mockResponse: any[] = [];

			const mockGet = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {get: mockGet};

			const result = await langbase.threads.messages.list(listOptions);

			expect(mockGet).toHaveBeenCalledWith({
				endpoint: '/v1/threads/empty_thread/messages',
			});
			expect(result).toEqual([]);
		});
	});

	describe('Thread Integration Tests', () => {
		it('should handle complete thread workflow', async () => {
			// Mock the request object
			const mockRequest = {
				post: vi.fn(),
				get: vi.fn(),
				delete: vi.fn(),
			};
			(langbase as any).request = mockRequest;

			// 1. Create a thread
			const createResponse = {
				id: 'workflow_thread',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {workflow: 'test'},
			};
			mockRequest.post.mockResolvedValueOnce(createResponse);

			const thread = await langbase.threads.create({
				metadata: {workflow: 'test'},
			});
			expect(thread.id).toBe('workflow_thread');

			// 2. Append initial message
			const appendResponse = [
				{
					id: 'msg_1',
					created_at: 1234567891,
					thread_id: 'workflow_thread',
					content: 'Start of conversation',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
			];
			mockRequest.post.mockResolvedValueOnce(appendResponse);

			const messages = await langbase.threads.append({
				threadId: 'workflow_thread',
				messages: [
					{
						role: 'user',
						content: 'Start of conversation',
						metadata: {},
					},
				],
			});
			expect(messages).toHaveLength(1);

			// 3. List messages
			const listResponse = [
				{
					id: 'msg_1',
					created_at: 1234567891,
					thread_id: 'workflow_thread',
					content: 'Start of conversation',
					role: 'user' as const,
					tool_call_id: null,
					tool_calls: [],
					name: null,
					attachments: [],
					metadata: {},
				},
			];
			mockRequest.get.mockResolvedValueOnce(listResponse);

			const allMessages = await langbase.threads.messages.list({
				threadId: 'workflow_thread',
			});
			expect(allMessages).toHaveLength(1);

			// 4. Update thread metadata
			const updateResponse = {
				id: 'workflow_thread',
				object: 'thread' as const,
				created_at: 1234567890,
				metadata: {workflow: 'test', status: 'completed'},
			};
			mockRequest.post.mockResolvedValueOnce(updateResponse);

			const updatedThread = await langbase.threads.update({
				threadId: 'workflow_thread',
				metadata: {workflow: 'test', status: 'completed'},
			});
			expect(updatedThread.metadata.status).toBe('completed');

			// 5. Get thread details
			mockRequest.get.mockResolvedValueOnce(updateResponse);

			const retrievedThread = await langbase.threads.get({
				threadId: 'workflow_thread',
			});
			expect(retrievedThread.metadata.status).toBe('completed');

			// 6. Delete thread
			const deleteResponse = {success: true};
			mockRequest.delete.mockResolvedValueOnce(deleteResponse);

			const deleteResult = await langbase.threads.delete({
				threadId: 'workflow_thread',
			});
			expect(deleteResult.success).toBe(true);

			// Verify all calls were made
			expect(mockRequest.post).toHaveBeenCalledTimes(3); // create, append, update
			expect(mockRequest.get).toHaveBeenCalledTimes(2); // list messages, get thread
			expect(mockRequest.delete).toHaveBeenCalledTimes(1); // delete thread
		});
	});
});