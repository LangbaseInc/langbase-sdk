import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Chunker API - langbase.chunk() / langbase.chunker()', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('chunk() - Text Chunking with Default Settings', () => {
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
				expect(chunk.length).toBeGreaterThan(0);
			});
		}, 30000);

		it('should handle small text that does not need chunking', async () => {
			const shortText = 'This is a short text that fits in one chunk.';

			const result = await langbase.chunk({
				content: shortText,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThanOrEqual(1);
			expect(result[0]).toContain('short text');
		}, 30000);

		it('should handle empty text', async () => {
			const emptyText = '';

			const result = await langbase.chunk({
				content: emptyText,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunk() - Custom Chunk Size', () => {
		it('should successfully chunk with custom chunk size of 1500 characters', async () => {
			const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 1500,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully chunk with custom chunk size of 2000 characters', async () => {
			const text = 'A'.repeat(5000);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 2000,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThanOrEqual(1);
		}, 30000);

		it('should successfully chunk with maximum chunk size of 30000 characters', async () => {
			const text = 'B'.repeat(50000);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 30000,
			});

			expect(Array.isArray(result)).toBe(true);
			result.forEach(chunk => {
				expect(chunk.length).toBeLessThanOrEqual(30000);
			});
		}, 30000);

		it('should successfully chunk with minimum chunk size of 1024 characters', async () => {
			const text = 'Test sentence. '.repeat(200);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 1024,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunk() - Custom Overlap', () => {
		it('should successfully chunk with minimum overlap of 256 characters', async () => {
			const text = 'Lorem ipsum dolor sit amet. '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 1500,
				chunkOverlap: 256,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		}, 30000);

		it('should successfully chunk with custom overlap of 500 characters', async () => {
			const text = 'The quick brown fox jumps over the lazy dog. '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 2000,
				chunkOverlap: 500,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should successfully chunk with larger overlap relative to chunk size', async () => {
			const text = 'Testing overlap behavior. '.repeat(150);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 3000,
				chunkOverlap: 1500,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunker() - Alias Method', () => {
		it('should work identically to chunk() method', async () => {
			const text = 'Test content for chunker alias method. '.repeat(50);

			const result = await langbase.chunker({
				content: text,
				chunkMaxLength: 1200,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		}, 30000);

		it('should handle all parameters with chunker() alias', async () => {
			const text = 'Another test for the chunker method. '.repeat(80);

			const result = await langbase.chunker({
				content: text,
				chunkMaxLength: 1800,
				chunkOverlap: 400,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunk() - Real-world Content Examples', () => {
		it('should chunk a long article', async () => {
			const article = `
# The Future of Artificial Intelligence

Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century.
From autonomous vehicles to medical diagnostics, AI systems are reshaping industries and changing how we live and work.

## Machine Learning Revolution

Machine learning, a subset of AI, has enabled computers to learn from data without explicit programming.
This breakthrough has led to remarkable advances in pattern recognition, natural language processing, and decision-making systems.

## Deep Learning and Neural Networks

Deep learning, powered by artificial neural networks with multiple layers, has achieved superhuman performance in tasks
like image recognition and game playing. These networks can extract complex features from raw data, enabling applications
that were once thought impossible.

## Natural Language Processing

NLP has made significant strides, with models like GPT and BERT understanding and generating human-like text.
These advances have powered virtual assistants, translation services, and content generation tools.

## Computer Vision

Computer vision systems can now identify objects, recognize faces, and understand scenes with remarkable accuracy.
This technology powers everything from smartphone cameras to autonomous vehicles.

## Ethics and Challenges

As AI becomes more powerful, ethical considerations become increasingly important. Issues like bias in algorithms,
privacy concerns, and the impact on employment require careful consideration and governance.

## The Road Ahead

The future of AI holds immense promise, from solving complex scientific problems to enhancing human creativity.
As we continue to push the boundaries of what's possible, responsible development and deployment of AI systems
will be crucial for ensuring benefits are widely shared.
			`.trim();

			const result = await langbase.chunk({
				content: article,
				chunkMaxLength: 1000,
				chunkOverlap: 200,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(1);
		}, 30000);

		it('should chunk technical documentation', async () => {
			const docs = `
API Authentication

All API requests must include an authentication token in the Authorization header.
The token should be prefixed with "Bearer" followed by your API key.

Example: Authorization: Bearer your_api_key_here

Rate Limiting

API requests are rate limited to prevent abuse. The current limits are:
- Free tier: 100 requests per hour
- Pro tier: 1000 requests per hour
- Enterprise: Custom limits

Error Codes

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 429: Rate Limit Exceeded
- 500: Server Error

Response Format

All responses are returned in JSON format with the following structure:
{
	"data": {},
	"meta": {},
	"errors": []
}
			`.trim();

			const result = await langbase.chunk({
				content: docs,
				chunkMaxLength: 1500,
				chunkOverlap: 300,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should chunk conversational data', async () => {
			const conversation = `
User: What is machine learning?
Assistant: Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

User: Can you give me an example?
Assistant: Sure! A common example is email spam filtering. The system learns to identify spam by analyzing thousands of emails, recognizing patterns in spam messages versus legitimate ones.

User: How does it learn?
Assistant: Machine learning systems learn through algorithms that process data, identify patterns, and make predictions or decisions. The more data they process, the better they become at their task.

User: What are the main types?
Assistant: The main types are supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error).
			`.trim();

			const result = await langbase.chunk({
				content: conversation,
				chunkMaxLength: 1400,
				chunkOverlap: 300,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should chunk code documentation', async () => {
			const codeDoc = `
Function: calculateTotal

Description: Calculates the total price including tax and discounts.

Parameters:
- price (number): The base price of the item
- quantity (number): The number of items
- taxRate (number): The tax rate as a decimal (e.g., 0.1 for 10%)
- discount (number): The discount amount (optional)

Returns: number - The final total price

Example Usage:
const total = calculateTotal(100, 2, 0.08, 10);
console.log(total); // Output: 206

Implementation Notes:
- Tax is applied after discount
- Negative quantities return 0
- Tax rate must be between 0 and 1
			`.trim();

			const result = await langbase.chunk({
				content: codeDoc,
				chunkMaxLength: 1300,
				chunkOverlap: 300,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunk() - Edge Cases', () => {
		it('should handle text with special characters', async () => {
			const specialText = 'Text with special chars: @#$%^&*() and unicode: 你好世界 🌟✨🎉 '.repeat(50);

			const result = await langbase.chunk({
				content: specialText,
				chunkMaxLength: 1500,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should handle text with newlines and formatting', async () => {
			const formattedText = `
Line 1
Line 2

Paragraph 1

Paragraph 2
			`.repeat(20);

			const result = await langbase.chunk({
				content: formattedText,
				chunkMaxLength: 1400,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);

		it('should handle very long single word', async () => {
			const longWord = 'A' + 'a'.repeat(2000) + 'Z';

			const result = await langbase.chunk({
				content: longWord,
				chunkMaxLength: 3000,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 30000);
	});

	describe('chunk() - Response Validation', () => {
		it('should return array of strings', async () => {
			const text = 'Validation test content. '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 1500,
			});

			expect(Array.isArray(result)).toBe(true);
			result.forEach(chunk => {
				expect(typeof chunk).toBe('string');
			});
		}, 30000);

		it('should return non-empty chunks', async () => {
			const text = 'Non-empty chunk test. '.repeat(100);

			const result = await langbase.chunk({
				content: text,
				chunkMaxLength: 1400,
			});

			result.forEach(chunk => {
				expect(chunk.length).toBeGreaterThan(0);
			});
		}, 30000);
	});
});
