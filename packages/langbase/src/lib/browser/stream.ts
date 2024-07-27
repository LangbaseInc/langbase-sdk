import {ChatCompletionStream} from 'openai/lib/ChatCompletionStream';

export const fromReadableStream = (readableStream: ReadableStream) => {
	return ChatCompletionStream.fromReadableStream(readableStream);
};
