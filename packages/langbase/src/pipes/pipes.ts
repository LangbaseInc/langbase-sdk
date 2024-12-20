import { Message, Role, ToolCall, Variable } from '@/langbase/langbase';
import {Request} from '../common/request';
import {Stream} from '../common/stream';


export interface GenerateOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string;
	chat?: boolean;
}

export interface StreamOptions {
	messages?: Message[];
	variables?: Variable[];
	threadId?: string | null;
	chat?: boolean;
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
	name?: string;
}

export class Pipe {
	private request: Request;

	constructor(options: PipeOptions) {
		const baseUrl = 'https://api.langbase.com';
		this.request = new Request({apiKey: options.apiKey, baseUrl});
	}

	async generateText(options: GenerateOptions): Promise<GenerateResponse> {
		return this.request.post<GenerateResponse>({
			endpoint: options.chat ? '/beta/chat' : '/beta/generate',
			body: {...options, stream: false},
		});
	}

	async streamText(options: StreamOptions): Promise<StreamResponse> {
		return this.request.post<StreamResponse>({
			endpoint: options.chat ? '/beta/chat' : '/beta/generate',
			body: {...options, stream: true},
		});
	}
}

/**
 * Print stream to standard output (console).
 * @param stream The stream to print
 */
export const printStreamToStdout = async (
	stream: StreamText,
): Promise<void> => {
	for await (const chunk of stream) {
		const textPart = chunk.choices[0]?.delta?.content || '';
		process.stdout.write(textPart);
	}
};
