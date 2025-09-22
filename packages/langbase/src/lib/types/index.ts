/**
 * Developer Experience utilities and types for the Langbase SDK
 */

import type { 
	RunOptions, 
	RunOptionsStream, 
	RunResponse, 
	RunResponseStream, 
	Message,
	PromptMessage,
	Role 
} from '@/langbase/langbase';

// Utility types for better DX
export type InferResponseType<T> = T extends { stream: true } 
	? RunResponseStream 
	: RunResponse;

// Helper type for messages that accepts both string and Message objects
export type MessageInput = string | Message | PromptMessage;

// Utility type for role-based message creation
export type UserMessage = string | { content: string; name?: string };
export type AssistantMessage = string | { content: string; name?: string };
export type SystemMessage = string | { content: string; name?: string };

// Better pipe configuration types
export interface PipeRunConfig {
	/** The pipe name to run */
	name: string;
	/** Optional pipe-specific API key */
	apiKey?: string;
	/** Optional LLM API key for models */
	llmKey?: string;
	/** Enable streaming response */
	stream?: boolean;
	/** Include raw response headers */
	rawResponse?: boolean;
	/** Enable tools execution */
	runTools?: boolean;
	/** Force JSON mode */
	json?: boolean;
	/** Thread ID for conversation continuity */
	threadId?: string;
}

// Enhanced message builder types
export interface MessageBuilder {
	user(content: UserMessage): MessageBuilder;
	assistant(content: AssistantMessage): MessageBuilder;
	system(content: SystemMessage): MessageBuilder;
	build(): Message[];
	run(config: Omit<PipeRunConfig, 'name'>): Promise<RunResponse | RunResponseStream>;
}

// Runtime validation helpers
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

// Configuration validation
export interface SDKConfig {
	apiKey?: string;
	baseUrl?: string;
	timeout?: number;
	retries?: number;
	validateInputs?: boolean;
}

// Enhanced error information
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