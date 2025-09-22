/**
 * Message builder utility for fluent message creation
 */

import type { 
	Message, 
	RunResponse,
	RunResponseStream,
	Langbase,
} from '@/langbase/langbase';

// Local types for the builder
export type MessageBuilder = {
	user(content: string | { content: string; name?: string }): MessageBuilder;
	assistant(content: string | { content: string; name?: string }): MessageBuilder;
	system(content: string | { content: string; name?: string }): MessageBuilder;
	build(): Message[];
	run(config: any): Promise<RunResponse | RunResponseStream>;
	clear(): MessageBuilder;
	count(): number;
	lastMessage(): Message | undefined;
	pop(): MessageBuilder;
};

export type UserMessage = string | { content: string; name?: string };
export type AssistantMessage = string | { content: string; name?: string };
export type SystemMessage = string | { content: string; name?: string };

/**
 * Fluent message builder for better developer experience
 * 
 * @example
 * ```typescript
 * const messages = createMessageBuilder()
 *   .system("You are a helpful assistant")
 *   .user("Hello, how are you?")
 *   .assistant("I'm doing well, thank you!")
 *   .user("What's the weather like?")
 *   .build();
 * ```
 */
export class LangbaseMessageBuilder implements MessageBuilder {
	private messages: Message[] = [];
	private langbaseInstance?: Langbase;
	private pipeName?: string;

	constructor(langbase?: Langbase, pipeName?: string) {
		this.langbaseInstance = langbase;
		this.pipeName = pipeName;
	}

	/**
	 * Add a user message
	 */
	user(content: UserMessage): MessageBuilder {
		const message: Message = {
			role: 'user',
			content: typeof content === 'string' ? content : content.content,
			...(typeof content === 'object' && content.name && { name: content.name }),
		};
		this.messages.push(message);
		return this;
	}

	/**
	 * Add an assistant message
	 */
	assistant(content: AssistantMessage): MessageBuilder {
		const message: Message = {
			role: 'assistant',
			content: typeof content === 'string' ? content : content.content,
			...(typeof content === 'object' && content.name && { name: content.name }),
		};
		this.messages.push(message);
		return this;
	}

	/**
	 * Add a system message
	 */
	system(content: SystemMessage): MessageBuilder {
		const message: Message = {
			role: 'system',
			content: typeof content === 'string' ? content : content.content,
			...(typeof content === 'object' && content.name && { name: content.name }),
		};
		this.messages.push(message);
		return this;
	}

	/**
	 * Build and return the messages array
	 */
	build(): Message[] {
		return [...this.messages];
	}

	/**
	 * Build messages and run the pipe directly (requires Langbase instance and pipe name)
	 */
	async run(config: any): Promise<RunResponse | RunResponseStream> {
		if (!this.langbaseInstance) {
			throw new Error('Cannot run without Langbase instance. Use build() to get messages instead.');
		}

		if (!this.pipeName && !config.apiKey) {
			throw new Error('Cannot run without pipe name or API key. Use build() to get messages instead.');
		}

		const runConfig = {
			...config,
			messages: this.messages,
			...(this.pipeName && { name: this.pipeName }),
		};

		if (config.stream) {
			return this.langbaseInstance.pipes.run(runConfig as any);
		} else {
			return this.langbaseInstance.pipes.run(runConfig as any);
		}
	}

	/**
	 * Clear all messages
	 */
	clear(): MessageBuilder {
		this.messages = [];
		return this;
	}

	/**
	 * Get the current message count
	 */
	count(): number {
		return this.messages.length;
	}

	/**
	 * Get the last message
	 */
	lastMessage(): Message | undefined {
		return this.messages[this.messages.length - 1];
	}

	/**
	 * Remove the last message
	 */
	pop(): MessageBuilder {
		this.messages.pop();
		return this;
	}
}

/**
 * Create a new message builder
 */
export function createMessageBuilder(langbase?: Langbase, pipeName?: string): MessageBuilder {
	return new LangbaseMessageBuilder(langbase, pipeName);
}

/**
 * Convenience function to create a single user message
 */
export function userMessage(content: string, name?: string): Message {
	return {
		role: 'user',
		content,
		...(name && { name }),
	};
}

/**
 * Convenience function to create a single assistant message
 */
export function assistantMessage(content: string, name?: string): Message {
	return {
		role: 'assistant', 
		content,
		...(name && { name }),
	};
}

/**
 * Convenience function to create a single system message
 */
export function systemMessage(content: string, name?: string): Message {
	return {
		role: 'system',
		content,
		...(name && { name }),
	};
}

/**
 * Create a conversation from alternating user/assistant messages
 */
export function createConversation(exchanges: Array<{user: string; assistant: string}>): Message[] {
	const messages: Message[] = [];
	
	exchanges.forEach(exchange => {
		messages.push(userMessage(exchange.user));
		messages.push(assistantMessage(exchange.assistant));
	});
	
	return messages;
}

/**
 * Add a system message to the beginning of existing messages
 */
export function withSystemMessage(system: string, messages: Message[]): Message[] {
	return [systemMessage(system), ...messages];
}