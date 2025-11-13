import {Request} from '../common/request';

export interface ImageGenerationOptions {
	prompt: string;
	model: string;
	width?: number;
	height?: number;
	image_url?: string;
	steps?: number;
	n?: number;
	negative_prompt?: string;
	apiKey: string;
	[key: string]: any;
}

export interface ImageGenerationResponse {
	id: string;
	provider: string;
	model: string;
	object: string;
	created: number;
	choices: Array<{
		logprobs: null;
		finish_reason: string;
		native_finish_reason: string;
		index: number;
		message: {
			role: string;
			content: string | null;
			images: Array<{
				type: string;
				image_url: {
					url: string;
				};
				index: number;
			}>;
		};
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
		prompt_tokens_details: {
			cached_tokens: number;
		};
		completion_tokens_details: {
			reasoning_tokens: number;
			image_tokens: number;
		};
	};
}

export class Images {
	private request: Request;

	constructor(request: Request) {
		this.request = request;
	}

	/**
	 * Generate images using various AI providers
	 *
	 * @param options - Image generation options
	 * @returns Promise that resolves to the image generation response
	 */
	async generate(
		options: ImageGenerationOptions,
	): Promise<ImageGenerationResponse> {
		// Comprehensive input validation
		if (!options) {
			throw new Error('Image generation options are required.');
		}

		// Extract apiKey from options for headers, remove from body
		const {apiKey, ...imageParams} = options;

		try {
			return await this.request.post<ImageGenerationResponse>({
				endpoint: '/v1/images',
				body: imageParams,
				headers: {
					'LB-LLM-Key': apiKey,
				},
			});
		} catch (error: any) {
			console.error(error);
			throw new Error(error.message);
		}
	}
}
