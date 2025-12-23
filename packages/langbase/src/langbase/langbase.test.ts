import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Langbase, LangbaseOptions} from './langbase';

// Mock the Request class
vi.mock('../common/request');

describe('Langbase Basic Tests', () => {
	let langbase: Langbase;
	const mockApiKey = 'test-api-key';

	beforeEach(() => {
		langbase = new Langbase({apiKey: mockApiKey});
		vi.resetAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize with default options when no options provided', () => {
			const lb = new Langbase();
			expect(lb).toBeInstanceOf(Langbase);
		});

		it('should initialize with provided options', () => {
			const options: LangbaseOptions = {
				apiKey: 'custom-key',
				baseUrl: 'https://eu-api.langbase.com',
			};
			const lb = new Langbase(options);
			expect(lb).toBeInstanceOf(Langbase);
		});

		it('should have all required methods and properties', () => {
			expect(langbase.pipes).toBeDefined();
			expect(langbase.pipes.list).toBeFunction();
			expect(langbase.pipes.create).toBeFunction();
			expect(langbase.pipes.update).toBeFunction();
			expect(langbase.pipes.run).toBeFunction();

			expect(langbase.memories).toBeDefined();
			expect(langbase.memories.list).toBeFunction();
			expect(langbase.memories.create).toBeFunction();
			expect(langbase.memories.delete).toBeFunction();
			expect(langbase.memories.retrieve).toBeFunction();

			expect(langbase.tools).toBeDefined();
			expect(langbase.tools.webSearch).toBeFunction();
			expect(langbase.tools.crawl).toBeFunction();

			expect(langbase.threads).toBeDefined();
			expect(langbase.agent).toBeDefined();
			expect(langbase.workflow).toBeFunction();
		});
	});

	describe('Pipes Operations', () => {
		it('should call request.get for pipes.list', async () => {
			const mockPipes = [
				{
					name: 'test-pipe',
					description: 'Test pipe',
					status: 'public' as const,
					owner_login: 'testuser',
					url: 'https://langbase.com/testuser/test-pipe',
					model: 'gpt-4',
					stream: false,
					json: false,
					store: true,
					moderate: false,
					top_p: 1,
					max_tokens: 100,
					temperature: 0.7,
					presence_penalty: 0,
					frequency_penalty: 0,
					stop: [],
					tool_choice: 'auto' as const,
					parallel_tool_calls: true,
					messages: [],
					variables: [],
					tools: [],
					memory: [],
				},
			];

			const mockGet = vi.fn().mockResolvedValue(mockPipes);
			(langbase as any).request = {get: mockGet};

			const result = await langbase.pipes.list();

			expect(mockGet).toHaveBeenCalledWith({
				endpoint: '/v1/pipes',
			});
			expect(result).toEqual(mockPipes);
		});

		it('should create a pipe successfully', async () => {
			const createOptions = {
				name: 'new-pipe',
				description: 'A new test pipe',
			};

			const mockResponse = {
				name: 'new-pipe',
				description: 'A new test pipe',
				status: 'private' as const,
				owner_login: 'testuser',
				url: 'https://langbase.com/testuser/new-pipe',
				type: 'chat' as const,
				api_key: 'pipe-api-key',
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.pipes.create(createOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/pipes',
				body: createOptions,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when neither pipe name nor API key provided for run', async () => {
			await expect(
				langbase.pipes.run({
					messages: [{role: 'user', content: 'Hello'}],
				} as any),
			).rejects.toThrow('Pipe name or Pipe API key is required to run the pipe.');
		});

		it('should run pipe with name', async () => {
			const runOptions = {
				name: 'test-pipe',
				messages: [{role: 'user' as const, content: 'Hello'}],
			};

			const mockResponse = {
				completion: 'Hi there!',
				id: 'response-id',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [],
				usage: {
					prompt_tokens: 10,
					completion_tokens: 5,
					total_tokens: 15,
				},
				system_fingerprint: null,
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.pipes.run(runOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/pipes/run',
				body: runOptions,
				headers: {},
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('Memories Operations', () => {
		it('should create memory successfully', async () => {
			const createOptions = {
				name: 'test-memory',
				description: 'Test memory for unit tests',
			};

			const mockResponse = {
				name: 'test-memory',
				description: 'Test memory for unit tests',
				owner_login: 'testuser',
				url: 'https://langbase.com/testuser/test-memory',
				chunk_size: 1000,
				chunk_overlap: 200,
				embedding_model: 'openai:text-embedding-3-large' as const,
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.memories.create(createOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/memory',
				body: createOptions,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should list all memories', async () => {
			const mockMemories = [
				{
					name: 'memory1',
					description: 'First memory',
					owner_login: 'testuser',
					url: 'https://langbase.com/testuser/memory1',
					embeddingModel: 'openai:text-embedding-3-large' as const,
				},
			];

			const mockGet = vi.fn().mockResolvedValue(mockMemories);
			(langbase as any).request = {get: mockGet};

			const result = await langbase.memories.list();

			expect(mockGet).toHaveBeenCalledWith({
				endpoint: '/v1/memory',
			});
			expect(result).toEqual(mockMemories);
		});
	});

	describe('Agent Operations', () => {
		it('should throw error when API key is not provided', async () => {
			await expect(
				langbase.agent.run({
					input: 'Hello',
					model: 'gpt-4',
					apiKey: '',
				}),
			).rejects.toThrow('LLM API key is required to run this LLM.');
		});

		it('should run agent with basic options', async () => {
			const runOptions = {
				input: 'Hello, how are you?',
				model: 'gpt-4',
				apiKey: 'llm-api-key',
			};

			const mockResponse = {
				output: 'I am doing well, thank you!',
				id: 'agent-run-id',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4',
				choices: [],
				usage: {
					prompt_tokens: 15,
					completion_tokens: 10,
					total_tokens: 25,
				},
				system_fingerprint: null,
			};

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.agent.run(runOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/agent/run',
				body: runOptions,
				headers: {
					'LB-LLM-Key': 'llm-api-key',
				},
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('Tools Operations', () => {
		it('should perform web search', async () => {
			const searchOptions = {
				query: 'langbase sdk',
				service: 'exa' as const,
				apiKey: 'web-search-key',
			};

			const mockResponse = [
				{
					url: 'https://langbase.com/docs',
					content: 'Langbase documentation content',
				},
			];

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.tools.webSearch(searchOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/tools/web-search',
				body: searchOptions,
				headers: {
					'LB-WEB-SEARCH-KEY': 'web-search-key',
				},
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('Utility Functions', () => {
		it('should generate embeddings', async () => {
			const embedOptions = {
				chunks: ['text chunk 1', 'text chunk 2'],
			};

			const mockResponse = [
				[0.1, 0.2, 0.3],
				[0.4, 0.5, 0.6],
			];

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.embed(embedOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/embed',
				body: embedOptions,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should chunk document content', async () => {
			const chunkOptions = {
				content: 'This is a long document that needs to be chunked...',
			};

			const mockResponse = [
				'This is a long document',
				'document that needs to be chunked...',
			];

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			const result = await langbase.chunk(chunkOptions);

			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/chunker',
				body: chunkOptions,
			});
			expect(result).toEqual(mockResponse);
		});
	});
});