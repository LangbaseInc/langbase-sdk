import {beforeEach, describe, expect, it, vi} from 'vitest';
import {convertDocToFormData} from './doc-to-formdata';

// Mock FormData and Blob for Node.js environment
global.FormData = vi.fn().mockImplementation(() => ({
	append: vi.fn(),
	entries: vi.fn().mockReturnValue([]),
	get: vi.fn(),
	getAll: vi.fn(),
	has: vi.fn(),
	keys: vi.fn(),
	set: vi.fn(),
	delete: vi.fn(),
	values: vi.fn(),
	forEach: vi.fn(),
}));

global.Blob = vi.fn().mockImplementation((chunks, options) => ({
	size: chunks.reduce((total: number, chunk: any) => total + (chunk.length || 0), 0),
	type: options?.type || '',
	chunks,
}));

describe('convertDocToFormData', () => {
	let mockFormData: any;

	beforeEach(() => {
		vi.resetAllMocks();
		mockFormData = new FormData();
	});

	describe('Buffer input', () => {
		it('should convert Buffer to FormData', async () => {
			const buffer = Buffer.from('Hello, World!');
			const documentName = 'test.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(mockFormData.append).toHaveBeenCalledWith(
				'document',
				expect.any(Object), // Blob
				documentName
			);
			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);

			// Verify Blob was created with correct parameters
			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle empty Buffer', async () => {
			const buffer = Buffer.from('');
			const documentName = 'empty.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle different content types', async () => {
			const buffer = Buffer.from('PDF content');
			const documentName = 'document.pdf';
			const contentType = 'application/pdf';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});
	});

	describe('File input', () => {
		it('should handle File input', async () => {
			const mockFile = new File(['file content'], 'test.txt', {
				type: 'text/plain',
			});

			const documentName = 'uploaded-file.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: mockFile,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(mockFormData.append).toHaveBeenCalledWith(
				'document',
				mockFile,
				documentName
			);
			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);
		});
	});

	describe('FormData input', () => {
		it('should return existing FormData when passed', async () => {
			const existingFormData = new FormData();
			existingFormData.append('existing', 'data');

			const result = await convertDocToFormData({
				document: existingFormData,
				documentName: 'form.txt',
				contentType: 'text/plain',
			});

			expect(result).toBe(existingFormData);
		});
	});

	describe('ReadableStream input', () => {
		it('should convert ReadableStream to FormData', async () => {
			const chunks = [
				new TextEncoder().encode('chunk1'),
				new TextEncoder().encode('chunk2'),
				new TextEncoder().encode('chunk3'),
			];

			const mockStream = new ReadableStream({
				start(controller) {
					chunks.forEach(chunk => controller.enqueue(chunk));
					controller.close();
				},
			});

			const documentName = 'stream.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: mockStream,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(mockFormData.append).toHaveBeenCalledWith(
				'document',
				expect.any(Object), // Blob
				documentName
			);
			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);

			// Verify Blob was created with the combined chunks
			expect(global.Blob).toHaveBeenCalledWith(chunks, {type: contentType});
		});

		it('should handle empty ReadableStream', async () => {
			const mockStream = new ReadableStream({
				start(controller) {
					controller.close();
				},
			});

			const documentName = 'empty-stream.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: mockStream,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(global.Blob).toHaveBeenCalledWith([], {type: contentType});
		});

		it('should handle ReadableStream with single chunk', async () => {
			const chunk = new TextEncoder().encode('single chunk');
			const mockStream = new ReadableStream({
				start(controller) {
					controller.enqueue(chunk);
					controller.close();
				},
			});

			const documentName = 'single.txt';
			const contentType = 'text/plain';

			await convertDocToFormData({
				document: mockStream,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([chunk], {type: contentType});
		});

		it('should handle ReadableStream error gracefully', async () => {
			const mockStream = new ReadableStream({
				start(controller) {
					controller.error(new Error('Stream error'));
				},
			});

			const documentName = 'error.txt';
			const contentType = 'text/plain';

			await expect(
				convertDocToFormData({
					document: mockStream,
					documentName,
					contentType,
				})
			).rejects.toThrow('Stream error');
		});
	});

	describe('Different content types', () => {
		it('should handle application/pdf', async () => {
			const buffer = Buffer.from('PDF content');
			const documentName = 'document.pdf';
			const contentType = 'application/pdf';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle text/markdown', async () => {
			const buffer = Buffer.from('# Markdown content');
			const documentName = 'readme.md';
			const contentType = 'text/markdown';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle text/csv', async () => {
			const buffer = Buffer.from('col1,col2\nval1,val2');
			const documentName = 'data.csv';
			const contentType = 'text/csv';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle Excel files', async () => {
			const buffer = Buffer.from('Excel binary content');
			const documentName = 'spreadsheet.xlsx';
			const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle legacy Excel files', async () => {
			const buffer = Buffer.from('Excel binary content');
			const documentName = 'spreadsheet.xls';
			const contentType = 'application/vnd.ms-excel';

			await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});
	});

	describe('Document names', () => {
		it('should handle simple document names', async () => {
			const buffer = Buffer.from('content');
			const documentName = 'simple.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);
		});

		it('should handle document names with spaces', async () => {
			const buffer = Buffer.from('content');
			const documentName = 'my document with spaces.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);
		});

		it('should handle document names with special characters', async () => {
			const buffer = Buffer.from('content');
			const documentName = 'document-with_special@chars!.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);
		});

		it('should handle long document names', async () => {
			const buffer = Buffer.from('content');
			const documentName = 'very-long-document-name-that-exceeds-normal-length-limits-for-testing-purposes.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(mockFormData.append).toHaveBeenCalledWith('documentName', documentName);
		});
	});

	describe('Edge cases', () => {
		it('should handle Buffer with binary data', async () => {
			const binaryData = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
			const buffer = Buffer.from(binaryData);
			const documentName = 'image.png';
			const contentType = 'image/png';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle very large Buffer', async () => {
			const size = 10 * 1024 * 1024; // 10MB
			const buffer = Buffer.alloc(size, 'A');
			const documentName = 'large-file.txt';
			const contentType = 'text/plain';

			const result = await convertDocToFormData({
				document: buffer,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(global.Blob).toHaveBeenCalledWith([buffer], {type: contentType});
		});

		it('should handle ReadableStream with varying chunk sizes', async () => {
			const chunks = [
				new Uint8Array(10),  // Small chunk
				new Uint8Array(1024), // Medium chunk
				new Uint8Array(10240), // Large chunk
			];

			const mockStream = new ReadableStream({
				start(controller) {
					chunks.forEach(chunk => controller.enqueue(chunk));
					controller.close();
				},
			});

			const documentName = 'varying-chunks.bin';
			const contentType = 'application/octet-stream';

			const result = await convertDocToFormData({
				document: mockStream,
				documentName,
				contentType,
			});

			expect(result).toBeInstanceOf(FormData);
			expect(global.Blob).toHaveBeenCalledWith(chunks, {type: contentType});
		});
	});
});