import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from '../langbase';

describe('Langbase Agent API - langbase.agent.*', () => {
	let langbase: Langbase;
	const langbaseApiKey = process.env.LANGBASE_API_KEY || '';
	const openaiApiKey = process.env.OPENAI_API_KEY || '';
	const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
	const googleApiKey = process.env.GOOGLE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey: langbaseApiKey});
	});

	describe('agent.run() - non-streaming', () => {
		it('should successfully run agent with string input', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'What is 2+2? Answer briefly.',
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
			expect(typeof result.output).toBe('string');
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('model');
			expect(result).toHaveProperty('choices');
			expect(Array.isArray(result.choices)).toBe(true);
			expect(result).toHaveProperty('usage');
			expect(result.usage).toHaveProperty('prompt_tokens');
			expect(result.usage).toHaveProperty('completion_tokens');
		}, 30000);

		it('should successfully run agent with array of messages', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: [
					{role: 'system', content: 'You are a helpful math tutor'},
					{role: 'user', content: 'What is 5 * 6?'},
				],
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
			expect(typeof result.output).toBe('string');
		}, 30000);

		it('should successfully run agent with custom instructions', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Tell me a joke',
				instructions: 'Always respond in a professional and concise manner',
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with temperature setting', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Generate a creative story opening in one sentence',
				temperature: 0.9,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with max_tokens limit', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Explain quantum physics',
				max_tokens: 50,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
			expect(result.usage.completion_tokens).toBeLessThanOrEqual(50);
		}, 30000);

		it('should successfully run agent with top_p parameter', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'What is AI?',
				top_p: 0.9,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with presence_penalty', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'List 3 colors',
				presence_penalty: 0.5,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with frequency_penalty', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Write a short poem',
				frequency_penalty: 0.5,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with stop sequences', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Count from 1 to 10',
				stop: ['5', '6'],
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should successfully run agent with tools/function calling', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'What is the weather in San Francisco?',
				tools: [
					{
						type: 'function',
						function: {
							name: 'get_weather',
							description: 'Get the current weather for a location',
							parameters: {
								type: 'object',
								properties: {
									location: {
										type: 'string',
										description: 'The city name',
									},
								},
								required: ['location'],
							},
						},
					},
				],
				tool_choice: 'auto',
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
			expect(result).toHaveProperty('choices');
			// Check if tool was called
			if (result.choices[0]?.message?.tool_calls) {
				expect(result.choices[0].message.tool_calls.length).toBeGreaterThan(0);
			}
		}, 30000);

		it('should successfully run agent with parallel tool calls disabled', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Get weather in NYC and LA',
				tools: [
					{
						type: 'function',
						function: {
							name: 'get_weather',
							description: 'Get weather',
							parameters: {
								type: 'object',
								properties: {
									location: {type: 'string'},
								},
								required: ['location'],
							},
						},
					},
				],
				parallel_tool_calls: false,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);
	});

	describe('agent.run() - streaming', () => {
		it('should successfully run agent with streaming enabled', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Count from 1 to 5',
				stream: true,
				apiKey: openaiApiKey,
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

		it('should successfully stream with custom temperature', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Tell me a short fact',
				temperature: 0.5,
				stream: true,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('stream');

			const reader = result.stream.getReader();
			let hasData = false;

			while (true) {
				const {done, value} = await reader.read();
				if (done) break;
				if (value) hasData = true;
			}

			expect(hasData).toBe(true);
		}, 30000);
	});

	describe('agent.run() with different models', () => {
		it('should successfully run with OpenAI GPT-4o', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o',
				input: 'Say hello in one word',
				max_tokens: 10,
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it.skipIf(!anthropicApiKey)('should successfully run with Anthropic Claude', async () => {
			const result = await langbase.agent.run({
				model: 'anthropic:claude-3-5-haiku-20241022',
				input: 'Say hello',
				max_tokens: 10,
				apiKey: anthropicApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it.skipIf(!googleApiKey)('should successfully run with Google Gemini', async () => {
			const result = await langbase.agent.run({
				model: 'google:gemini-2.0-flash-exp',
				input: 'Say hello',
				max_tokens: 10,
				apiKey: googleApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);
	});

	describe('agent.run() with advanced features', () => {
		it.skip('should successfully run agent with custom model parameters', async () => {
			// TODO: customModelParams needs backend support - currently returns error:
			// "Unrecognized request argument supplied: customModelParams"
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: 'Hello',
				customModelParams: {
					logprobs: true,
					top_logprobs: 2,
				},
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
		}, 30000);

		it('should handle multi-turn conversation with agent', async () => {
			const result = await langbase.agent.run({
				model: 'openai:gpt-4o-mini',
				input: [
					{role: 'user', content: 'My name is Alice'},
					{role: 'assistant', content: 'Nice to meet you, Alice!'},
					{role: 'user', content: 'What is my name?'},
				],
				apiKey: openaiApiKey,
			});

			expect(result).toHaveProperty('output');
			expect(result.output.toLowerCase()).toContain('alice');
		}, 30000);
	});
});
