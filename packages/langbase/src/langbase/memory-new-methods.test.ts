import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Langbase} from '../langbase/langbase';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the Request class
vi.mock('../common/request');

describe('Memory - New Methods', () => {
	let langbase: Langbase;
	const mockApiKey = 'test-api-key';

	beforeEach(() => {
		langbase = new Langbase({apiKey: mockApiKey});
		vi.resetAllMocks();
	});

	describe('uploadText', () => {
		it('should upload text content to memory', async () => {
			const mockSignedUrl = 'https://test-upload-url.com';
			const mockResponse = {signedUrl: mockSignedUrl};
			const mockUploadResponse = new Response(null, {status: 200});

			// Mock the request to get signed URL
			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			// Mock fetch for the actual upload
			mockFetch.mockResolvedValue(mockUploadResponse);

			const options = {
				memoryName: 'test-memory',
				text: 'Hello, this is test content',
				documentName: 'test-doc.txt',
				meta: {type: 'test'},
			};

			const result = await langbase.memories.uploadText(options);

			// Check that signed URL request was made correctly
			expect(mockPost).toHaveBeenCalledWith({
				endpoint: '/v1/memory/documents',
				body: {
					memoryName: 'test-memory',
					fileName: 'test-doc.txt',
					meta: {type: 'test'},
				},
			});

			// Check that fetch was called with correct parameters
			expect(mockFetch).toHaveBeenCalledWith(mockSignedUrl, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${mockApiKey}`,
					'Content-Type': 'text/plain',
				},
				body: 'Hello, this is test content',
			});

			expect(result).toBe(mockUploadResponse);
		});

		it('should generate document name if not provided', async () => {
			const mockSignedUrl = 'https://test-upload-url.com';
			const mockResponse = {signedUrl: mockSignedUrl};
			const mockUploadResponse = new Response(null, {status: 200});

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};
			mockFetch.mockResolvedValue(mockUploadResponse);

			const options = {
				memoryName: 'test-memory',
				text: 'Hello, this is test content',
			};

			await langbase.memories.uploadText(options);

			// Check that a document name was generated
			const callArgs = mockPost.mock.calls[0][0];
			expect(callArgs.body.fileName).toMatch(/^text-\d+\.txt$/);
		});
	});

	describe('uploadFromSearch', () => {
		it('should search and upload results to memory', async () => {
			const mockSearchResults = [
				{url: 'https://example.com/1', content: 'First result content'},
				{url: 'https://example.com/2', content: 'Second result content'},
			];

			const mockSignedUrl = 'https://test-upload-url.com';
			const mockResponse = {signedUrl: mockSignedUrl};
			const mockUploadResponse = new Response(null, {status: 200});

			// Mock webSearch method
			vi.spyOn(langbase as any, 'webSearch').mockResolvedValue(mockSearchResults);

			// Mock request for signed URLs
			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			// Mock fetch for uploads
			mockFetch.mockResolvedValue(mockUploadResponse);

			const options = {
				memoryName: 'test-memory',
				query: 'test query',
				service: 'exa' as const,
				totalResults: 2,
				apiKey: 'test-search-key',
				documentNamePrefix: 'search-result',
				meta: {type: 'search'},
			};

			const results = await langbase.memories.uploadFromSearch(options);

			// Check that webSearch was called correctly
			expect((langbase as any).webSearch).toHaveBeenCalledWith({
				query: 'test query',
				service: 'exa',
				totalResults: 2,
				domains: undefined,
				apiKey: 'test-search-key',
			});

			// Check that we got results for each search result
			expect(results).toHaveLength(2);
			expect(results[0]).toBe(mockUploadResponse);
			expect(results[1]).toBe(mockUploadResponse);

			// Check that signed URL requests were made for each result
			expect(mockPost).toHaveBeenCalledTimes(2);

			// Check that fetch was called for each result
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe('uploadFromCrawl', () => {
		it('should crawl URLs and upload content to memory', async () => {
			const mockCrawlResults = [
				{url: 'https://example.com/', content: 'Homepage content'},
				{url: 'https://example.com/about', content: 'About page content'},
			];

			const mockSignedUrl = 'https://test-upload-url.com';
			const mockResponse = {signedUrl: mockSignedUrl};
			const mockUploadResponse = new Response(null, {status: 200});

			// Mock webCrawl method
			vi.spyOn(langbase as any, 'webCrawl').mockResolvedValue(mockCrawlResults);

			// Mock request for signed URLs
			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};

			// Mock fetch for uploads
			mockFetch.mockResolvedValue(mockUploadResponse);

			const options = {
				memoryName: 'test-memory',
				url: ['https://example.com/', 'https://example.com/about'],
				maxPages: 1,
				apiKey: 'test-crawl-key',
				service: 'spider' as const,
				documentNamePrefix: 'crawl-result',
				meta: {type: 'crawl'},
			};

			const results = await langbase.memories.uploadFromCrawl(options);

			// Check that webCrawl was called correctly
			expect((langbase as any).webCrawl).toHaveBeenCalledWith({
				url: ['https://example.com/', 'https://example.com/about'],
				maxPages: 1,
				apiKey: 'test-crawl-key',
				service: 'spider',
			});

			// Check that we got results for each crawl result
			expect(results).toHaveLength(2);
			expect(results[0]).toBe(mockUploadResponse);
			expect(results[1]).toBe(mockUploadResponse);

			// Check that signed URL requests were made for each result
			expect(mockPost).toHaveBeenCalledTimes(2);

			// Check that fetch was called for each result
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it('should handle URL domain extraction correctly', async () => {
			const mockCrawlResults = [
				{url: 'https://www.example.com/page', content: 'Page content'},
			];

			const mockSignedUrl = 'https://test-upload-url.com';
			const mockResponse = {signedUrl: mockSignedUrl};
			const mockUploadResponse = new Response(null, {status: 200});

			vi.spyOn(langbase as any, 'webCrawl').mockResolvedValue(mockCrawlResults);

			const mockPost = vi.fn().mockResolvedValue(mockResponse);
			(langbase as any).request = {post: mockPost};
			mockFetch.mockResolvedValue(mockUploadResponse);

			const options = {
				memoryName: 'test-memory',
				url: ['https://www.example.com/page'],
				apiKey: 'test-crawl-key',
			};

			await langbase.memories.uploadFromCrawl(options);

			// Check that the document name includes the domain without 'www.'
			const callArgs = mockPost.mock.calls[0][0];
			expect(callArgs.body.fileName).toMatch(/^crawl-example\.com-\d+-\d+\.txt$/);
		});
	});
});