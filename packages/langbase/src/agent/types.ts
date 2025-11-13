import {PromptMessage, Tools, ResponseFormat} from '../langbase';

interface ToolChoice {
	type: 'function';
	function: {name: string};
}

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

export type AgentRunOptionsWithoutMcp = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream?: false;
};

export type AgentRunOptionsWithMcp = AgentRunOptionsBase & {
	mcp_servers: McpServerSchema[];
	stream: false;
};

export type AgentRunOptionsStreamT = Omit<
	AgentRunOptionsBase,
	'mcp_servers'
> & {
	stream: true;
};

export type AgentRunOptions =
	| AgentRunOptionsWithoutMcp
	| AgentRunOptionsWithMcp;

export type AgentRunOptionsStream = AgentRunOptionsStreamT;

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

interface ChoiceGenerate {
	index: number;
	message: {
		role: 'user' | 'assistant' | 'system' | 'tool';
		content: string | null;
		name?: string;
		tool_call_id?: string;
		tool_calls?: Array<{
			id: string;
			type: 'function';
			function: {
				name: string;
				arguments: string;
			};
		}>;
	};
	logprobs: boolean | null;
	finish_reason: string;
}

interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

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
