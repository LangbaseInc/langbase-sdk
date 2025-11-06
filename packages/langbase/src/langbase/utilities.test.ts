import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Utility APIs - Parser, Chunker, Embed', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('parse() / parser() - Document Parsing', () => {
		it('should successfully parse a text document', async () => {
			const textContent = 'This is a test document with sample text content for parsing.';
			const buffer = Buffer.from(textContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test-parse.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('documentName', 'test-parse.txt');
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result.content.length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully parse a markdown document', async () => {
			const mdContent = `# Test Document

## Section 1
This is a test markdown document.

### Subsection
- Item 1
- Item 2
- Item 3

**Bold text** and *italic text*.
`;
			const buffer = Buffer.from(mdContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test.md',
				contentType: 'text/markdown',
			});

			expect(result).toHaveProperty('documentName', 'test.md');
			expect(result).toHaveProperty('content');
			expect(result.content).toContain('Test Document');
		}, 30000);

		it('should work with parser() alias method', async () => {
			const buffer = Buffer.from('Test content for parser alias', 'utf-8');

			const result = await langbase.parser({
				document: buffer,
				documentName: 'alias-test.txt',
				contentType: 'text/plain',
			});

			expect(result).toHaveProperty('documentName');
			expect(result).toHaveProperty('content');
		}, 30000);

		it('should successfully parse CSV content', async () => {
			const csvContent = `Name,Age,City
Alice,30,New York
Bob,25,San Francisco
Charlie,35,Boston`;

			const buffer = Buffer.from(csvContent, 'utf-8');

			const result = await langbase.parse({
				document: buffer,
				documentName: 'test.csv',
				contentType: 'text/csv',
			});

			expect(result).toHaveProperty('content');
			expect(result.content).toContain('Alice');
		}, 30000);
	});

	describe('chunk() / chunker() - Text Chunking', () => {
		it('should successfully chunk text with default settings', async () => {
			const longText = `
Artificial Intelligence has revolutionized the way we approach problem-solving and automation.
From healthcare to finance, AI systems are being deployed to handle complex tasks that were once
the exclusive domain of human experts. Machine learning algorithms can now process vast amounts
of data, identifying patterns and making predictions with remarkable accuracy.

The field of AI encompasses various subdomains including natural language processing, computer vision,
and robotics. Each of these areas has seen tremendous progress in recent years, driven by advances
in deep learning and the availability of large datasets. Neural networks, particularly deep neural
networks, have become the backbone of many modern AI applications.
			`.trim();

			const result = await langbase.chunk({
				content: longText,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			result.forEach(chunk => {
				expect(typeof chunk).toBe('string');
			});
		}, 30000);

		it('should successfully chunk with custom chunk size', async () => {
			const text = 'A'.repeat(5000); // Create a long string

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 2000,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(1);
			result.forEach(chunk => {
				expect(chunk.length).toBeLessThanOrEqual(2000);
			});
		}, 30000);

		it('should successfully chunk with custom overlap', async () => {
			const text = 'Lorem ipsum dolor sit amet, '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 500,
				chunkOverlap: 100,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(1);
		}, 30000);

		it('should work with chunker() alias method', async () => {
			const text = 'Test content for chunker alias. '.repeat(50);

			const result = await langbase.chunker({
				content: text,
				chunkMaxLength: 200,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should handle small text that does not need chunking', async () => {
			const shortText = 'This is a short text.';

			const result = await langbase.chunk({
				content: shortText,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThanOrEqual(1);
		}, 30000);

		it('should handle maximum chunk size', async () => {
			const longText = 'A'.repeat(50000);

			const result = await langbase.chunk({
				content: longText,
				chunkMaxLength: 30000,
				chunkOverlap: 2000,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('embed() - Generate Embeddings', () => {
		it('should successfully generate embeddings for single chunk with default model', async () => {
			const result = await langbase.embed({
				chunks: ['This is a test sentence for embedding generation.'],
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(1);
			expect(Array.isArray(result[0])).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
			// Check that embeddings are numbers
			result[0].forEach(value => {
				expect(typeof value).toBe('number');
			});
		}, 30000);

		it('should successfully generate embeddings for multiple chunks', async () => {
			const chunks = [
				'Artificial intelligence is transforming technology.',
				'Machine learning algorithms learn from data.',
				'Deep learning uses neural networks.',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(3);
			result.forEach(embedding => {
				expect(Array.isArray(embedding)).toBe(true);
				expect(embedding.length).toBeGreaterThan(0);
			});
		}, 30000);

		it('should successfully generate embeddings with OpenAI model', async () => {
			const result = await langbase.embed({
				chunks: ['Test sentence for OpenAI embedding'],
				embeddingModel: 'openai:text-embedding-3-large',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully generate embeddings with Cohere model', async () => {
			const result = await langbase.embed({
				chunks: ['Test sentence for Cohere embedding'],
				embeddingModel: 'cohere:embed-v4.0',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully generate embeddings with Google model', async () => {
			const result = await langbase.embed({
				chunks: ['Test sentence for Google embedding'],
				embeddingModel: 'google:text-embedding-004',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle maximum number of chunks (100)', async () => {
			const chunks = Array.from({length: 100}, (_, i) => `Chunk number ${i + 1}`);

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(100);
		}, 30000);

		it('should handle chunks with varying lengths', async () => {
			const chunks = [
				'Short',
				'This is a medium length sentence.',
				'This is a much longer sentence that contains more words and provides more context for embedding generation and testing purposes.',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(3);
		}, 30000);
	});

	describe('Integration: Parse → Chunk → Embed pipeline', () => {
		it('should successfully process document through complete pipeline', async () => {
			const document = `
# AI Research Document

## Introduction
Artificial intelligence has become one of the most transformative technologies of our time.

## Machine Learning
Machine learning algorithms can automatically learn patterns from data without explicit programming.

## Deep Learning
Deep learning uses artificial neural networks with multiple layers to model complex patterns.

## Applications
AI applications span across healthcare, finance, transportation, and many other industries.

## Conclusion
The future of AI holds immense potential for solving complex real-world problems.
			`.trim();

			// Step 1: Parse
			const buffer = Buffer.from(document, 'utf-8');
			const parsed = await langbase.parse({
				document: buffer,
				documentName: 'ai-research.md',
				contentType: 'text/markdown',
			});

			expect(parsed).toHaveProperty('content');

			// Step 2: Chunk
			const chunked = await langbase.chunk({
				content: parsed.content,
				chunkMaxLength: 1500,
				chunkOverlap: 300,
			});

			expect(Array.isArray(chunked)).toBe(true);
			expect(chunked.length).toBeGreaterThan(0);

			// Step 3: Embed (take first 3 chunks to avoid rate limits)
			const embeddingsInput = chunked.slice(0, 3);
			const embeddings = await langbase.embed({
				chunks: embeddingsInput,
			});

			expect(Array.isArray(embeddings)).toBe(true);
			expect(embeddings.length).toBe(embeddingsInput.length);
			embeddings.forEach(embedding => {
				expect(Array.isArray(embedding)).toBe(true);
				expect(embedding.length).toBeGreaterThan(0);
			});
		}, 60000);
	});
});
