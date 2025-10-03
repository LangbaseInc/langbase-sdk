import 'dotenv/config';
import {Langbase} from 'langbase';

async function main() {
	// Check if API keys are available
	if (!process.env.LANGBASE_API_KEY) {
		console.error('❌ LANGBASE_API_KEY is not set in environment variables');
		return;
	}
	
	if (!process.env.OPENROUTER_API_KEY) {
		console.error('❌ OPENROUTER_API_KEY is not set in environment variables');
		console.log('Please add your OpenRouter API key to the .env file');
		return;
	}

	const langbase = new Langbase({
		apiKey: process.env.LANGBASE_API_KEY!,
	});
	
	try {
		const result = await langbase.images.generate({
			prompt: "A majestic dragon soaring through clouds above a fantasy castle, epic fantasy art style, detailed scales and wings",
			model: "openrouter:google/gemini-2.5-flash-image-preview",
			apiKey: process.env.OPENROUTER_API_KEY
		});

		console.log('✅ Image generated successfully via OpenRouter!');
		console.log('Generated images:', result);
		
	} catch (error) {
		console.error('❌ Error generating image:', error);
		console.log('Note: Make sure you have a valid OpenRouter API key and credits');
	}
}

main();