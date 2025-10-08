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
			prompt: "A futuristic cityscape with flying cars and neon lights, cyberpunk style, highly detailed, 8k resolution",
			model: "google:gemini-2.5-flash-image-preview",
			apiKey: process.env.GOOGLE_API_KEY!
		});

		console.log('✅ Image generated successfully!');
		console.log('Generated images:', result);
		
	} catch (error) {
		console.error('❌ Error generating image:', error);
	}
}

main();