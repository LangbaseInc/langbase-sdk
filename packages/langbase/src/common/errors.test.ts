import {describe, expect, it} from 'vitest';
import {
	APIError,
	APIConnectionError,
	APIConnectionTimeoutError,
	AuthenticationError,
	BadRequestError,
	ConflictError,
	InternalServerError,
	NotFoundError,
	PermissionDeniedError,
	RateLimitError,
	UnprocessableEntityError,
} from './errors';

describe('Error Classes', () => {
	describe('APIError', () => {
		it('should create APIError with all parameters', () => {
			const status = 400;
			const error = {message: 'Test error', code: 'test_error'};
			const message = 'API Error occurred';
			const headers = {'lb-request-id': 'req-123'};

			const apiError = new APIError(status, error, message, headers);

			expect(apiError.status).toBe(400);
			expect(apiError.error).toEqual(error);
			expect(apiError.message).toBe('400 API Error occurred');
			expect(apiError.headers).toEqual(headers);
			expect(apiError.request_id).toBe('req-123');
			expect(apiError.code).toBe('test_error');
		});

		it('should handle error with nested message object', () => {
			const error = {message: {details: 'Detailed error info'}};
			const apiError = new APIError(400, error, 'Test', {});

			expect(apiError.message).toBe(
				'400 {"details":"Detailed error info"}',
			);
		});

		it('should handle error without specific message', () => {
			const error = {code: 'generic_error'};
			const apiError = new APIError(500, error, undefined, {});

			expect(apiError.message).toBe('500 {"code":"generic_error"}');
		});

		it('should handle status only', () => {
			const apiError = new APIError(404, undefined, undefined, {});

			expect(apiError.message).toBe('404 status code (no body)');
		});

		it('should handle message only', () => {
			const apiError = new APIError(undefined, undefined, 'Custom message', {});

			expect(apiError.message).toBe('Custom message');
		});

		it('should handle no parameters', () => {
			const apiError = new APIError(undefined, undefined, undefined, {});

			expect(apiError.message).toBe('(no status code or body)');
		});

		describe('APIError.generate', () => {
			it('should generate BadRequestError for 400 status', () => {
				const error = APIError.generate(
					400,
					{error: {message: 'Bad request'}},
					'Bad Request',
					{}
				);

				expect(error).toBeInstanceOf(BadRequestError);
				expect(error.status).toBe(400);
			});

			it('should generate AuthenticationError for 401 status', () => {
				const error = APIError.generate(
					401,
					{error: {message: 'Unauthorized'}},
					'Unauthorized',
					{}
				);

				expect(error).toBeInstanceOf(AuthenticationError);
				expect(error.status).toBe(401);
			});

			it('should generate PermissionDeniedError for 403 status', () => {
				const error = APIError.generate(
					403,
					{error: {message: 'Forbidden'}},
					'Forbidden',
					{}
				);

				expect(error).toBeInstanceOf(PermissionDeniedError);
				expect(error.status).toBe(403);
			});

			it('should generate NotFoundError for 404 status', () => {
				const error = APIError.generate(
					404,
					{error: {message: 'Not found'}},
					'Not Found',
					{}
				);

				expect(error).toBeInstanceOf(NotFoundError);
				expect(error.status).toBe(404);
			});

			it('should generate ConflictError for 409 status', () => {
				const error = APIError.generate(
					409,
					{error: {message: 'Conflict'}},
					'Conflict',
					{}
				);

				expect(error).toBeInstanceOf(ConflictError);
				expect(error.status).toBe(409);
			});

			it('should generate UnprocessableEntityError for 422 status', () => {
				const error = APIError.generate(
					422,
					{error: {message: 'Validation failed'}},
					'Unprocessable Entity',
					{}
				);

				expect(error).toBeInstanceOf(UnprocessableEntityError);
				expect(error.status).toBe(422);
			});

			it('should generate RateLimitError for 429 status', () => {
				const error = APIError.generate(
					429,
					{error: {message: 'Rate limit exceeded'}},
					'Too Many Requests',
					{}
				);

				expect(error).toBeInstanceOf(RateLimitError);
				expect(error.status).toBe(429);
			});

			it('should generate InternalServerError for 500+ status', () => {
				const error = APIError.generate(
					500,
					{error: {message: 'Internal error'}},
					'Internal Server Error',
					{}
				);

				expect(error).toBeInstanceOf(InternalServerError);
				expect(error.status).toBe(500);
			});

			it('should generate generic APIError for unknown status codes', () => {
				const error = APIError.generate(
					418,
					{error: {message: "I'm a teapot"}},
					"I'm a teapot",
					{}
				);

				expect(error).toBeInstanceOf(APIError);
				expect(error.status).toBe(418);
			});

			it('should generate APIConnectionError when status is undefined', () => {
				const error = APIError.generate(
					undefined,
					new Error('Network error'),
					undefined,
					{}
				);

				expect(error).toBeInstanceOf(APIConnectionError);
			});
		});
	});

	describe('APIConnectionError', () => {
		it('should create with default message', () => {
			const error = new APIConnectionError({});

			expect(error.status).toBeUndefined();
			expect(error.message).toBe('Connection error.');
			expect(error).toBeInstanceOf(APIError);
		});

		it('should create with custom message', () => {
			const error = new APIConnectionError({message: 'Custom connection error'});

			expect(error.message).toBe('Custom connection error');
		});

		it('should create with cause', () => {
			const cause = new Error('Network failure');
			const error = new APIConnectionError({cause});

			expect((error as any).cause).toBe(cause);
		});

		it('should create with both message and cause', () => {
			const cause = new Error('Network failure');
			const error = new APIConnectionError({
				message: 'Connection failed',
				cause,
			});

			expect(error.message).toBe('Connection failed');
			expect((error as any).cause).toBe(cause);
		});
	});

	describe('APIConnectionTimeoutError', () => {
		it('should create with default timeout message', () => {
			const error = new APIConnectionTimeoutError();

			expect(error.message).toBe('Request timed out.');
			expect(error).toBeInstanceOf(APIConnectionError);
		});

		it('should create with custom timeout message', () => {
			const error = new APIConnectionTimeoutError({
				message: 'Custom timeout error',
			});

			expect(error.message).toBe('Custom timeout error');
		});
	});

	describe('Specific Error Classes', () => {
		it('BadRequestError should have correct status', () => {
			const error = new BadRequestError(400, {}, 'Bad request', {});
			expect(error.status).toBe(400);
		});

		it('AuthenticationError should have correct status', () => {
			const error = new AuthenticationError(401, {}, 'Unauthorized', {});
			expect(error.status).toBe(401);
		});

		it('PermissionDeniedError should have correct status', () => {
			const error = new PermissionDeniedError(403, {}, 'Forbidden', {});
			expect(error.status).toBe(403);
		});

		it('NotFoundError should have correct status', () => {
			const error = new NotFoundError(404, {}, 'Not found', {});
			expect(error.status).toBe(404);
		});

		it('ConflictError should have correct status', () => {
			const error = new ConflictError(409, {}, 'Conflict', {});
			expect(error.status).toBe(409);
		});

		it('UnprocessableEntityError should have correct status', () => {
			const error = new UnprocessableEntityError(422, {}, 'Unprocessable', {});
			expect(error.status).toBe(422);
		});

		it('RateLimitError should have correct status', () => {
			const error = new RateLimitError(429, {}, 'Rate limited', {});
			expect(error.status).toBe(429);
		});

		it('InternalServerError should inherit from APIError', () => {
			const error = new InternalServerError(500, {}, 'Internal error', {});
			expect(error).toBeInstanceOf(APIError);
			expect(error.status).toBe(500);
		});
	});
});