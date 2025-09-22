/**
 * Debugging and development utilities for better developer experience
 */

import type { RunOptions, RunOptionsStream, RunResponse, RunResponseStream } from '@/langbase/langbase';

export interface DebugInfo {
	timestamp: string;
	operation: string;
	input?: any;
	output?: any;
	duration?: number;
	error?: string;
}

export interface DebugConfig {
	enabled: boolean;
	verbose: boolean;
	logRequests: boolean;
	logResponses: boolean;
	logErrors: boolean;
	logTiming: boolean;
}

/**
 * Debug utility class for development
 */
export class LangbaseDebugger {
	public config: DebugConfig;
	private logs: DebugInfo[] = [];

	constructor(config: Partial<DebugConfig> = {}) {
		this.config = {
			enabled: process.env.NODE_ENV === 'development' || !!process.env.LANGBASE_DEBUG,
			verbose: false,
			logRequests: true,
			logResponses: true,
			logErrors: true,
			logTiming: true,
			...config,
		};
	}

	/**
	 * Enable debugging
	 */
	enable(): void {
		this.config.enabled = true;
	}

	/**
	 * Disable debugging
	 */
	disable(): void {
		this.config.enabled = false;
	}

	/**
	 * Log a debug message
	 */
	log(operation: string, data?: any): void {
		if (!this.config.enabled) return;

		const info: DebugInfo = {
			timestamp: new Date().toISOString(),
			operation,
			...(data && { input: data }),
		};

		this.logs.push(info);

		if (this.config.verbose) {
			console.log(`[Langbase Debug] ${operation}`, data || '');
		}
	}

	/**
	 * Log request information
	 */
	logRequest(operation: string, options: RunOptions | RunOptionsStream): void {
		if (!this.config.enabled || !this.config.logRequests) return;

		this.log(`${operation} Request`, {
			name: options.name,
			stream: options.stream,
			messageCount: options.messages?.length,
			hasThreadId: !!options.threadId,
			hasVariables: !!options.variables?.length,
			hasApiKey: !!options.apiKey,
		});
	}

	/**
	 * Log response information
	 */
	logResponse(operation: string, response: RunResponse | RunResponseStream, startTime?: number): void {
		if (!this.config.enabled || !this.config.logResponses) return;

		const isStream = 'stream' in response;
		const duration = startTime ? Date.now() - startTime : undefined;

		this.log(`${operation} Response`, {
			type: isStream ? 'stream' : 'non-stream',
			threadId: response.threadId,
			hasRawResponse: !!response.rawResponse,
			...(duration && { duration: `${duration}ms` }),
			...(!isStream && {
				model: (response as RunResponse).model,
				usage: (response as RunResponse).usage,
			}),
		});
	}

	/**
	 * Log error information
	 */
	logError(operation: string, error: Error): void {
		if (!this.config.enabled || !this.config.logErrors) return;

		this.log(`${operation} Error`, {
			name: error.name,
			message: error.message,
			stack: this.config.verbose ? error.stack : undefined,
		});

		if (this.config.verbose) {
			console.error(`[Langbase Error] ${operation}:`, error);
		}
	}

	/**
	 * Start timing an operation
	 */
	startTimer(operation: string): () => void {
		if (!this.config.enabled || !this.config.logTiming) {
			return () => {};
		}

		const startTime = Date.now();
		
		return () => {
			const duration = Date.now() - startTime;
			this.log(`${operation} Timing`, { duration: `${duration}ms` });
		};
	}

	/**
	 * Get all debug logs
	 */
	getLogs(): DebugInfo[] {
		return [...this.logs];
	}

	/**
	 * Clear debug logs
	 */
	clearLogs(): void {
		this.logs = [];
	}

	/**
	 * Export logs as JSON
	 */
	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}

	/**
	 * Get summary statistics
	 */
	getSummary(): {
		totalOperations: number;
		errors: number;
		requests: number;
		responses: number;
		averageResponseTime?: number;
	} {
		const requests = this.logs.filter(log => log.operation.includes('Request'));
		const responses = this.logs.filter(log => log.operation.includes('Response'));
		const errors = this.logs.filter(log => log.operation.includes('Error'));
		
		const timingLogs = this.logs.filter(log => log.operation.includes('Timing'));
		let averageResponseTime: number | undefined;
		
		if (timingLogs.length > 0) {
			const totalTime = timingLogs.reduce((sum, log) => {
				const duration = log.duration || 0;
				return sum + (typeof duration === 'string' ? parseInt(duration) : duration);
			}, 0);
			averageResponseTime = totalTime / timingLogs.length;
		}

		return {
			totalOperations: this.logs.length,
			errors: errors.length,
			requests: requests.length,
			responses: responses.length,
			...(averageResponseTime && { averageResponseTime }),
		};
	}
}

/**
 * Global debugger instance
 */
export const langbaseDebugger = new LangbaseDebugger();

/**
 * Wrapper function to add debugging to async operations
 */
export async function withDebug<T>(
	operation: string,
	fn: () => Promise<T>,
	input?: any
): Promise<T> {
	langbaseDebugger.log(`${operation} Start`, input);
	const stopTimer = langbaseDebugger.startTimer(operation);
	
	try {
		const result = await fn();
		stopTimer();
		langbaseDebugger.log(`${operation} Success`);
		return result;
	} catch (error) {
		stopTimer();
		langbaseDebugger.logError(operation, error as Error);
		throw error;
	}
}

/**
 * Helper to inspect objects in a readable format
 */
export function inspect(obj: any, label?: string): void {
	if (!langbaseDebugger.config?.enabled) return;
	
	console.log(label ? `[Langbase Debug] ${label}:` : '[Langbase Debug]:');
	console.dir(obj, { depth: 3, colors: true });
}

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
	private marks: Map<string, number> = new Map();

	/**
	 * Start measuring performance for an operation
	 */
	start(label: string): void {
		this.marks.set(label, Date.now());
	}

	/**
	 * End performance measurement and return duration
	 */
	end(label: string): number {
		const startTime = this.marks.get(label);
		if (!startTime) {
			console.warn(`Performance measurement '${label}' was not started`);
			return 0;
		}

		const duration = Date.now() - startTime;
		this.marks.delete(label);
		return duration;
	}

	/**
	 * Measure and log performance
	 */
	measure(label: string): number {
		const duration = this.end(label);
		langbaseDebugger.log(`Performance: ${label}`, { duration: `${duration}ms` });
		return duration;
	}
}

/**
 * Global performance monitor
 */
export const perf = new PerformanceMonitor();