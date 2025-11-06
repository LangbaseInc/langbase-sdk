import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Embed API - langbase.embed()', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('embed() - Single Chunk', () => {
		it('should successfully generate embeddings for a single chunk with default model', async () => {
			const result = await langbase.embed({
				chunks: ['This is a test sentence for embedding generation.'],
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(1);
			expect(Array.isArray(result[0])).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);

			// Verify all values are numbers
			result[0].forEach(value => {
				expect(typeof value).toBe('number');
				expect(isFinite(value)).toBe(true);
			});
		}, 30000);

		it('should generate embeddings for a short sentence', async () => {
			const result = await langbase.embed({
				chunks: ['Hello world'],
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(1);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for a long paragraph', async () => {
			const longText = `
Artificial intelligence has revolutionized the way we interact with technology.
From voice assistants to recommendation systems, AI is embedded in our daily lives.
Machine learning algorithms process vast amounts of data to identify patterns and make predictions.
The future of AI holds immense potential for solving complex problems across various domains.
			`.trim();

			const result = await langbase.embed({
				chunks: [longText],
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);
	});

	describe('embed() - Multiple Chunks', () => {
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
				embedding.forEach(value => {
					expect(typeof value).toBe('number');
				});
			});
		}, 30000);

		it('should generate embeddings for 5 different chunks', async () => {
			const chunks = [
				'Natural language processing enables computers to understand text.',
				'Computer vision allows machines to interpret images.',
				'Robotics combines AI with physical systems.',
				'Reinforcement learning trains agents through trial and error.',
				'Generative AI creates new content based on patterns.',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(result.length).toBe(5);
			result.forEach(embedding => {
				expect(embedding.length).toBeGreaterThan(0);
			});
		}, 30000);

		it('should generate embeddings for 10 chunks', async () => {
			const chunks = Array.from(
				{length: 10},
				(_, i) => `This is test sentence number ${i + 1} for embedding generation.`,
			);

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(result.length).toBe(10);
		}, 30000);

		it('should handle maximum allowed chunks (100)', async () => {
			const chunks = Array.from(
				{length: 100},
				(_, i) => `Chunk number ${i + 1} for testing maximum chunk limit.`,
			);

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(100);
		}, 60000);
	});

	describe('embed() - Different Embedding Models', () => {
		it('should generate embeddings with OpenAI text-embedding-3-large', async () => {
			const result = await langbase.embed({
				chunks: ['Testing OpenAI embedding model'],
				embeddingModel: 'openai:text-embedding-3-large',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
			// OpenAI text-embedding-3-large produces 3072-dimensional embeddings
			expect(result[0].length).toBeGreaterThan(1000);
		}, 30000);

		it('should generate embeddings with Cohere embed-v4.0', async () => {
			const result = await langbase.embed({
				chunks: ['Testing Cohere embedding model'],
				embeddingModel: 'cohere:embed-v4.0',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings with Cohere embed-multilingual-v3.0', async () => {
			const result = await langbase.embed({
				chunks: ['Testing multilingual embedding model'],
				embeddingModel: 'cohere:embed-multilingual-v3.0',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings with Cohere embed-multilingual-light-v3.0', async () => {
			const result = await langbase.embed({
				chunks: ['Testing light multilingual model'],
				embeddingModel: 'cohere:embed-multilingual-light-v3.0',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings with Google text-embedding-004', async () => {
			const result = await langbase.embed({
				chunks: ['Testing Google embedding model'],
				embeddingModel: 'google:text-embedding-004',
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);
	});

	describe('embed() - Multilingual Content', () => {
		it('should generate embeddings for English text', async () => {
			const result = await langbase.embed({
				chunks: ['This is an English sentence.'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for Chinese text', async () => {
			const result = await langbase.embed({
				chunks: ['这是一个中文句子'],
				embeddingModel: 'cohere:embed-multilingual-v3.0',
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for Spanish text', async () => {
			const result = await langbase.embed({
				chunks: ['Esta es una oración en español'],
				embeddingModel: 'cohere:embed-multilingual-v3.0',
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for French text', async () => {
			const result = await langbase.embed({
				chunks: ['Ceci est une phrase en français'],
				embeddingModel: 'cohere:embed-multilingual-v3.0',
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for mixed language content', async () => {
			const chunks = [
				'Hello world in English',
				'Hola mundo en español',
				'你好世界 in Chinese',
			];

			const result = await langbase.embed({
				chunks: chunks,
				embeddingModel: 'cohere:embed-multilingual-v3.0',
			});

			expect(result.length).toBe(3);
		}, 30000);
	});

	describe('embed() - Semantic Similarity', () => {
		it('should produce similar embeddings for semantically similar texts', async () => {
			const chunks = [
				'The cat sat on the mat',
				'A feline was sitting on a rug',
				'The sky is blue',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			// Calculate cosine similarity between first two (similar) and first & third (dissimilar)
			const cosineSimilarity = (a: number[], b: number[]) => {
				const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
				const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
				const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
				return dotProduct / (magnitudeA * magnitudeB);
			};

			const similaritySimilar = cosineSimilarity(result[0], result[1]);
			const similarityDifferent = cosineSimilarity(result[0], result[2]);

			// Similar texts should have higher similarity than different texts
			expect(similaritySimilar).toBeGreaterThan(similarityDifferent);
		}, 30000);
	});

	describe('embed() - Different Content Types', () => {
		it('should generate embeddings for technical content', async () => {
			const result = await langbase.embed({
				chunks: [
					'const sum = (a, b) => a + b; function multiply(x, y) { return x * y; }',
				],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should generate embeddings for questions', async () => {
			const chunks = [
				'What is machine learning?',
				'How does neural network work?',
				'Why is AI important?',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(result.length).toBe(3);
		}, 30000);

		it('should generate embeddings for conversational text', async () => {
			const chunks = [
				'User: Hello, how can I help you?',
				'Assistant: I can assist with various tasks.',
				'User: Thank you for your help!',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(result.length).toBe(3);
		}, 30000);

		it('should generate embeddings for structured data', async () => {
			const result = await langbase.embed({
				chunks: [
					'Product: Laptop, Price: $999, Category: Electronics',
				],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);
	});

	describe('embed() - Varying Text Lengths', () => {
		it('should handle very short text', async () => {
			const result = await langbase.embed({
				chunks: ['AI'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle medium length text', async () => {
			const mediumText = 'Machine learning is a method of data analysis that automates analytical model building.';

			const result = await langbase.embed({
				chunks: [mediumText],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle long text (near character limit)', async () => {
			// Create text with around 8000 characters
			const longText = 'A'.repeat(7500) + ' This is the end of a long text.';

			const result = await langbase.embed({
				chunks: [longText],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle chunks with varying lengths', async () => {
			const chunks = [
				'Short',
				'This is a medium length sentence for testing purposes.',
				'This is a much longer text that contains more information and provides additional context for the embedding model to process and generate meaningful vector representations from.',
			];

			const result = await langbase.embed({
				chunks: chunks,
			});

			expect(result.length).toBe(3);
			result.forEach(embedding => {
				expect(embedding.length).toBeGreaterThan(0);
			});
		}, 30000);
	});

	describe('embed() - Special Characters and Formatting', () => {
		it('should handle text with special characters', async () => {
			const result = await langbase.embed({
				chunks: ['Text with special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle text with emojis', async () => {
			const result = await langbase.embed({
				chunks: ['Happy day! 😊🌟✨ Great news! 🎉🎊'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle text with line breaks', async () => {
			const result = await langbase.embed({
				chunks: ['Line one\nLine two\nLine three'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);

		it('should handle text with tabs', async () => {
			const result = await langbase.embed({
				chunks: ['Column1\tColumn2\tColumn3'],
			});

			expect(result[0].length).toBeGreaterThan(0);
		}, 30000);
	});

	describe('embed() - Response Validation', () => {
		it('should return 2D array structure', async () => {
			const result = await langbase.embed({
				chunks: ['Test 1', 'Test 2'],
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
			expect(Array.isArray(result[0])).toBe(true);
			expect(Array.isArray(result[1])).toBe(true);
		}, 30000);

		it('should return consistent embedding dimensions for same model', async () => {
			const result = await langbase.embed({
				chunks: ['First text', 'Second text', 'Third text'],
				embeddingModel: 'openai:text-embedding-3-large',
			});

			const firstDim = result[0].length;
			result.forEach(embedding => {
				expect(embedding.length).toBe(firstDim);
			});
		}, 30000);

		it('should return finite number values', async () => {
			const result = await langbase.embed({
				chunks: ['Test embedding values'],
			});

			result[0].forEach(value => {
				expect(typeof value).toBe('number');
				expect(isFinite(value)).toBe(true);
				expect(isNaN(value)).toBe(false);
			});
		}, 30000);
	});

	describe('embed() - Real-world Use Cases', () => {
		it('should embed product descriptions for search', async () => {
			const products = [
				'Wireless Bluetooth Headphones with noise cancellation',
				'Smart Watch with fitness tracking and heart rate monitor',
				'Laptop computer with 16GB RAM and SSD storage',
			];

			const result = await langbase.embed({
				chunks: products,
			});

			expect(result.length).toBe(3);
		}, 30000);

		it('should embed customer reviews for sentiment analysis', async () => {
			const reviews = [
				'Great product! Highly recommend.',
				'Terrible quality, waste of money.',
				'Average product, nothing special.',
			];

			const result = await langbase.embed({
				chunks: reviews,
			});

			expect(result.length).toBe(3);
		}, 30000);

		it('should embed FAQ questions for similarity matching', async () => {
			const faqs = [
				'How do I reset my password?',
				'What is your refund policy?',
				'How long does shipping take?',
				'Can I cancel my order?',
			];

			const result = await langbase.embed({
				chunks: faqs,
			});

			expect(result.length).toBe(4);
		}, 30000);

		it('should embed document sections for retrieval', async () => {
			const sections = [
				'Introduction: Overview of artificial intelligence and its applications.',
				'Machine Learning: Algorithms that learn from data patterns.',
				'Deep Learning: Neural networks with multiple layers for complex tasks.',
			];

			const result = await langbase.embed({
				chunks: sections,
			});

			expect(result.length).toBe(3);
		}, 30000);
	});
});
