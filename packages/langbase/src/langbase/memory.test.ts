import {afterAll, beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';
import * as fs from 'fs';
import * as path from 'path';

describe('Langbase Memory API - langbase.memories.*', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';
	const createdMemories: string[] = []; // Track created memories for cleanup

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	// Clean up all created memories after all tests
	afterAll(async () => {
		console.log(`\n🧹 Cleaning up ${createdMemories.length} memories...`);
		for (const memoryName of createdMemories) {
			try {
				await langbase.memories.delete({name: memoryName});
				console.log(`  ✅ Deleted memory: ${memoryName}`);
			} catch (error: any) {
				console.log(`  ⚠️  Failed to delete memory: ${memoryName} - ${error.message}`);
			}
		}
	});

	describe('memories.create()', () => {
		it('should successfully create a new memory with default settings', async () => {
			const memoryName = `test-memory-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			const result = await langbase.memories.create({
				name: memoryName,
				description: 'Test memory created by automated tests',
			});

			expect(result).toHaveProperty('name', memoryName);
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('owner_login');
			expect(result).toHaveProperty('url');
			expect(result).toHaveProperty('chunk_size');
			expect(result).toHaveProperty('chunk_overlap');
			expect(result).toHaveProperty('embedding_model');
		}, 30000);

		it('should successfully create memory with custom chunk settings', async () => {
			const memoryName = `test-memory-custom-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			const result = await langbase.memories.create({
				name: memoryName,
				description: 'Memory with custom chunk size',
				chunk_size: 5000,
				chunk_overlap: 1000,
			});

			expect(result).toHaveProperty('chunk_size', 5000);
			expect(result).toHaveProperty('chunk_overlap', 1000);
		}, 30000);

		it('should successfully create memory with custom embedding model', async () => {
			const memoryName = `test-memory-embed-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			const result = await langbase.memories.create({
				name: memoryName,
				description: 'Memory with custom embedding model',
				embedding_model: 'cohere:embed-v4.0',
			});

			expect(result).toHaveProperty('embedding_model', 'cohere:embed-v4.0');
		}, 30000);

		it('should successfully create memory with custom top_k', async () => {
			const memoryName = `test-memory-topk-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			const result = await langbase.memories.create({
				name: memoryName,
				description: 'Memory with custom top_k',
				top_k: 20,
			});

			expect(result).toHaveProperty('name', memoryName);
		}, 30000);
	});

	describe('memories.list()', () => {
		it('should successfully list all memories', async () => {
			const result = await langbase.memories.list();

			expect(Array.isArray(result)).toBe(true);
			if (result.length > 0) {
				expect(result[0]).toHaveProperty('name');
				expect(result[0]).toHaveProperty('description');
				expect(result[0]).toHaveProperty('owner_login');
				expect(result[0]).toHaveProperty('embeddingModel');
			}
		}, 30000);
	});

	describe('memories.documents.upload()', () => {
		it('should successfully upload a text document to memory', async () => {
			const memoryName = `test-memory-upload-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			// Create memory first
			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for document upload tests',
			});

			// Create a test document
			const testContent = 'This is test content for document upload testing. It contains sample text data.';
			const buffer = Buffer.from(testContent, 'utf-8');

			const result = await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'test-doc.txt',
				document: buffer,
				contentType: 'text/plain',
				meta: {
					author: 'test-suite',
					category: 'testing',
				},
			});

			expect(result).toBeTruthy();
			expect(result.ok).toBe(true);
		}, 30000);

		it('should successfully upload a markdown document', async () => {
			const memoryName = `test-memory-md-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for markdown upload',
			});

			const mdContent = '# Test Document\n\nThis is a **test** markdown document.';
			const buffer = Buffer.from(mdContent, 'utf-8');

			const result = await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'test.md',
				document: buffer,
				contentType: 'text/markdown',
			});

			expect(result).toBeTruthy();
			expect(result.ok).toBe(true);
		}, 30000);
	});

	describe('memories.documents.list()', () => {
		it('should successfully list documents in a memory', async () => {
			const memoryName = `test-memory-list-docs-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			// Create memory
			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for listing documents',
			});

			// Upload a document
			const buffer = Buffer.from('Test content', 'utf-8');
			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'list-test.txt',
				document: buffer,
				contentType: 'text/plain',
			});

			// List documents
			const result = await langbase.memories.documents.list({
				memoryName: memoryName,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]).toHaveProperty('name');
			expect(result[0]).toHaveProperty('status');
			expect(result[0]).toHaveProperty('metadata');
			expect(result[0].metadata).toHaveProperty('size');
			expect(result[0].metadata).toHaveProperty('type');
		}, 30000);
	});

	describe('memories.retrieve()', () => {
		it('should successfully retrieve similar documents from memory', async () => {
			const memoryName = `test-memory-retrieve-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			// Create memory
			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for retrieval testing',
			});

			// Upload documents with AI-related content
			const doc1 = 'Artificial intelligence is transforming the world of technology.';
			const doc2 = 'Machine learning algorithms can learn from data patterns.';
			const doc3 = 'Deep learning uses neural networks with multiple layers.';

			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'ai-doc-1.txt',
				document: Buffer.from(doc1, 'utf-8'),
				contentType: 'text/plain',
			});

			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'ai-doc-2.txt',
				document: Buffer.from(doc2, 'utf-8'),
				contentType: 'text/plain',
			});

			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'ai-doc-3.txt',
				document: Buffer.from(doc3, 'utf-8'),
				contentType: 'text/plain',
			});

			// Wait for embeddings to be processed (may need a few seconds)
			await new Promise(resolve => setTimeout(resolve, 15000));

			// Retrieve similar documents
			const result = await langbase.memories.retrieve({
				query: 'What is artificial intelligence?',
				memory: [{name: memoryName}],
				topK: 2,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			if (result.length > 0) {
				expect(result[0]).toHaveProperty('text');
				expect(result[0]).toHaveProperty('similarity');
				expect(result[0]).toHaveProperty('meta');
				expect(typeof result[0].similarity).toBe('number');
			}
		}, 60000);

		it('should successfully retrieve with metadata filters', async () => {
			const memoryName = `test-memory-filters-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for filter testing',
			});

			// Upload documents with different categories
			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'tech-doc.txt',
				document: Buffer.from('Technology content', 'utf-8'),
				contentType: 'text/plain',
				meta: {category: 'technology'},
			});

			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'science-doc.txt',
				document: Buffer.from('Science content', 'utf-8'),
				contentType: 'text/plain',
				meta: {category: 'science'},
			});

			await new Promise(resolve => setTimeout(resolve, 10000));

			// Retrieve with filters
			const result = await langbase.memories.retrieve({
				query: 'content',
				memory: [
					{
						name: memoryName,
						filters: ['And', [['category', 'Eq', 'technology']]],
					},
				],
				topK: 5,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);
	});

	describe('memories.documents.embeddings.retry()', () => {
		it('should successfully retry embeddings for a failed document', async () => {
			const memoryName = `test-memory-retry-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for retry testing',
			});

			// Upload a document
			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'retry-test.txt',
				document: Buffer.from('Test content for retry', 'utf-8'),
				contentType: 'text/plain',
			});

			// Attempt to retry embeddings
			const result = await langbase.memories.documents.embeddings.retry({
				memoryName: memoryName,
				documentName: 'retry-test.txt',
			});

			expect(result).toHaveProperty('success');
		}, 30000);
	});

	describe('memories.documents.delete()', () => {
		it('should successfully delete a document from memory', async () => {
			const memoryName = `test-memory-delete-doc-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			await langbase.memories.create({
				name: memoryName,
				description: 'Memory for document deletion',
			});

			// Upload document
			await langbase.memories.documents.upload({
				memoryName: memoryName,
				documentName: 'to-delete.txt',
				document: Buffer.from('Content to delete', 'utf-8'),
				contentType: 'text/plain',
			});

			// Delete document
			const result = await langbase.memories.documents.delete({
				memoryName: memoryName,
				documentName: 'to-delete.txt',
			});

			expect(result).toHaveProperty('success');
			expect(result.success === true || result.success === 'true').toBe(true);
		}, 30000);
	});

	describe('memories.delete()', () => {
		it('should successfully delete a memory', async () => {
			const memoryName = `test-memory-delete-${Date.now()}`;

			// Create memory
			await langbase.memories.create({
				name: memoryName,
				description: 'Memory to be deleted',
			});

			// Delete memory (no need to track for cleanup since we're deleting it)
			const result = await langbase.memories.delete({
				name: memoryName,
			});

			expect(result).toHaveProperty('success');
			expect(result.success === true || result.success === 'true').toBe(true);
		}, 30000);
	});

	describe('deprecated memory.* methods (backwards compatibility)', () => {
		it('should work with deprecated memory.create() method', async () => {
			const memoryName = `test-deprecated-memory-${Date.now()}`;
			createdMemories.push(memoryName); // Track for cleanup

			const result = await langbase.memory.create({
				name: memoryName,
				description: 'Testing deprecated method',
			});

			expect(result).toHaveProperty('name', memoryName);
		}, 30000);

		it('should work with deprecated memory.list() method', async () => {
			const result = await langbase.memory.list();

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});
});
