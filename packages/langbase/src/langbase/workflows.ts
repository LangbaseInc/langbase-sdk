import {TraceManager, StepTrace} from './trace';
import {Langbase} from './langbase';

// Declare the global langbase instance
declare global {
	var langbase: Langbase;
	var _activeTraceCollector: ((traceId: string) => void) | null;
	var _workflowDebugEnabled: boolean;
}

type WorkflowContext = {
	outputs: Record<string, any>;
};

type RetryConfig = {
	limit: number;
	delay: number;
	backoff: 'exponential' | 'linear' | 'fixed';
};

type StepConfig<T = any> = {
	id: string;
	timeout?: number;
	retries?: RetryConfig;
	run: () => Promise<T>;
};

type WorkflowConfig = {
	debug?: boolean;
	name: string;
	langbase: Langbase;
};

class TimeoutError extends Error {
	constructor(stepId: string, timeout: number) {
		super(`Step "${stepId}" timed out after ${timeout}ms`);
		this.name = 'TimeoutError';
	}
}

// Setup the global trace collector for cross-instance communication
if (typeof global._activeTraceCollector === 'undefined') {
	global._activeTraceCollector = null;
}

// For debug flag
if (typeof global._workflowDebugEnabled === 'undefined') {
	global._workflowDebugEnabled = false;
}

export class Workflow {
	private context: WorkflowContext;
	private debug: boolean;
	private name: string;
	private traceManager: TraceManager;
	private traceId: string;
	private langbase: Langbase;

	private originalMethods: Map<string, Function> = new Map();
	public readonly step: <T = any>(config: StepConfig<T>) => Promise<T>;

	constructor(config: WorkflowConfig) {
		this.context = {outputs: {}};
		this.debug = config.debug ?? false;
		this.name = config.name;
		this.langbase = config.langbase;
		this.traceManager = new TraceManager();
		this.traceId = this.traceManager.createTrace(this.name);
		this.step = this._step.bind(this);

		// Set global debug flag
		global._workflowDebugEnabled = this.debug;
	}

	/**
	 * Replace a method in the Langbase instance with a traced version
	 */
	private interceptMethod(obj: any, method: string, path: string = ''): void {
		if (!obj || typeof obj[method] !== 'function') return;

		const fullPath = path ? `${path}.${method}` : method;
		const originalMethod = obj[method];

		// Only replace if not already intercepted
		if (!this.originalMethods.has(fullPath)) {
			this.originalMethods.set(fullPath, originalMethod);

			const debug = this.debug;

			// Replace with intercepted version
			obj[method] = async function (...args: any[]) {
				// Add custom arguments for tracing
				// Add rawResponse to the options if it's an object
				const lastArg = args[args.length - 1];
				const newArgs = [...args];

				if (lastArg && typeof lastArg === 'object') {
					newArgs[newArgs.length - 1] = {
						...lastArg,
						rawResponse: true,
					};
				}
				// Append a new object if the last argument is not an object
				else {
					newArgs.push({rawResponse: true});
				}

				const result = await originalMethod.apply(this, newArgs);
				console.log(`🔄 Intercepted method: ${fullPath}`, result);

				// Process result for tracing if we have an active collector
				if (global._activeTraceCollector) {
					// Extract or create traceId
					let traceId: string | undefined;

					// Check if result is an object with response headers
					if (result && typeof result === 'object') {
						// Extract from response headers
						if ('rawResponse' in result && result.rawResponse) {
							// Check for lb-trace-id in headers
							if (result.rawResponse.headers['lb-trace-id']) {
								// Plain object headers
								traceId =
									result.rawResponse.headers['lb-trace-id'];
							}
						}

						// Notify collector if traceId was found
						if (traceId && global._activeTraceCollector) {
							if (debug)
								console.log(
									`🔍 Trace ID extracted: ${traceId}`,
								);
							global._activeTraceCollector(traceId);
						}
					}
				}

				return result;
			};
		}
	}

	/**
	 * Restore all original methods that were intercepted
	 */
	private restoreOriginalMethods(): void {
		this.originalMethods.forEach((originalMethod, path) => {
			// Parse the path to find the object and method
			const parts = path.split('.');
			const methodName = parts.pop()!;
			let obj: any = this.langbase;

			// Navigate to the correct object
			for (const part of parts) {
				if (obj && typeof obj === 'object' && part in obj) {
					obj = obj[part as keyof typeof obj]; // Type safe access
				} else {
					return; // Skip if path no longer exists
				}
			}

			// Restore original method
			if (
				obj &&
				methodName in obj &&
				typeof obj[methodName] === 'function'
			) {
				obj[methodName] = originalMethod;
			}
		});

		// Clear the map
		this.originalMethods.clear();
	}

	/**
	 * Intercept all important methods in the Langbase instance
	 */
	private setupMethodInterceptors(): void {
		// Agent methods
		this.interceptMethod(this.langbase.agent, 'run', 'agent');

		// Pipes methods
		this.interceptMethod(this.langbase.pipes, 'run', 'pipes');
		this.interceptMethod(this.langbase.pipe, 'run', 'pipe');

		// Memory methods
		if (this.langbase.memories) {
			this.interceptMethod(
				this.langbase.memories,
				'retrieve',
				'memories',
			);
		}
		if (this.langbase.memory) {
			this.interceptMethod(this.langbase.memory, 'retrieve', 'memory');
		}

		// Tool methods
		if (this.langbase.tools) {
			this.interceptMethod(this.langbase.tools, 'webSearch', 'tools');
			this.interceptMethod(this.langbase.tools, 'crawl', 'tools');
		}
		if (this.langbase.tool) {
			this.interceptMethod(this.langbase.tool, 'webSearch', 'tool');
			this.interceptMethod(this.langbase.tool, 'crawl', 'tool');
		}

		// Top-level methods
		this.interceptMethod(this.langbase, 'embed');
		this.interceptMethod(this.langbase, 'chunk');
		this.interceptMethod(this.langbase, 'parse');
	}

