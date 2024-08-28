import {Request} from '../common/request';
import {Stream} from '../common/stream';

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface Function {
	name: string;
	arguments: string;
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: Function;
}

export interface Message {
	role: Role;
	content: string | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface Variable {
	name: string;
	value: string;
}

export interface GenerateOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string;
	chat?: boolean;
	pipe: Pipe;
}

export interface StreamOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string | null;
	chat?: boolean;
	onStart?: () => void;
	onChunk?: (options: {chunk: Chunk}) => void;
	onFinish?: () => void;
	pipe: Pipe;
}

interface ChoiceGenerate {
	index: number;
	message: Message;
	logprobs: boolean | null;
	finish_reason: string;
}

interface ChoiceStream {
	index: number;
	delta: Delta;
	logprobs: boolean | null;
	finish_reason: string;
}

interface Delta {
	role?: Role;
	content?: string;
	tool_calls?: ToolCall[];
}

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface GenerateResponse {
	completion: string;
	threadId?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceGenerate[];
	usage: Usage;
	system_fingerprint: string | null;
}

export type StreamText = Stream<StreamChunk>;

export interface StreamResponse {
	threadId: string | null;
	completion: string;
}

interface StreamCallResponse {
	stream: StreamText;
	threadId: string | null;
}

export interface StreamChunk {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChoiceStream[];
}

export interface PipeOptions {
	apiKey: string;
	baseUrl?: string;
}

export interface ContentChunk {
	type: 'content';
	content: string;
}

export interface ToolCallChunk {
	type: 'toolCall';
	toolCall: ToolCall;
}

export interface UnknownChunk {
	type: 'unknown';
	rawChunk: StreamChunk;
}

export interface Chunk {
	type: 'content' | 'toolCall' | 'unknown';
	content?: string;
	toolCall?: ToolCall;
	rawChunk?: StreamChunk;
}

export const isContent = (chunk: Chunk): chunk is ContentChunk => chunk.type === 'content';
export const isToolCall = (chunk: Chunk): chunk is ToolCallChunk => chunk.type === 'toolCall';
export const isUnknown = (chunk: Chunk): chunk is UnknownChunk => chunk.type === 'unknown';

export class Pipe {
	private request: Request;

	constructor(options: PipeOptions) {
		const baseUrl = options.baseUrl || 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	public async makeRequest<T>(options: {endpoint: string; body: any}): Promise<T> {
		return this.request.post<T>(options);
	}
}

export const generateText = async (options: GenerateOptions): Promise<GenerateResponse> => {
	return options.pipe.makeRequest<GenerateResponse>({
		endpoint: options.chat ? '/beta/chat' : '/beta/generate',
		body: {...options, stream: false},
	});
};

export const streamText = async (options: StreamOptions): Promise<StreamResponse> => {
	const {stream, threadId} = await options.pipe.makeRequest<StreamCallResponse>({
		endpoint: options.chat ? '/beta/chat' : '/beta/generate',
		body: {...options, stream: true},
	});

	if (options.onStart) options.onStart();

	let fullCompletion = ''; // Variable to accumulate the full completion text

	for await (const rawChunk of stream) {
		const chunk = processChunk({rawChunk});
		if (options.onChunk) options.onChunk({chunk});

		// Accumulate the completion text
		if (isContent(chunk)) {
			fullCompletion += chunk.content;
		}
	}

	if (options.onFinish) options.onFinish();

	return {threadId, completion: fullCompletion};
};

export const processChunk = ({rawChunk}: {rawChunk: StreamChunk}): Chunk => {
	if (rawChunk.choices[0]?.delta?.content) {
		return {type: 'content', content: rawChunk.choices[0].delta.content};
	}
	if (rawChunk.choices[0]?.delta?.tool_calls && rawChunk.choices[0].delta.tool_calls.length > 0) {
		const toolCall = rawChunk.choices[0].delta.tool_calls[0];
		return {type: 'toolCall', toolCall};
	}
	// Default case
	return {type: 'unknown', rawChunk};
};

export const getTextContent = (chunk: StreamChunk): string => {
	return chunk.choices[0]?.delta?.content || '';
};

export const getTextDelta = (chunk: StreamChunk): string => {
	return chunk.choices[0]?.delta?.content || '';
};

export const printStreamToStdout = async (stream: StreamText): Promise<void> => {
	for await (const chunk of stream) {
		const textPart = chunk.choices[0]?.delta?.content || '';
		process.stdout.write(textPart);
	}
};
