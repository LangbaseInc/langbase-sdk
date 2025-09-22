/**
 * Enhanced error handling with better developer experience
 */

import { APIError } from '@/common/errors';

// Local types to avoid circular imports
export interface LangbaseErrorInfo {
	code?: string;
	suggestion?: string;
	docs?: string;
	retryable?: boolean;
}

export interface EnhancedError extends Error {
	info?: LangbaseErrorInfo;
	originalError?: Error;
}

/**
 * Enhanced error class with additional developer-friendly information
 */
export class LangbaseError extends Error implements EnhancedError {
	public info?: LangbaseErrorInfo;
	public originalError?: Error;

	constructor(
		message: string,
		info?: LangbaseErrorInfo,
		originalError?: Error
	) {
		super(message);
		this.name = 'LangbaseError';
		this.info = info;
		this.originalError = originalError;

		// Ensure proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, LangbaseError.prototype);
	}

	/**
	 * Get formatted error message with suggestions
	 */
	getDetailedMessage(): string {
		let message = this.message;
		
		if (this.info?.suggestion) {
			message += `\n\nSuggestion: ${this.info.suggestion}`;
		}
		
		if (this.info?.docs) {
			message += `\nDocumentation: ${this.info.docs}`;
		}

		return message;
	}

	/**
	 * Check if the error is retryable
	 */
	isRetryable(): boolean {
		return this.info?.retryable === true;
	}
}

/**
 * Create enhanced errors for common scenarios
 */
export const ErrorFactory = {
	/**
	 * API key validation error
	 */
	invalidApiKey: (received?: string): LangbaseError => {
		return new LangbaseError(
			'Invalid or missing API key',
			{
				code: 'INVALID_API_KEY',
				suggestion: 'Get your API key from https://langbase.com/docs/api-reference/api-keys',
				docs: 'https://langbase.com/docs/sdk/setup',
				retryable: false,
			}
		);
	},

	/**
	 * Pipe not found error
	 */
	pipeNotFound: (pipeName: string): LangbaseError => {
		return new LangbaseError(
			`Pipe "${pipeName}" not found`,
			{
				code: 'PIPE_NOT_FOUND',
				suggestion: 'Check the pipe name spelling or create the pipe on Langbase',
				docs: 'https://langbase.com/docs/sdk/pipe/run',
				retryable: false,
			}
		);
	},

	/**
	 * Validation error
	 */
	validation: (message: string, field?: string): LangbaseError => {
		return new LangbaseError(
			message,
			{
				code: 'VALIDATION_ERROR',
				suggestion: field ? `Check the ${field} parameter` : 'Check your input parameters',
				docs: 'https://langbase.com/docs/sdk',
				retryable: false,
			}
		);
	},

	/**
	 * Rate limit error
	 */
	rateLimit: (): LangbaseError => {
		return new LangbaseError(
			'Rate limit exceeded',
			{
				code: 'RATE_LIMIT',
				suggestion: 'Wait before retrying or upgrade your plan',
				docs: 'https://langbase.com/docs/api-reference/rate-limits',
				retryable: true,
			}
		);
	},

	/**
	 * Network error
	 */
	network: (originalError?: Error): LangbaseError => {
		return new LangbaseError(
			'Network error occurred',
			{
				code: 'NETWORK_ERROR',
				suggestion: 'Check your internet connection and try again',
				docs: 'https://langbase.com/docs/sdk/troubleshooting',
				retryable: true,
			},
			originalError
		);
	},

	/**
	 * Generic API error with enhanced information
	 */
	fromApiError: (apiError: APIError): LangbaseError => {
		let suggestion = 'Check the API documentation for more information';
		let retryable = false;

		// Provide specific suggestions based on status code
		if (apiError.status) {
			switch (apiError.status) {
				case 401:
					suggestion = 'Check your API key and ensure it\'s valid';
					break;
				case 403:
					suggestion = 'You don\'t have permission to access this resource';
					break;
				case 404:
					suggestion = 'The requested resource was not found. Check the pipe name or endpoint';
					break;
				case 429:
					suggestion = 'Rate limit exceeded. Wait before retrying or upgrade your plan';
					retryable = true;
					break;
				case 500:
				case 502:
				case 503:
				case 504:
					suggestion = 'Server error occurred. Try again in a few moments';
					retryable = true;
					break;
			}
		}

		return new LangbaseError(
			apiError.message,
			{
				code: `API_ERROR_${apiError.status || 'UNKNOWN'}`,
				suggestion,
				docs: 'https://langbase.com/docs/api-reference',
				retryable,
			},
			apiError
		);
	},
};

/**
 * Error handler utility for common error patterns
 */
export class ErrorHandler {
	/**
	 * Handle and enhance any error
	 */
	static handle(error: unknown): LangbaseError {
		// If it's already a LangbaseError, return as is
		if (error instanceof LangbaseError) {
			return error;
		}

		// If it's an APIError, enhance it
		if (error instanceof APIError) {
			return ErrorFactory.fromApiError(error);
		}

		// If it's a regular Error, wrap it
		if (error instanceof Error) {
			if (error.message.includes('fetch')) {
				return ErrorFactory.network(error);
			}
			
			return new LangbaseError(
				error.message,
				{
					code: 'UNKNOWN_ERROR',
					suggestion: 'If this error persists, please contact support',
					docs: 'https://langbase.com/docs/sdk/troubleshooting',
					retryable: false,
				},
				error
			);
		}

		// For unknown error types
		return new LangbaseError(
			'An unexpected error occurred',
			{
				code: 'UNEXPECTED_ERROR',
				suggestion: 'Please contact support with error details',
				docs: 'https://langbase.com/docs/sdk/troubleshooting',
				retryable: false,
			}
		);
	}

	/**
	 * Handle async operations with enhanced error handling
	 */
	static async withErrorHandling<T>(
		operation: () => Promise<T>,
		context?: string
	): Promise<T> {
		try {
			return await operation();
		} catch (error) {
			const enhancedError = ErrorHandler.handle(error);
			
			// Add context if provided
			if (context) {
				enhancedError.message = `${context}: ${enhancedError.message}`;
			}
			
			throw enhancedError;
		}
	}
}