	private async _step<T = any>(config: StepConfig<T>): Promise<T> {
		const stepStartTime = Date.now();
		// Initialize an array to collect trace IDs
		const stepTraces: string[] = [];

		// Function to collect trace IDs
		const collectTrace = (traceId: string) => {
			if (this.debug) {
				console.log(`📋 Collected trace ID: ${traceId}`);
			}
			stepTraces.push(traceId);
		};

		if (this.debug) {
			console.log(`\n🔄 Starting step: ${config.id}`);
			console.time(`⏱️ Step ${config.id}`);
			if (config.timeout) console.log(`⏳ Timeout: ${config.timeout}ms`);
			if (config.retries)
				console.log(`🔄 Retries: ${JSON.stringify(config.retries)}`);
		}

		let lastError: Error | null = null;
		let attempt = 1;
		const maxAttempts = config.retries?.limit
			? config.retries.limit + 1
			: 1;

		// Set up method interceptors before running the step
		this.setupMethodInterceptors();

		// Set the global active trace collector
		const previousTraceCollector = global._activeTraceCollector;
		global._activeTraceCollector = collectTrace;

		try {
			// Execute the step function directly
			let stepPromise: Promise<T> = config.run();

			// Apply timeout if configured
			if (config.timeout) {
				stepPromise = this.withTimeout({
					promise: stepPromise,
					timeout: config.timeout,
					stepId: config.id,
				});
			}

			// Wait for the step to complete
			const result = await stepPromise;

			// Store step result in context
			this.context.outputs[config.id] = result;

			if (this.debug) {
				console.timeEnd(`⏱️ Step ${config.id}`);
				console.log(`📤 Output:`, result);

				if (stepTraces.length > 0) {
					console.log(
						`📋 Trace IDs (${stepTraces.length}):`,
						stepTraces,
					);
				} else {
					console.log(`🔍 No trace IDs captured for this step`);
				}
			}

			// Create step trace
			const stepEndTime = Date.now();
			const stepTrace: StepTrace = {
				name: config.id,
				output: result,
				traces: stepTraces.length > 0 ? stepTraces : null,
				duration: stepEndTime - stepStartTime,
				startTime: stepStartTime,
				endTime: stepEndTime,
			};

			// Add step to trace manager
			this.traceManager.addStep(this.traceId, stepTrace);

			// Restore original methods and trace collector
			this.restoreOriginalMethods();
			global._activeTraceCollector = previousTraceCollector;

			return result;
		} catch (error) {
			// Restore original methods and trace collector on error
			this.restoreOriginalMethods();
			global._activeTraceCollector = previousTraceCollector;

			// Store error for potential retry or final throw
			lastError = error as Error;

			// If retries are configured, try again
			if (attempt < maxAttempts) {
				const delay = config.retries
					? this.calculateDelay(
							config.retries.delay,
							attempt,
							config.retries.backoff,
						)
					: 0;

				if (this.debug) {
					console.log(
						`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`,
					);
					console.error(error);
				}

				await this.sleep(delay);
				attempt++;

				// Try again with the next attempt
				return this._step(config);
			} else {
				if (this.debug) {
					console.timeEnd(`⏱️ Step ${config.id}`);
					console.error(`❌ Failed step: ${config.id}`, error);
				}
				throw lastError;
			}
		}
	}

	private async withTimeout<T>({
		promise,
		timeout,
		stepId,
	}: {
		promise: Promise<T>;
		timeout: number;
		stepId: string;
	}): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(
				() => reject(new TimeoutError(stepId, timeout)),
				timeout,
			);
		});
		return Promise.race([promise, timeoutPromise]);
	}

	private calculateDelay(
		baseDelay: number,
		attempt: number,
		backoff: RetryConfig['backoff'],
	): number {
		switch (backoff) {
			case 'exponential':
				return baseDelay * Math.pow(2, attempt - 1);
			case 'linear':
				return baseDelay * attempt;
			case 'fixed':
			default:
				return baseDelay;
		}
	}

	private async sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	public async end(): Promise<void> {
		// Finalise and grab the trace
		this.traceManager.endTrace(this.traceId);
		this.traceManager.printTrace(this.traceId);
		const traceData = this.traceManager.getTrace(this.traceId);

		// --- send to LB API v1/traces/create using SDK method ---
		try {
			const res = await this.langbase.traces.create(traceData);

			if (!res || res.error) {
				console.error(
					`❌ Trace upload failed: ${res?.status || ''} ${res?.statusText || ''}`,
				);
			} else if (this.debug) {
				console.log(`✅ Trace ${this.traceId} sent to collector`);
			}
		} catch (err) {
			console.error('❌ Error while sending trace', err);
		}
		// -------------------------------------------------------------------------

		if (this.debug) {
			console.log('\n🔍 DEBUG: Final trace data:');
			console.log(JSON.stringify(traceData, null, 2));
		}
	}
}
