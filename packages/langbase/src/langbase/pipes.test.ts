import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Pipes API - langbase.pipes.*', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';
	const createdPipes: string[] = []; // Track created pipes for cleanup

	// Shared test pipe for CRUD operations
	let sharedPipeName: string;
	let sharedPipeResult: any;

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	// Clean up all created resources after all tests
	afterAll(async () => {
		// Note: Langbase API doesn't have a delete pipe endpoint yet
		// Pipes created during tests will need manual cleanup
		console.log('\n⚠️  Created pipes during tests (manual cleanup needed):');
		createdPipes.forEach(name => console.log(`  - ${name}`));
	});

	describe('pipes.run() - non-streaming', () => {
		it('should successfully run a pipe with messages and return completion', async () => {
			const result = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Hello, how are you?'}],
			});

			expect(result).toHaveProperty('completion');
			expect(typeof result.completion).toBe('string');
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('model');
			expect(result).toHaveProperty('choices');
			expect(Array.isArray(result.choices)).toBe(true);
			expect(result).toHaveProperty('usage');
			expect(result.usage).toHaveProperty('prompt_tokens');
			expect(result.usage).toHaveProperty('completion_tokens');
			expect(result.usage).toHaveProperty('total_tokens');
		}, 30000);

		it('should successfully run a pipe with variables', async () => {
			const result = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Explain {{topic}}'}],
				variables: [{name: 'topic', value: 'quantum computing'}],
			});

			expect(result).toHaveProperty('completion');
			expect(typeof result.completion).toBe('string');
		}, 30000);

		it('should successfully run a pipe with threadId and receive threadId in response', async () => {
			const firstResult = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Hello, tell me a fun fact'}],
			});

			// Verify we get a threadId back
			expect(firstResult).toHaveProperty('threadId');
			expect(firstResult.threadId).toBeTruthy();
			expect(typeof firstResult.threadId).toBe('string');
			const threadId = firstResult.threadId;

			// Run again with the same threadId to test that threadId is accepted
			const secondResult = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Tell me another one'}],
				threadId: threadId,
			});

			// Verify the threadId is maintained
			expect(secondResult).toHaveProperty('threadId');
			expect(secondResult.threadId).toBe(threadId);
			expect(secondResult).toHaveProperty('completion');
			expect(typeof secondResult.completion).toBe('string');
		}, 30000);

		it('should successfully run a pipe using pipe API key directly', async () => {
			const pipeApiKey = process.env.LANGBASE_TEST_PIPE_API_KEY || '';

			const result = await langbase.pipes.run({
				apiKey: pipeApiKey,
				messages: [{role: 'user', content: 'Say hello'}],
				stream: false,
			});

			expect(result).toHaveProperty('completion');
			expect(typeof result.completion).toBe('string');
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('model');
		}, 30000);

		it('should handle JSON mode when json: true', async () => {
			const result = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [
					{
						role: 'user',
						content: 'Return a JSON object with a single key "message" set to "hello"',
					},
				],
				json: true,
			});

			expect(result).toHaveProperty('completion');

			// LLMs may wrap JSON in markdown code blocks, so we need to strip them
			let jsonString = result.completion.trim();
			if (jsonString.startsWith('```json')) {
				jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
			} else if (jsonString.startsWith('```')) {
				jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
			}

			// The completion should be parseable as JSON after stripping markdown
			expect(() => JSON.parse(jsonString)).not.toThrow();
			const parsed = JSON.parse(jsonString);
			expect(parsed).toHaveProperty('message');
		}, 30000);
	});

	describe('pipes.run() - streaming', () => {
		it('should successfully run a pipe with streaming enabled', async () => {
			const result = await langbase.pipes.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Count from 1 to 5'}],
				stream: true,
			});

			expect(result).toHaveProperty('stream');
			expect(result.stream).toBeInstanceOf(ReadableStream);

			let chunks = '';
			const reader = result.stream.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const {done, value} = await reader.read();
				if (done) break;
				chunks += decoder.decode(value, {stream: true});
			}

			expect(chunks.length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully stream with threadId', async () => {
			const result = await langbase.pipes.run({
				name: 'sdk-pipe-chat',
				messages: [{role: 'user', content: 'Hello'}],
				stream: true,
			});

			expect(result).toHaveProperty('threadId');
			expect(result.threadId).toBeTruthy();
		}, 30000);
	});

	describe('pipes.create() & pipes.update() - combined CRUD operations', () => {
		it('should create pipe with all options, then update it (combined test)', async () => {
			const pipeName = `test-pipe-crud-${Date.now()}`;
			createdPipes.push(pipeName); // Track for cleanup

			// Test 1: Create pipe with messages, variables, and various options
			const createResult = await langbase.pipes.create({
				name: pipeName,
				description: 'Test pipe for CRUD operations',
				model: 'openai:gpt-4o-mini',
				temperature: 0.7,
				max_tokens: 500,
				messages: [
					{
						role: 'system',
						content: 'You are a helpful assistant that talks about {{topic}}',
					},
				],
				variables: [{name: 'topic', value: 'science'}],
			});

			// Verify creation with all properties
			expect(createResult).toHaveProperty('name', pipeName);
			expect(createResult).toHaveProperty('description', 'Test pipe for CRUD operations');
			expect(createResult).toHaveProperty('api_key');
			expect(createResult).toHaveProperty('url');
			expect(createResult).toHaveProperty('owner_login');

			// Test 2: Update the same pipe
			const updateResult = await langbase.pipes.update({
				name: pipeName,
				description: 'Updated description after creation',
				temperature: 0.9,
			});

			// Verify update
			expect(updateResult).toHaveProperty('name', pipeName);
			expect(updateResult).toHaveProperty('description', 'Updated description after creation');
		}, 30000);

		it('should create and upsert pipe (tests upsert functionality)', async () => {
			const pipeName = `test-pipe-upsert-${Date.now()}`;
			createdPipes.push(pipeName); // Track for cleanup

			// Create first time with upsert
			const result1 = await langbase.pipes.create({
				name: pipeName,
				description: 'First version',
				model: 'openai:gpt-4o-mini',
				upsert: true,
			});

			expect(result1).toHaveProperty('name', pipeName);
			expect(result1).toHaveProperty('description', 'First version');

			// Upsert again (should update existing)
			const result2 = await langbase.pipes.create({
				name: pipeName,
				description: 'Updated via upsert',
				model: 'openai:gpt-4o-mini',
				upsert: true,
			});

			expect(result2).toHaveProperty('name', pipeName);
			expect(result2).toHaveProperty('description', 'Updated via upsert');
		}, 30000);
	});

	describe('pipes.list()', () => {
		it('should successfully list all pipes', async () => {
			const result = await langbase.pipes.list();

			expect(Array.isArray(result)).toBe(true);
			if (result.length > 0) {
				expect(result[0]).toHaveProperty('name');
				expect(result[0]).toHaveProperty('description');
				expect(result[0]).toHaveProperty('model');
				expect(result[0]).toHaveProperty('owner_login');
			}
		}, 30000);
	});

	describe('deprecated pipe.* methods (backwards compatibility)', () => {
		it('should work with deprecated pipe.run() method', async () => {
			const result = await langbase.pipe.run({
				name: 'sdk-less-wordy',
				messages: [{role: 'user', content: 'Hello'}],
			});

			expect(result).toHaveProperty('completion');
		}, 30000);

		it('should work with deprecated pipe.list() method', async () => {
			const result = await langbase.pipe.list();

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});
});
