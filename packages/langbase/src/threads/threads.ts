import {Request} from '@/common/request';
import {
	ThreadsCreate,
	ThreadsUpdate,
	ThreadsGet,
	DeleteThreadOptions,
	ThreadsBaseResponse,
	ThreadMessagesCreate,
	ThreadMessagesList,
	ThreadMessagesBaseResponse,
} from './types';

/**
 * Creates a new thread with specified options.
 * @param {Request} request - The request instance for making API calls.
 * @param {ThreadsCreate} options - The options object containing thread creation parameters.
 * @returns {Promise<ThreadsBaseResponse>} A promise that resolves to the created thread response.
 */
export async function createThread(
	request: Request,
	options: ThreadsCreate,
): Promise<ThreadsBaseResponse> {
	return request.post({
		endpoint: '/v1/threads',
		body: options,
	});
}

/**
 * Updates an existing thread with the provided options.
 *
 * @param {Request} request - The request instance for making API calls.
 * @param options - The options to update the thread with
 * @param options.threadId - The ID of the thread to update
 * @returns A promise that resolves to the updated thread response
 * @throws {Error} If the request fails
 */
export async function updateThread(
	request: Request,
	options: ThreadsUpdate,
): Promise<ThreadsBaseResponse> {
	return request.post({
		endpoint: `/v1/threads/${options.threadId}`,
		body: options,
	});
}

/**
 * Retrieves a thread by its ID.
 * @param {Request} request - The request instance for making API calls.
 * @param {ThreadsGet} options - The options object containing the thread ID.
 * @param {string} options.threadId - The unique identifier of the thread to retrieve.
 * @returns {Promise<ThreadsBaseResponse>} A promise that resolves to the thread data.
 */
export async function getThread(
	request: Request,
	options: ThreadsGet,
): Promise<ThreadsBaseResponse> {
	return request.get({
		endpoint: `/v1/threads/${options.threadId}`,
	});
}

/**
 * Deletes a thread by its ID.
 * @param {Request} request - The request instance for making API calls.
 * @param {DeleteThreadOptions} options - The options object containing the thread ID.
 * @param {string} options.threadId - The unique identifier of the thread to delete.
 * @returns {Promise<{success: boolean}>} A promise that resolves to the delete operation response.
 */
export async function deleteThread(
	request: Request,
	options: DeleteThreadOptions,
): Promise<{success: boolean}> {
	return request.delete({
		endpoint: `/v1/threads/${options.threadId}`,
	});
}

/**
 * Appends messages to an existing thread.
 * @param {Request} request - The request instance for making API calls.
 * @param {ThreadMessagesCreate} options - The options object containing thread ID and messages.
 * @param {string} options.threadId - The ID of the thread to append messages to.
 * @param {ThreadMessage[]} options.messages - The messages to append to the thread.
 * @returns {Promise<ThreadMessagesBaseResponse[]>} A promise that resolves to the appended messages response.
 */
export async function appendThreadMessages(
	request: Request,
	options: ThreadMessagesCreate,
): Promise<ThreadMessagesBaseResponse[]> {
	return request.post({
		endpoint: `/v1/threads/${options.threadId}/messages`,
		body: options.messages,
	});
}

/**
 * Lists all messages in a thread.
 * @param {Request} request - The request instance for making API calls.
 * @param {ThreadMessagesList} options - The options object containing the thread ID.
 * @param {string} options.threadId - The unique identifier of the thread to list messages from.
 * @returns {Promise<ThreadMessagesBaseResponse[]>} A promise that resolves to the list of thread messages.
 */
export async function listThreadMessages(
	request: Request,
	options: ThreadMessagesList,
): Promise<ThreadMessagesBaseResponse[]> {
	return request.get({
		endpoint: `/v1/threads/${options.threadId}/messages`,
	});
}
