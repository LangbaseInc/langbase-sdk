import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from '../langbase';

describe('Langbase Images API - langbase.images.*', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('images.generate() - OpenAI', () => {
		it('should successfully generate image with OpenAI model', async () => {
			const result = await langbase.images.generate({
				prompt: 'A serene mountain landscape at sunset',
				model: 'openai:gpt-image-1',
			});

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('provider');
			expect(result).toHaveProperty('model');
			expect(result).toHaveProperty('object');
			expect(result).toHaveProperty('created');
			expect(result).toHaveProperty('choices');
			expect(Array.isArray(result.choices)).toBe(true);
			expect(result.choices.length).toBeGreaterThan(0);
			expect(result).toHaveProperty('usage');

			// Check that the choice contains image data
			if (result.choices.length > 0) {
				const choice = result.choices[0];
				expect(choice).toHaveProperty('index');
				// Image data should be present in some form
			}
		}, 60000);

		it('should successfully generate image with custom dimensions', async () => {
			const result = await langbase.images.generate({
				prompt: 'A futuristic cityscape',
				model: 'openai:gpt-image-1',
				width: 1024,
				height: 1024,
			});

			expect(result).toHaveProperty('choices');
			expect(result.choices.length).toBeGreaterThan(0);
		}, 60000);

		it('should successfully generate multiple images', async () => {
			const result = await langbase.images.generate({
				prompt: 'A cute cat playing with yarn',
				model: 'openai:gpt-image-1',
				n: 2,
			});

			expect(result).toHaveProperty('choices');
			expect(result.choices.length).toBe(2);
		}, 60000);
	});

	describe('images.generate() - Together AI (FLUX)', () => {
		it('should successfully generate image with FLUX model', async () => {
			const result = await langbase.images.generate({
				prompt: 'A vibrant abstract art piece with geometric shapes',
				model: 'together:black-forest-labs/FLUX.1-schnell-Free',
			});

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('model');
			expect(result).toHaveProperty('choices');
			expect(result.choices.length).toBeGreaterThan(0);
		}, 60000);

		it('should successfully generate image with custom width and height for FLUX', async () => {
			const result = await langbase.images.generate({
				prompt: 'A peaceful zen garden',
				model: 'together:black-forest-labs/FLUX.1-schnell-Free',
				width: 1024,
				height: 768,
			});

			expect(result).toHaveProperty('choices');
		}, 60000);

		it('should successfully generate with custom steps parameter', async () => {
			const result = await langbase.images.generate({
				prompt: 'A detailed digital painting of a dragon',
				model: 'together:black-forest-labs/FLUX.1-schnell-Free',
				steps: 4,
			});

			expect(result).toHaveProperty('choices');
		}, 60000);
	});

	describe('images.generate() - Google Gemini', () => {
		it('should successfully generate image with Gemini model', async () => {
			const result = await langbase.images.generate({
				prompt: 'A modern minimalist living room interior',
				model: 'google:gemini-2.5-flash-image-preview',
			});

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('model');
			expect(result).toHaveProperty('choices');
			expect(result.choices.length).toBeGreaterThan(0);
		}, 60000);

		it('should successfully generate with custom dimensions for Gemini', async () => {
			const result = await langbase.images.generate({
				prompt: 'A sunset over the ocean',
				model: 'google:gemini-2.5-flash-image-preview',
				width: 512,
				height: 512,
			});

			expect(result).toHaveProperty('choices');
		}, 60000);
	});

	describe('images.generate() - Image-to-Image', () => {
		it('should successfully perform image-to-image transformation', async () => {
			// Note: This requires a base image URL
			// Skip if not applicable for the model
			const result = await langbase.images.generate({
				prompt: 'Transform this into a watercolor painting',
				model: 'openai:gpt-image-1',
				image_url: 'https://example.com/sample-image.jpg', // Replace with actual image URL
			});

			expect(result).toHaveProperty('choices');
		}, 60000);
	});

	describe('images.generate() - Prompt variations', () => {
		it('should handle simple prompts', async () => {
			const result = await langbase.images.generate({
				prompt: 'Cat',
				model: 'openai:gpt-image-1',
			});

			expect(result).toHaveProperty('choices');
		}, 60000);

		it('should handle detailed prompts', async () => {
			const result = await langbase.images.generate({
				prompt: 'A photorealistic portrait of a woman with long flowing hair, standing in a field of sunflowers during golden hour, cinematic lighting, highly detailed, 8k resolution',
				model: 'openai:gpt-image-1',
			});

			expect(result).toHaveProperty('choices');
		}, 60000);

		it('should handle abstract prompts', async () => {
			const result = await langbase.images.generate({
				prompt: 'Abstract representation of joy and happiness',
				model: 'together:black-forest-labs/FLUX.1-schnell-Free',
			});

			expect(result).toHaveProperty('choices');
		}, 60000);

		it('should handle technical prompts', async () => {
			const result = await langbase.images.generate({
				prompt: 'Technical blueprint of a futuristic spacecraft, detailed schematics, engineering drawing style',
				model: 'openai:gpt-image-1',
			});

			expect(result).toHaveProperty('choices');
		}, 60000);
	});

	describe('images.generate() - Usage tracking', () => {
		it('should include usage information in response', async () => {
			const result = await langbase.images.generate({
				prompt: 'A simple test image',
				model: 'openai:gpt-image-1',
			});

			expect(result).toHaveProperty('usage');
			expect(result.usage).toBeDefined();
		}, 60000);
	});

	describe('images.generate() - Response structure validation', () => {
		it('should return properly structured response', async () => {
			const result = await langbase.images.generate({
				prompt: 'Test image',
				model: 'openai:gpt-image-1',
			});

			// Validate complete response structure
			expect(result).toHaveProperty('id');
			expect(typeof result.id).toBe('string');

			expect(result).toHaveProperty('provider');
			expect(typeof result.provider).toBe('string');

			expect(result).toHaveProperty('model');
			expect(typeof result.model).toBe('string');

			expect(result).toHaveProperty('object');
			expect(typeof result.object).toBe('string');

			expect(result).toHaveProperty('created');
			expect(typeof result.created).toBe('number');

			expect(result).toHaveProperty('choices');
			expect(Array.isArray(result.choices)).toBe(true);

			expect(result).toHaveProperty('usage');
			expect(typeof result.usage).toBe('object');
		}, 60000);
	});
});
