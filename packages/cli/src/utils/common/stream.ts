type Bytes = string | ArrayBuffer | Uint8Array | Buffer | null | undefined;

export type ServerSentEvent = {
	event: string | null;
	data: string;
	raw: string[];
};

export class Stream<Item> implements AsyncIterable<Item> {
	controller: AbortController;

	constructor(
		private iterator: () => AsyncIterator<Item>,
		controller: AbortController
	) {
		this.controller = controller;
	}

	/**
	 * Creates a stream of AsyncIterator from a Server-Sent Events (SSE) response.
	 *
	 * @template Item - The type of items in the stream.
	 * @param {Response} response - The SSE response object.
	 * @param {AbortController} controller - The abort controller used to cancel the ongoing request.
	 * @returns {Stream<AsyncIterator<Item, any, undefined>>} - The stream created from the SSE response.
	 * @throws {Error} - If the stream has already been consumed.
	 */
	static fromSSEResponse<Item>(
		response: Response,
		controller: AbortController
	) {
		let consumed = false;

		async function* iterator(): AsyncIterator<Item, any, undefined> {
			if (consumed) {
				throw new Error(
					'Cannot iterate over a consumed stream, use `.tee()` to split the stream.'
				);
			}
			consumed = true;
			let done = false;
			try {
				for await (const sse of _iterSSEMessages(
					response,
					controller
				)) {
					if (done) continue;

					if (sse.data.startsWith('[DONE]')) {
						done = true;
						continue;
					}

					if (sse.event === null) {
						let data;

						try {
							data = JSON.parse(sse.data);
						} catch (e) {
							console.error(
								`Could not parse message into JSON:`,
								sse.data
							);
							console.error(`From chunk:`, sse.raw);
							throw e;
						}

						if (data && data.error) {
							throw new Error(data.error);
						}

						yield data;
					} else {
						let data;
						try {
							data = JSON.parse(sse.data);
						} catch (e) {
							console.error(
								`Could not parse message into JSON:`,
								sse.data
							);
							console.error(`From chunk:`, sse.raw);
							throw e;
						}
						// TODO: Is this where the error should be thrown?
						if (sse.event == 'error') {
							throw new Error(data.message);
						}
						yield { event: sse.event, data: data } as any;
					}
				}
				done = true;
			} catch (e) {
				// If the user calls `stream.controller.abort()`, we should exit without throwing.
				if (e instanceof Error && e.name === 'AbortError') return;
				throw e;
			} finally {
				// If the user `break`s, abort the ongoing request.
				if (!done) controller.abort();
			}
		}

		return new Stream(iterator, controller);
	}

	/**
	 * Generates a Stream from a newline-separated ReadableStream
	 * where each item is a JSON value.
	 *
	 * @template Item - The type of items in the stream.
	 * @param {ReadableStream} readableStream - The readable stream to create the stream from.
	 * @param {AbortController} controller - The abort controller to control the stream.
	 * @returns {Stream<Item>} - The created stream.
	 */
	static fromReadableStream<Item>(
		readableStream: ReadableStream,
		controller: AbortController
	) {
		let consumed = false;

		async function* iterLines(): AsyncGenerator<string, void, unknown> {
			const lineDecoder = new LineDecoder();

			const iter = readableStreamAsyncIterable<Bytes>(readableStream);
			for await (const chunk of iter) {
				for (const line of lineDecoder.decode(chunk)) {
					yield line;
				}
			}

			for (const line of lineDecoder.flush()) {
				yield line;
			}
		}

		async function* iterator(): AsyncIterator<Item, any, undefined> {
			if (consumed) {
				throw new Error(
					'Cannot iterate over a consumed stream, use `.tee()` to split the stream.'
				);
			}
			consumed = true;
			let done = false;
			try {
				for await (const line of iterLines()) {
					if (done) continue;
					if (line) yield JSON.parse(line);
				}
				done = true;
			} catch (e) {
				// If the user calls `stream.controller.abort()`, we should exit without throwing.
				if (e instanceof Error && e.name === 'AbortError') return;
				throw e;
			} finally {
				// If the user `break`s, abort the ongoing request.
				if (!done) controller.abort();
			}
		}

		return new Stream(iterator, controller);
	}

	[Symbol.asyncIterator](): AsyncIterator<Item> {
		return this.iterator();
	}

	/**
	 * Splits the stream into two streams which can be
	 * independently read from at different speeds.
	 */
	tee(): [Stream<Item>, Stream<Item>] {
		const left: Array<Promise<IteratorResult<Item>>> = [];
		const right: Array<Promise<IteratorResult<Item>>> = [];
		const iterator = this.iterator();

		const teeIterator = (
			queue: Array<Promise<IteratorResult<Item>>>
		): AsyncIterator<Item> => {
			return {
				next: () => {
					if (queue.length === 0) {
						const result = iterator.next();
						left.push(result);
						right.push(result);
					}
					return queue.shift()!;
				}
			};
		};

		return [
			new Stream(() => teeIterator(left), this.controller),
			new Stream(() => teeIterator(right), this.controller)
		];
	}

