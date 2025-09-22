/**
 * Validation utilities for better developer experience
 */

import type { 
	RunOptions, 
	RunOptionsStream, 
	Message, 
	LangbaseOptions 
} from '@/langbase/langbase';

export interface ValidationError {
	field: string;
	message: string;
	received?: any;
	expected?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

/**
 * Validates API key format and provides helpful suggestions
 */
export function validateApiKey(apiKey: string | undefined): ValidationResult {
	const errors: ValidationError[] = [];

	if (!apiKey) {
		errors.push({
			field: 'apiKey',
			message: 'API key is required',
			expected: 'A valid Langbase API key',
			received: undefined,
		});
	} else if (typeof apiKey !== 'string') {
		errors.push({
			field: 'apiKey',
			message: 'API key must be a string',
			expected: 'string',
			received: typeof apiKey,
		});
	} else if (apiKey.trim().length === 0) {
		errors.push({
			field: 'apiKey',
			message: 'API key cannot be empty',
			expected: 'A non-empty string',
			received: 'empty string',
		});
	} else if (!apiKey.startsWith('lb_')) {
		errors.push({
			field: 'apiKey',
			message: 'API key format appears invalid. Langbase API keys start with "lb_"',
			expected: 'lb_xxxxxxxxxxxxxxxx',
			received: apiKey.substring(0, 10) + '...',
		});
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validates pipe name and provides suggestions
 */
export function validatePipeName(name: string | undefined): ValidationResult {
	const errors: ValidationError[] = [];

	if (!name) {
		errors.push({
			field: 'name',
			message: 'Pipe name is required when not using a pipe-specific API key',
			expected: 'A valid pipe name',
			received: undefined,
		});
	} else if (typeof name !== 'string') {
		errors.push({
			field: 'name',
			message: 'Pipe name must be a string',
			expected: 'string',
			received: typeof name,
		});
	} else if (name.trim().length === 0) {
		errors.push({
			field: 'name',
			message: 'Pipe name cannot be empty',
			expected: 'A non-empty string',
			received: 'empty string',
		});
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validates messages array
 */
export function validateMessages(messages: Message[] | undefined): ValidationResult {
	const errors: ValidationError[] = [];

	if (!messages) {
		return { valid: true, errors }; // Messages are optional
	}

	if (!Array.isArray(messages)) {
		errors.push({
			field: 'messages',
			message: 'Messages must be an array',
			expected: 'Message[]',
			received: typeof messages,
		});
		return { valid: false, errors };
	}

	if (messages.length === 0) {
		errors.push({
			field: 'messages',
			message: 'Messages array cannot be empty when provided',
			expected: 'At least one message',
			received: 'empty array',
		});
	}

	messages.forEach((message, index) => {
		if (!message.role) {
			errors.push({
				field: `messages[${index}].role`,
				message: 'Message role is required',
				expected: 'user | assistant | system | tool',
				received: undefined,
			});
		}

		if (!['user', 'assistant', 'system', 'tool'].includes(message.role)) {
			errors.push({
				field: `messages[${index}].role`,
				message: 'Invalid message role',
				expected: 'user | assistant | system | tool',
				received: message.role,
			});
		}

		if (message.content === undefined || message.content === null) {
			errors.push({
				field: `messages[${index}].content`,
				message: 'Message content is required',
				expected: 'string or MessageContentType[]',
				received: message.content,
			});
		}
	});

	return { valid: errors.length === 0, errors };
}

/**
 * Validates run options and provides comprehensive feedback
 */
export function validateRunOptions(options: RunOptions | RunOptionsStream): ValidationResult {
	const errors: ValidationError[] = [];

	// Validate that either name or apiKey is provided
	if (!options.name && !options.apiKey) {
		errors.push({
			field: 'name|apiKey',
			message: 'Either pipe name or pipe API key must be provided',
			expected: 'name: string OR apiKey: string',
			received: 'neither provided',
		});
	}

	// Validate pipe name if provided
	if (options.name) {
		const nameValidation = validatePipeName(options.name);
		errors.push(...nameValidation.errors);
	}

	// Validate messages if provided
	if (options.messages) {
		const messageValidation = validateMessages(options.messages);
		errors.push(...messageValidation.errors);
	}

	// Validate threadId if provided
	if (options.threadId !== undefined && typeof options.threadId !== 'string') {
		errors.push({
			field: 'threadId',
			message: 'Thread ID must be a string',
			expected: 'string',
			received: typeof options.threadId,
		});
	}

	// Validate stream option
	if (options.stream !== undefined && typeof options.stream !== 'boolean') {
		errors.push({
			field: 'stream',
			message: 'Stream option must be a boolean',
			expected: 'boolean',
			received: typeof options.stream,
		});
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validates Langbase constructor options
 */
export function validateLangbaseOptions(options?: LangbaseOptions): ValidationResult {
	const errors: ValidationError[] = [];

	if (!options) {
		errors.push({
			field: 'options',
			message: 'Langbase options are required',
			expected: '{ apiKey: string }',
			received: undefined,
		});
		return { valid: false, errors };
	}

	if (options.apiKey) {
		const apiKeyValidation = validateApiKey(options.apiKey);
		errors.push(...apiKeyValidation.errors);
	}

	if (options.baseUrl && typeof options.baseUrl !== 'string') {
		errors.push({
			field: 'baseUrl',
			message: 'Base URL must be a string',
			expected: 'string',
			received: typeof options.baseUrl,
		});
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Creates a formatted error message from validation errors
 */
export function formatValidationErrors(errors: ValidationError[]): string {
	if (errors.length === 0) return '';

	const lines = ['Validation failed:'];
	
	errors.forEach((error, index) => {
		lines.push(`${index + 1}. ${error.field}: ${error.message}`);
		if (error.expected) {
			lines.push(`   Expected: ${error.expected}`);
		}
		if (error.received !== undefined) {
			lines.push(`   Received: ${error.received}`);
		}
	});

	return lines.join('\n');
}