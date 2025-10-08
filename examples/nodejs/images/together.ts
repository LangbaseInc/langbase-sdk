import 'dotenv/config';
import {Langbase} from 'langbase';

async function main() {
	// Check if API keys are available
	if (!process.env.LANGBASE_API_KEY) {
		console.error('❌ LANGBASE_API_KEY is not set in environment variables');
		return;
	}
	
	if (!process.env.GOOGLE_API_KEY) {
		console.error('❌ GOOGLE_API_KEY is not set in environment variables');
		console.log('Please add your Google API key to the .env file');
		return;
	}

	const langbase = new Langbase({
		apiKey: process.env.LANGBASE_API_KEY!
	});

	try {
		const result = await langbase.images.generate({
			prompt: "A serene mountain landscape at sunset with a crystal clear lake reflecting the sky",
			model: "together:black-forest-labs/FLUX.1-schnell-Free",
			width: 1024,
			height: 1024,
			n: 1,
			apiKey: process.env.TOGETHER_API_KEY!,
		});

		if (!result?.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
			console.error('❌ Image generation did not return an image. Full response:', result);
			return;
		}

		console.log(result);
	} catch (error) {
		console.error('❌ Error generating image:', error);
	}
}

main();