	/**
	 * Converts this stream to a newline-separated ReadableStream of
	 * JSON stringified values in the stream which can be turned back into a Stream with `Stream.fromReadableStream()`.
	 */
	toReadableStream(): ReadableStream {
		const self = this;
		let iter: AsyncIterator<Item>;
		const encoder = new TextEncoder();

		return new ReadableStream({
			async start() {
				iter = self[Symbol.asyncIterator]();
			},
			async pull(ctrl: any) {
				try {
					const { value, done } = await iter.next();
					if (done) return ctrl.close();

					const bytes = encoder.encode(JSON.stringify(value) + '\n');

					ctrl.enqueue(bytes);
				} catch (err) {
					ctrl.error(err);
				}
			},
			async cancel() {
				await iter.return?.();
			}
		});
	}
}

/**
 * Asynchronously iterates over Server-Sent Event (SSE) messages from a response body.
 *
 * @param response - The response object containing the SSE messages.
 * @param controller - The AbortController used to abort the iteration if needed.
 * @returns An async generator that yields ServerSentEvent objects.
 * @throws Error if the response has no body.
 */
export async function* _iterSSEMessages(
	response: Response,
	controller: AbortController
): AsyncGenerator<ServerSentEvent, void, unknown> {
	if (!response.body) {
		controller.abort();
		throw new Error(`Attempted to iterate over a response with no body`);
	}

	const sseDecoder = new SSEDecoder();
	const lineDecoder = new LineDecoder();

	const iter = readableStreamAsyncIterable<Bytes>(response.body);
	for await (const sseChunk of iterSSEChunks(iter)) {
		for (const line of lineDecoder.decode(sseChunk)) {
			const sse = sseDecoder.decode(line);
			if (sse) yield sse;
		}
	}

	for (const line of lineDecoder.flush()) {
		const sse = sseDecoder.decode(line);
		if (sse) yield sse;
	}
}

/**
 * Asynchronously iterates over SSE (Server-Sent Events) chunks and yields the data as Uint8Array.
 *
 * Given an async iterable iterator, iterates over it and yields full
 * SSE chunks, i.e. yields when a double new-line is encountered.
 *
 * @param iterator - The async iterator that provides the SSE chunks.
 * @returns An async generator that yields Uint8Array chunks.
 */
async function* iterSSEChunks(
	iterator: AsyncIterableIterator<Bytes>
): AsyncGenerator<Uint8Array> {
	let data = new Uint8Array();

	for await (const chunk of iterator) {
		if (chunk == null) {
			continue;
		}

		const binaryChunk =
			chunk instanceof ArrayBuffer
				? new Uint8Array(chunk)
				: typeof chunk === 'string'
					? new TextEncoder().encode(chunk)
					: chunk;

		let newData = new Uint8Array(data.length + binaryChunk.length);
		newData.set(data);
		newData.set(binaryChunk, data.length);
		data = newData;

		let patternIndex;
		while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
			yield data.slice(0, patternIndex);
			data = data.slice(patternIndex);
		}
	}

	if (data.length > 0) {
		yield data;
	}
}

/**
 * Finds the index of the first occurrence of a double newline pattern (\r\r, \n\n, \r\n\r\n) in the given buffer.
 *
 * @param buffer - The buffer to search for the double newline pattern.
 * @returns The index right after the first occurrence of the double newline pattern, or -1 if not found.
 */
function findDoubleNewlineIndex(buffer: Uint8Array): number {
	// This function searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
	// and returns the index right after the first occurrence of any pattern,
	// or -1 if none of the patterns are found.
	const newline = 0x0a; // \n
	const carriage = 0x0d; // \r

	for (let i = 0; i < buffer.length - 2; i++) {
		if (buffer[i] === newline && buffer[i + 1] === newline) {
			// \n\n
			return i + 2;
		}
		if (buffer[i] === carriage && buffer[i + 1] === carriage) {
			// \r\r
			return i + 2;
		}
		if (
			buffer[i] === carriage &&
			buffer[i + 1] === newline &&
			i + 3 < buffer.length &&
			buffer[i + 2] === carriage &&
			buffer[i + 3] === newline
		) {
			// \r\n\r\n
			return i + 4;
		}
	}

	return -1;
}

/**
 * Represents a Server-Sent Event (SSE) decoder.
 */
class SSEDecoder {
	private data: string[];
	private event: string | null;
	private chunks: string[];

	constructor() {
		this.event = null;
		this.data = [];
		this.chunks = [];
	}

