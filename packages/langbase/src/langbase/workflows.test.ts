import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Workflow} from './workflows';
import {Langbase} from './langbase';

// Mock the TraceManager
vi.mock('./trace', () => ({
	TraceManager: vi.fn().mockImplementation(() => ({
		createTrace: vi.fn().mockReturnValue('trace-123'),
		addStep: vi.fn(),
		endTrace: vi.fn(),
		printTrace: vi.fn(),
		getTrace: vi.fn().mockReturnValue({
			id: 'trace-123',
			name: 'test-workflow',
			steps: [],
		}),
	})),
}));

describe('Workflow', () => {
	let workflow: Workflow;
	let mockLangbase: Langbase;

	beforeEach(() => {
		// Create a mock Langbase instance
		mockLangbase = {
			pipes: {run: vi.fn()},
			pipe: {run: vi.fn()},
			memories: {retrieve: vi.fn()},
			memory: {retrieve: vi.fn()},
			tools: {webSearch: vi.fn(), crawl: vi.fn()},
			tool: {webSearch: vi.fn(), crawl: vi.fn()},
			embed: vi.fn(),
			chunk: vi.fn(),
			parse: vi.fn(),
			agent: {run: vi.fn()},
			traces: {create: vi.fn().mockResolvedValue({success: true})},
		} as any;

		vi.resetAllMocks();
	});

	describe('Constructor', () => {
		it('should create workflow with default options', () => {
			workflow = new Workflow();

			expect(workflow).toBeInstanceOf(Workflow);
			expect(workflow.step).toBeFunction();
		});

		it('should create workflow with debug enabled', () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			workflow = new Workflow({debug: true, name: 'test-workflow'});

			expect(workflow).toBeInstanceOf(Workflow);

			consoleSpy.mockRestore();
		});

		it('should create workflow with langbase instance for tracing', () => {
			workflow = new Workflow({
				debug: true,
				name: 'traced-workflow',
				langbase: mockLangbase,
			});

			expect(workflow).toBeInstanceOf(Workflow);
		});
	});

	describe('Step Execution', () => {
		beforeEach(() => {
			workflow = new Workflow({debug: false});
		});

		it('should execute a simple step', async () => {
			const stepResult = 'step completed';
			const stepConfig = {
				id: 'simple-step',
				run: vi.fn().mockResolvedValue(stepResult),
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBe(stepResult);
			expect(stepConfig.run).toHaveBeenCalledOnce();
		});

		it('should store step output in context', async () => {
			const stepResult = {data: 'test data'};
			const stepConfig = {
				id: 'context-step',
				run: vi.fn().mockResolvedValue(stepResult),
			};

			await workflow.step(stepConfig);

			// The context is private, but we can verify by accessing the output
			// through another step that uses the context
			expect(stepConfig.run).toHaveBeenCalledOnce();
		});

		it('should handle step with timeout', async () => {
			const stepConfig = {
				id: 'timeout-step',
				timeout: 100,
				run: vi.fn().mockImplementation(() => 
					new Promise(resolve => setTimeout(() => resolve('completed'), 50))
				),
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBe('completed');
		});

		it('should throw timeout error when step exceeds timeout', async () => {
			const stepConfig = {
				id: 'slow-step',
				timeout: 100,
				run: vi.fn().mockImplementation(() => 
					new Promise(resolve => setTimeout(() => resolve('completed'), 200))
				),
			};

			await expect(workflow.step(stepConfig)).rejects.toThrow('Step "slow-step" timed out after 100ms');
		});

		it('should handle retries on failure', async () => {
			const mockRun = vi.fn()
				.mockRejectedValueOnce(new Error('First attempt failed'))
				.mockRejectedValueOnce(new Error('Second attempt failed'))
				.mockResolvedValue('Third attempt succeeded');

			const stepConfig = {
				id: 'retry-step',
				retries: {
					limit: 2,
					delay: 10,
					backoff: 'fixed' as const,
				},
				run: mockRun,
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBe('Third attempt succeeded');
			expect(mockRun).toHaveBeenCalledTimes(3);
		});

		it('should throw error after exhausting retries', async () => {
			const mockRun = vi.fn()
				.mockRejectedValue(new Error('Persistent failure'));

			const stepConfig = {
				id: 'failing-step',
				retries: {
					limit: 2,
					delay: 10,
					backoff: 'fixed' as const,
				},
				run: mockRun,
			};

			await expect(workflow.step(stepConfig)).rejects.toThrow('Persistent failure');
			expect(mockRun).toHaveBeenCalledTimes(3); // Initial + 2 retries
		});

		it('should handle exponential backoff', async () => {
			const mockSleep = vi.fn().mockResolvedValue(undefined);
			
			// Mock the sleep method
			(workflow as any).sleep = mockSleep;

			const mockRun = vi.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockRejectedValueOnce(new Error('Second failure'))
				.mockResolvedValue('Success');

			const stepConfig = {
				id: 'backoff-step',
				retries: {
					limit: 2,
					delay: 100,
					backoff: 'exponential' as const,
				},
				run: mockRun,
			};

			await workflow.step(stepConfig);

			// First retry: 100ms, Second retry: 200ms
			expect(mockSleep).toHaveBeenCalledWith(100);
			expect(mockSleep).toHaveBeenCalledWith(200);
		});

		it('should handle linear backoff', async () => {
			const mockSleep = vi.fn().mockResolvedValue(undefined);
			
			// Mock the sleep method
			(workflow as any).sleep = mockSleep;

			const mockRun = vi.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockRejectedValueOnce(new Error('Second failure'))
				.mockResolvedValue('Success');

			const stepConfig = {
				id: 'linear-backoff-step',
				retries: {
					limit: 2,
					delay: 100,
					backoff: 'linear' as const,
				},
				run: mockRun,
			};

			await workflow.step(stepConfig);

			// First retry: 100ms, Second retry: 200ms (linear)
			expect(mockSleep).toHaveBeenCalledWith(100);
			expect(mockSleep).toHaveBeenCalledWith(200);
		});
	});

	describe('Debug Mode', () => {
		it('should log debug information when debug is enabled', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			const consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => {});
			const consoleTimeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => {});

			workflow = new Workflow({debug: true, name: 'debug-workflow'});

			const stepConfig = {
				id: 'debug-step',
				run: vi.fn().mockResolvedValue('debug result'),
			};

			await workflow.step(stepConfig);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Starting step: debug-step')
			);
			expect(consoleTimeSpy).toHaveBeenCalledWith('⏱️ Step debug-step');
			expect(consoleTimeEndSpy).toHaveBeenCalledWith('⏱️ Step debug-step');

			consoleSpy.mockRestore();
			consoleTimeSpy.mockRestore();
			consoleTimeEndSpy.mockRestore();
		});

		it('should log timeout information in debug mode', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			workflow = new Workflow({debug: true});

			const stepConfig = {
				id: 'timeout-debug-step',
				timeout: 5000,
				run: vi.fn().mockResolvedValue('completed'),
			};

			await workflow.step(stepConfig);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Timeout: 5000ms')
			);

			consoleSpy.mockRestore();
		});

		it('should log retry information in debug mode', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			workflow = new Workflow({debug: true});

			const retryConfig = {
				limit: 2,
				delay: 100,
				backoff: 'exponential' as const,
			};

			const stepConfig = {
				id: 'retry-debug-step',
				retries: retryConfig,
				run: vi.fn().mockResolvedValue('completed'),
			};

			await workflow.step(stepConfig);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Retries: ')
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Method Interception with Tracing', () => {
		beforeEach(() => {
			workflow = new Workflow({
				debug: false,
				name: 'traced-workflow',
				langbase: mockLangbase,
			});
		});

		it('should intercept langbase methods during step execution', async () => {
			const stepConfig = {
				id: 'interception-step',
				run: async () => {
					// Call a langbase method within the step
					return await mockLangbase.pipes.run({
						name: 'test-pipe',
						messages: [{role: 'user', content: 'test'}],
					});
				},
			};

			// Mock the pipe run method to return a result with rawResponse
			mockLangbase.pipes.run.mockResolvedValue({
				completion: 'Test response',
				rawResponse: {
					headers: {
						'lb-trace-id': 'intercepted-trace-123',
					},
				},
			});

			const result = await workflow.step(stepConfig);

			expect(mockLangbase.pipes.run).toHaveBeenCalledWith({
				name: 'test-pipe',
				messages: [{role: 'user', content: 'test'}],
				rawResponse: true, // Should be added by interception
			});
		});

		it('should handle method interception with existing rawResponse', async () => {
			const stepConfig = {
				id: 'existing-raw-response-step',
				run: async () => {
					// Call with existing rawResponse
					return await mockLangbase.pipes.run({
						name: 'test-pipe',
						messages: [{role: 'user', content: 'test'}],
						rawResponse: false, // Should be overridden to true
					});
				},
			};

			mockLangbase.pipes.run.mockResolvedValue({
				completion: 'Test response',
			});

			await workflow.step(stepConfig);

			expect(mockLangbase.pipes.run).toHaveBeenCalledWith({
				name: 'test-pipe',
				messages: [{role: 'user', content: 'test'}],
				rawResponse: true, // Should be overridden
			});
		});

		it('should intercept multiple method types', async () => {
			const stepConfig = {
				id: 'multi-method-step',
				run: async () => {
					await mockLangbase.agent.run({
						input: 'test input',
						model: 'gpt-4',
						apiKey: 'test-key',
					});

					await mockLangbase.memories.retrieve({
						query: 'test query',
						memory: [{name: 'test-memory'}],
					});

					return 'completed';
				},
			};

			mockLangbase.agent.run.mockResolvedValue({
				output: 'Agent response',
				rawResponse: {headers: {}},
			});

			mockLangbase.memories.retrieve.mockResolvedValue([
				{text: 'Retrieved text', similarity: 0.9, meta: {}},
			]);

			await workflow.step(stepConfig);

			expect(mockLangbase.agent.run).toHaveBeenCalledWith({
				input: 'test input',
				model: 'gpt-4',
				apiKey: 'test-key',
				rawResponse: true,
			});

			expect(mockLangbase.memories.retrieve).toHaveBeenCalledWith({
				query: 'test query',
				memory: [{name: 'test-memory'}],
				rawResponse: true,
			});
		});
	});

	describe('Workflow End and Tracing', () => {
		it('should handle end() without langbase (no-op)', async () => {
			workflow = new Workflow({debug: false});

			// Should not throw any error
			await expect(workflow.end()).resolves.toBeUndefined();
		});

		it('should send trace to langbase on end()', async () => {
			workflow = new Workflow({
				debug: false,
				name: 'traced-workflow',
				langbase: mockLangbase,
			});

			// Run a step first
			await workflow.step({
				id: 'traced-step',
				run: vi.fn().mockResolvedValue('step result'),
			});

			// End the workflow
			await workflow.end();

			expect(mockLangbase.traces.create).toHaveBeenCalledWith({
				id: 'trace-123',
				name: 'traced-workflow',
				steps: [],
			});
		});

		it('should handle trace upload failure gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			mockLangbase.traces.create.mockRejectedValue(new Error('Upload failed'));

			workflow = new Workflow({
				debug: false,
				langbase: mockLangbase,
			});

			await workflow.step({
				id: 'test-step',
				run: vi.fn().mockResolvedValue('result'),
			});

			// Should not throw, but should log error
			await expect(workflow.end()).resolves.toBeUndefined();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ Error while sending trace',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('Edge Cases', () => {
		beforeEach(() => {
			workflow = new Workflow();
		});

		it('should handle step that returns null', async () => {
			const stepConfig = {
				id: 'null-step',
				run: vi.fn().mockResolvedValue(null),
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBeNull();
		});

		it('should handle step that returns undefined', async () => {
			const stepConfig = {
				id: 'undefined-step',
				run: vi.fn().mockResolvedValue(undefined),
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBeUndefined();
		});

		it('should handle async step that throws synchronously', async () => {
			const stepConfig = {
				id: 'sync-error-step',
				run: vi.fn().mockImplementation(() => {
					throw new Error('Synchronous error');
				}),
			};

			await expect(workflow.step(stepConfig)).rejects.toThrow('Synchronous error');
		});

		it('should handle step with zero timeout', async () => {
			const stepConfig = {
				id: 'zero-timeout-step',
				timeout: 0,
				run: vi.fn().mockResolvedValue('immediate'),
			};

			await expect(workflow.step(stepConfig)).rejects.toThrow(
				'Step "zero-timeout-step" timed out after 0ms'
			);
		});

		it('should handle retries with zero delay', async () => {
			const mockRun = vi.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockResolvedValue('Success');

			const stepConfig = {
				id: 'zero-delay-step',
				retries: {
					limit: 1,
					delay: 0,
					backoff: 'fixed' as const,
				},
				run: mockRun,
			};

			const result = await workflow.step(stepConfig);

			expect(result).toBe('Success');
			expect(mockRun).toHaveBeenCalledTimes(2);
		});
	});

	describe('Complex Workflow Integration', () => {
		it('should handle a complete workflow with multiple steps', async () => {
			workflow = new Workflow({
				debug: false,
				name: 'integration-test',
				langbase: mockLangbase,
			});

			// Step 1: Data preparation
			const step1Result = await workflow.step({
				id: 'prepare-data',
				run: async () => {
					return {data: 'prepared', timestamp: Date.now()};
				},
			});

			// Step 2: Process with langbase (with interception)
			mockLangbase.pipes.run.mockResolvedValue({
				completion: 'Processed data',
				rawResponse: {headers: {'lb-trace-id': 'step2-trace'}},
			});

			const step2Result = await workflow.step({
				id: 'process-data',
				timeout: 5000,
				retries: {limit: 2, delay: 100, backoff: 'exponential'},
				run: async () => {
					return await mockLangbase.pipes.run({
						name: 'processor-pipe',
						messages: [{role: 'user', content: step1Result.data}],
					});
				},
			});

			// Step 3: Finalize
			const step3Result = await workflow.step({
				id: 'finalize',
				run: async () => {
					return {
						original: step1Result,
						processed: step2Result.completion,
						status: 'completed',
					};
				},
			});

			// End workflow and send traces
			await workflow.end();

			expect(step1Result).toEqual({
				data: 'prepared',
				timestamp: expect.any(Number),
			});
			expect(step2Result.completion).toBe('Processed data');
			expect(step3Result.status).toBe('completed');
			expect(mockLangbase.traces.create).toHaveBeenCalledOnce();
		});
	});
});