import {Role, ToolCall} from '@/langbase';

export interface Message {
	role: Role;
	content: string | null;
	name?: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
}

export interface ThreadMessage extends Message {
	attachments?: any[];
	metadata?: Record<string, string>;
}

export interface ThreadsCreate {
	threadId?: string;
	metadata?: Record<string, string>;
	messages?: ThreadMessage[];
}

export interface ThreadsUpdate {
	threadId: string;
	metadata: Record<string, string>;
}

export interface ThreadsGet {
	threadId: string;
}

export interface DeleteThreadOptions {
	threadId: string;
}

export interface ThreadsBaseResponse {
	id: string;
	object: 'thread';
	created_at: number;
	metadata: Record<string, string>;
}

export interface ThreadMessagesCreate {
	threadId: string;
	messages: ThreadMessage[];
}

export interface ThreadMessagesList {
	threadId: string;
}

export interface ThreadMessagesBaseResponse {
	id: string;
	created_at: number;
	thread_id: string;
	content: string;
	role: Role;
	tool_call_id: string | null;
	tool_calls: ToolCall[] | [];
	name: string | null;
	attachments: any[] | [];
	metadata: Record<string, string> | {};
}
