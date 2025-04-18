import {Message, Role, RunResponse} from '@/langbase/langbase';
import {getRunner, Runner} from '@/lib/helpers';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {z} from 'zod';

interface PipeRequestOptions {
	headers?: Record<string, string> | Headers;
	body?: any;
	data?: any;
	allowEmptySubmit?: boolean;
}

interface UsePipeOptions {
	apiRoute?: string;
	onResponse?: (message: Message) => void;
	onFinish?: (messages: Message[], threadId: string) => void;
	onConnect?: () => void;
	onError?: (error: Error) => void;
	onCancel?: (messages: Message[]) => void;
	threadId?: string;
	initialMessages?: Message[];
	stream?: boolean;
}

const uuidSchema = z.string().uuid();
const externalThreadIdSchema = uuidSchema.optional();

export function usePipe({
	apiRoute = '/langbase/pipes/run-stream',
	onResponse,
	onFinish,
	onConnect,
	onError,
	threadId: initialThreadId,
	initialMessages = [],
	stream = true,
	onCancel,
}: UsePipeOptions = {}) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);
	const threadIdRef = useRef<string | undefined>(
		initialThreadId || undefined,
	);
	const messagesRef = useRef<Message[]>(initialMessages);
	const isFirstRequestRef = useRef<boolean>(true);

	const updateMessages = useCallback((newMessages: Message[]) => {
		messagesRef.current = newMessages;
		setMessages(newMessages);
	}, []);

	const processStreamResponse = useCallback(
		async (runner: Runner) => {
			let assistantMessage: Message = {role: 'assistant', content: ''};
			updateMessages([...messagesRef.current, assistantMessage]);

			for await (const chunk of runner) {
				if (abortControllerRef.current?.signal.aborted) break;

				const content = chunk.choices[0]?.delta?.content || '';
				assistantMessage.content += content;

				updateMessages([
					...messagesRef.current.slice(0, -1),
					{...assistantMessage},
				]);
				onResponse?.({...assistantMessage});
			}

			onFinish?.(messagesRef.current, threadIdRef.current || '');
		},
		[updateMessages, onResponse, onFinish],
	);

	const processNonStreamResponse = useCallback(
		(result: RunResponse) => {
			const assistantMessage: Message = {
				role: 'assistant',
				content: result.completion,
			};
			const newMessages = [...messagesRef.current, assistantMessage];
			updateMessages(newMessages);
			onResponse?.(assistantMessage);
			onFinish?.(newMessages, threadIdRef.current || '');
		},
		[updateMessages, onResponse, onFinish],
	);

	const setThreadId = useCallback((newThreadId: string | undefined) => {
		const isValidThreadId =
			externalThreadIdSchema.safeParse(newThreadId).success;

		if (isValidThreadId) {
			threadIdRef.current = newThreadId;
		} else {
			throw new Error('Invalid thread ID');
		}
	}, []);

	const getMessagesToSend = useCallback(
		(updatedMessages: Message[]): [Message[], boolean] => {
			const isInitialRequest = isFirstRequestRef.current;
			isFirstRequestRef.current = false;

			if (isInitialRequest) {
				// In production, for the initial request, send all messages
				return [updatedMessages, false];
			} else {
				// In production, for subsequent requests, send only the last message if there are more than initial messages
				const lastMessageOnly =
					updatedMessages.length > initialMessages.length;
				return [
					lastMessageOnly
						? [updatedMessages[updatedMessages.length - 1]]
						: updatedMessages,
					lastMessageOnly,
				];
			}
		},
		[initialMessages],
	);

	const sendRequest = useCallback(
		async (content: string | null, options: PipeRequestOptions = {}) => {
			abortControllerRef.current = new AbortController();
			const {signal} = abortControllerRef.current;

			try {
				setIsLoading(true);
				setError(null);
				onConnect?.();

				let updatedMessages = messagesRef.current;

				const hasContent = content && content.trim();
				if (hasContent) {
					// Add new user message only if content is not empty
					updatedMessages = [
						...messagesRef.current,
						{role: 'user' as Role, content},
					];
				}

				updateMessages(updatedMessages);

				const [messagesToSend, lastMessageOnly] =
					getMessagesToSend(updatedMessages);

				// Ensure there's at least one message to send if not allowing empty submit
				if (messagesToSend.length === 0 && !options.allowEmptySubmit) {
					throw new Error(
						'At least one message or initial message is required',
					);
				}

				const requestBody: any = {
					messages: messagesToSend,
					stream,
					lastMessageOnly,
					...options.body,
				};

				if (
					threadIdRef.current &&
					uuidSchema.safeParse(threadIdRef.current).success
				) {
					requestBody.threadId = threadIdRef.current;
				}

				const response = await fetch(apiRoute, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(options.headers || {}),
					},
					body: JSON.stringify(requestBody),
					signal,
				});

				if (!response.ok) await processErrorResponse(response);

				const newThreadId = response.headers.get('lb-thread-id');
				if (newThreadId) threadIdRef.current = newThreadId;

				if (stream && response.body) {
					await processStreamResponse(getRunner(response.body));
				} else {
					const result: RunResponse = await response.json();
					processNonStreamResponse(result);
				}
			} catch (err: any) {
				if (err instanceof Error && err.name !== 'AbortError') {
					setError(err);
					onError?.(err);
				} else if (err.name !== 'AbortError') {
					throw new Error('Failed to send message');
				}
			} finally {
				setIsLoading(false);
			}
		},
		[
			apiRoute,
			stream,
			processStreamResponse,
			processNonStreamResponse,
			updateMessages,
			onConnect,
			onError,
			getMessagesToSend,
		],
	);

	const handleSubmit = useCallback(
		(
			event?: {preventDefault?: () => void},
			options: PipeRequestOptions = {},
		) => {
			event?.preventDefault?.();
			const currentInput = input.trim();
			setInput('');
			return sendRequest(currentInput, options);
		},
		[input, sendRequest],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setInput(e.target.value);
		},
		[],
	);

	const sendMessage = useCallback(
		async (
			content: string,
			options: PipeRequestOptions = {},
		): Promise<void> => {
			await sendRequest(content.trim(), options);
		},
		[sendRequest],
	);

	const regenerate = useCallback(
		async (options: PipeRequestOptions = {}): Promise<void> => {
			const lastUserMessage = messagesRef.current.findLast(
				m => m.role === 'user',
			);
			if (!lastUserMessage) return;
			await sendRequest(lastUserMessage.content, options);
		},
		[sendRequest],
	);

	const stop = useCallback(() => {
		abortControllerRef.current?.abort();
		onCancel?.(messagesRef.current);
		setIsLoading(false);
	}, []);

	const processErrorResponse = async (response: Response) => {
		const res = await response.json();
		if (res.error.error) {
			// Throw error object if it exists
			throw new Error(res.error.error.message);
		} else {
			throw new Error('Failed to send message');
		}
	};

	return useMemo(
		() => ({
			messages,
			input,
			handleInputChange,
			handleSubmit,
			isLoading,
			error,
			regenerate,
			stop,
			setMessages: updateMessages,
			threadId: threadIdRef.current,
			sendMessage,
			setInput,
			setThreadId,
		}),
		[
			messages,
			input,
			handleInputChange,
			handleSubmit,
			isLoading,
			error,
			regenerate,
			stop,
			updateMessages,
			sendMessage,
		],
	);
}