	/**
	 * Decodes a line of text and returns a ServerSentEvent object if a complete event is found.
	 * @param line - The line of text to decode.
	 * @returns A ServerSentEvent object if a complete event is found, otherwise null.
	 */
	decode(line: string) {
		if (line.endsWith('\r')) {
			line = line.substring(0, line.length - 1);
		}

		if (!line) {
			// empty line and we didn't previously encounter any messages
			if (!this.event && !this.data.length) return null;

			const sse: ServerSentEvent = {
				event: this.event,
				data: this.data.join('\n'),
				raw: this.chunks
			};

			this.event = null;
			this.data = [];
			this.chunks = [];

			return sse;
		}

		this.chunks.push(line);

		if (line.startsWith(':')) {
			return null;
		}

		let [fieldname, _, value] = partition(line, ':');

		if (value.startsWith(' ')) {
			value = value.substring(1);
		}

		if (fieldname === 'event') {
			this.event = value;
		} else if (fieldname === 'data') {
			this.data.push(value);
		}

		return null;
	}
}

/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
class LineDecoder {
	// prettier-ignore
	static NEWLINE_CHARS = new Set(['\n', '\r']);
	static NEWLINE_REGEXP = /\r\n|[\n\r]/g;

	buffer: string[];
	trailingCR: boolean;
	textDecoder: any; // TextDecoder found in browsers; not typed to avoid pulling in either "dom" or "node" types.

	constructor() {
		this.buffer = [];
		this.trailingCR = false;
	}

	decode(chunk: Bytes): string[] {
		let text = this.decodeText(chunk);

		if (this.trailingCR) {
			text = '\r' + text;
			this.trailingCR = false;
		}
		if (text.endsWith('\r')) {
			this.trailingCR = true;
			text = text.slice(0, -1);
		}

		if (!text) {
			return [];
		}

		const trailingNewline = LineDecoder.NEWLINE_CHARS.has(
			text[text.length - 1] || ''
		);
		let lines = text.split(LineDecoder.NEWLINE_REGEXP);

		// if there is a trailing new line then the last entry will be an empty
		// string which we don't care about
		if (trailingNewline) {
			lines.pop();
		}

		if (lines.length === 1 && !trailingNewline) {
			this.buffer.push(lines[0]!);
			return [];
		}

		if (this.buffer.length > 0) {
			lines = [this.buffer.join('') + lines[0], ...lines.slice(1)];
			this.buffer = [];
		}

		if (!trailingNewline) {
			this.buffer = [lines.pop() || ''];
		}

		return lines;
	}

	decodeText(bytes: Bytes): string {
		if (bytes == null) return '';
		if (typeof bytes === 'string') return bytes;

		// Node:
		if (typeof Buffer !== 'undefined') {
			if (bytes instanceof Buffer) {
				return bytes.toString();
			}
			if (bytes instanceof Uint8Array) {
				return Buffer.from(bytes).toString();
			}

			throw new Error(
				`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`
			);
		}

		// Browser
		if (typeof TextDecoder !== 'undefined') {
			if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
				this.textDecoder ??= new TextDecoder('utf8');
				return this.textDecoder.decode(bytes);
			}

			throw new Error(
				`Unexpected: received non-Uint8Array/ArrayBuffer (${
					(bytes as any).constructor.name
				}) in a web platform. Please report this error.`
			);
		}

		throw new Error(
			`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`
		);
	}

	flush(): string[] {
		if (!this.buffer.length && !this.trailingCR) {
			return [];
		}

		const lines = [this.buffer.join('')];
		this.buffer = [];
		this.trailingCR = false;
		return lines;
	}
}

/**
 * Decodes an array of chunks into an array of lines.
 *
 * This is an internal helper function that's just used for testing
 *
 * @param chunks - An array of chunks to decode.
 * @returns An array of decoded lines.
 */
export function _decodeChunks(chunks: string[]): string[] {
	const decoder = new LineDecoder();
	const lines: string[] = [];
	for (const chunk of chunks) {
		lines.push(...decoder.decode(chunk));
	}

	return lines;
}

function partition(str: string, delimiter: string): [string, string, string] {
	const index = str.indexOf(delimiter);
	if (index !== -1) {
		return [
			str.substring(0, index),
			delimiter,
			str.substring(index + delimiter.length)
		];
	}

	return [str, '', ''];
}

/**
 * Most browsers don't yet have async iterable support for ReadableStream,
 * and Node has a very different way of reading bytes from its "ReadableStream".
 *
 * This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
export function readableStreamAsyncIterable<T>(
	stream: any
): AsyncIterableIterator<T> {
	if (stream[Symbol.asyncIterator]) return stream;

	const reader = stream.getReader();
	return {
		async next() {
			try {
				const result = await reader.read();
				if (result?.done) reader.releaseLock(); // release lock when stream becomes closed
				return result;
			} catch (e) {
				reader.releaseLock(); // release lock when stream becomes errored
				throw e;
			}
		},
		async return() {
			const cancelPromise = reader.cancel();
			reader.releaseLock();
			await cancelPromise;
			return { done: true, value: undefined };
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}
