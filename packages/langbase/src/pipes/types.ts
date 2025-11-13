/**
 * Type definitions for Langbase Pipes
 *
 * This file contains all type definitions and interfaces related to Pipes,
 * including dependencies like Role, Message, Variable, Tools, etc.
 */

/**
 * Role types for messages in the conversation
 */
export type Role = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Variable definition for pipe configuration
 */
export interface Variable {
	name: string;
	value: string;
}

/**
 * Function definition for tool calls
 */
export interface Function {
	name: string;
	arguments: string;
}

/**
 * Tool call definition
 */
export interface ToolCall {
	id: string;
	type: 'function';
	function: Function;
}

/**
 * Message interface for basic message structure
 */
export interface Message {
	role: Role;
	content: string | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

/**
 * Content type for messages with vision support
 */
export interface MessageContentType {
	type: string;
	text?: string;
	image_url?: {
		url: string;
		detail?: string;
	};
	cache_control?: {
		type: 'ephemeral';
	};
}

/**
 * Message with proper content type for Vision support
 */
export interface PromptMessage {
	role: Role;
	content: string | MessageContentType[] | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

/**
 * Thread message with additional metadata
 */
export interface ThreadMessage extends Message {
	attachments?: any[];
	metadata?: Record<string, string>;
}

/**
 * Tool choice definition
 */
export interface ToolChoice {
	type: 'function';
	function: {name: string};
}

/**
 * Tools definition for pipe configuration
 */
export interface Tools {
	type: 'function';
	function: {
		name: string;
		description?: string;
		parameters?: Record<string, any>;
	};
}

/**
 * Runtime memory configuration
 */
export type RuntimeMemory = {
	name: string;
}[];

/**
 * Response format configuration
 */
export type ResponseFormat =
	| {type: 'text'}
	| {type: 'json_object'}
	| {
			type: 'json_schema';
			json_schema: {
				description?: string;
				name: string;
				schema?: Record<string, unknown>;
				strict?: boolean | null;
			};
	  };

/**
 * Usage statistics for API calls
 */
export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

/**
 * Choice in generation response
 */
interface ChoiceGenerate {
	index: number;
	message: Message;
	logprobs: boolean | null;
	finish_reason: string;
}

/**
 * Base options for running a pipe
 */
export interface RunOptionsBase {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string;
	rawResponse?: boolean;
	runTools?: boolean;
	tools?: Tools[];
	name?: string; // Pipe name for SDK,
	apiKey?: string; // pipe level key for SDK
	llmKey?: string; // LLM API key
	json?: boolean;
	memory?: RuntimeMemory;
}

/**
 * Run options for non-streaming pipe execution
 */
export interface RunOptionsT extends RunOptionsBase {
	stream?: false;
}

/**
 * Run options for streaming pipe execution
 */
export interface RunOptionsStreamT extends RunOptionsBase {
	stream: true;
}

/**
 * Union type for RunOptions
 */
export type RunOptions =
	| (RunOptionsT & {name: string; apiKey?: never})
	| (RunOptionsT & {name?: never; apiKey: string});

/**
 * Union type for streaming RunOptions
 */
export type RunOptionsStream =
	| (RunOptionsStreamT & {name: string; apiKey?: never})
	| (RunOptionsStreamT & {name?: never; apiKey: string});

/**
 * Response from pipe execution
 */
export interface RunResponse {
	completion: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

/**
 * Response from streaming pipe execution
 */
export interface RunResponseStream {
	stream: ReadableStream<any>;
	threadId: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}

/**
 * Base options for pipe configuration
 */
interface PipeBaseOptions {
	name: string;
	description?: string;
	status?: 'public' | 'private';
	upsert?: boolean;
	model?: string;
	stream?: boolean;
	json?: boolean;
	store?: boolean;
	moderate?: boolean;
	top_p?: number;
	max_tokens?: number;
	temperature?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	stop?: string[];
	tools?: Tools[];
	tool_choice?: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls?: boolean;
	messages?: Message[];
	variables?: Variable[] | Record<string, string>;
	memory?: {
		name: string;
	}[];
	response_format?: ResponseFormat;
}

/**
 * Options for creating a pipe
 */
export interface PipeCreateOptions extends PipeBaseOptions {}

/**
 * Options for updating a pipe
 */
export interface PipeUpdateOptions extends PipeBaseOptions {}

/**
 * Base response for pipe operations
 */
interface PipeBaseResponse {
	name: string;
	description: string;
	status: 'public' | 'private';
	owner_login: string;
	url: string;
	type: 'chat' | 'generate' | 'run';
	api_key: string;
}

/**
 * Response from pipe creation
 */
export interface PipeCreateResponse extends PipeBaseResponse {}

/**
 * Response from pipe update
 */
export interface PipeUpdateResponse extends PipeBaseResponse {}

/**
 * Response from pipe list operation
 */
export interface PipeListResponse {
	name: string;
	description: string;
	status: 'public' | 'private';
	owner_login: string;
	url: string;
	model: string;
	stream: boolean;
	json: boolean;
	store: boolean;
	moderate: boolean;
	top_p: number;
	max_tokens: number;
	temperature: number;
	presence_penalty: number;
	frequency_penalty: number;
	stop: string[];
	tool_choice: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls: boolean;
	messages: Message[];
	variables: Variable[] | [];
	tools: Tools[] | [];
	memory:
		| {
				name: string;
		  }[]
		| [];
}

/**
 * MCP Server Schema configuration
 */
export interface McpServerSchema {
	name: string;
	type: 'url';
	url: string;
	authorization_token?: string;
	tool_configuration?: {
		allowed_tools?: string[];
		enabled?: boolean;
	};
	custom_headers?: Record<string, string>;
}

/**
 * Base options for agent run
 */
export interface AgentRunOptionsBase {
	input: string | PromptMessage[];
	instructions?: string | null;
	model: string;
	apiKey: string;
	top_p?: number;
	max_tokens?: number;
	temperature?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	stop?: string[];
	tools?: Tools[];
	tool_choice?: 'auto' | 'required' | ToolChoice;
	parallel_tool_calls?: boolean;
	mcp_servers?: McpServerSchema[];
	reasoning_effort?: string | null;
	max_completion_tokens?: number;
	response_format?: ResponseFormat;
	customModelParams?: Record<string, any>;
}

/**
 * Agent run options without MCP servers
 */
export type AgentRunOptionsWithoutMcp = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream?: false;
};

/**
 * Agent run options with MCP servers
 */
export type AgentRunOptionsWithMcp = AgentRunOptionsBase & {
	mcp_servers: McpServerSchema[];
	stream: false;
};

/**
 * Agent run options for streaming
 */
export type AgentRunOptionsStreamT = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream: true;
};

/**
 * Union type for agent run options
 */
export type AgentRunOptions =
	| AgentRunOptionsWithoutMcp
	| AgentRunOptionsWithMcp;

/**
 * Agent run options for streaming
 */
export type AgentRunOptionsStream = AgentRunOptionsStreamT;

/**
 * Response from agent run
 */
export interface AgentRunResponse {
	output: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
	rawResponse?: {
		headers: Record<string, string>;
	};
}
