import 'dotenv/config';
import {Langbase} from '../../../packages/langbase/src/langbase/langbase';

async function main() {
	// Check if API keys are available
	if (!process.env.LANGBASE_API_KEY) {
		console.error('❌ LANGBASE_API_KEY is not set in environment variables');
		return;
	}
	
	if (!process.env.OPENAI_API_KEY) {
		console.error('❌ OPENAI_API_KEY is not set in environment variables');
		console.log('Please add your OpenAI API key to the .env file');
		return;
	}

	const langbase = new Langbase({
		apiKey: process.env.LANGBASE_API_KEY!
	});
	
	try {
		const result = await langbase.images.generate({
			prompt: "A futuristic cityscape with flying cars and neon lights, cyberpunk style, highly detailed, 8k resolution",
			model: "openai:gpt-image-1",
			apiKey: process.env.OPENAI_API_KEY!
		});

		console.log('✅ Image generated successfully!');
		console.log('Generated images:', result);
		
	} catch (error) {
		console.error('❌ Error generating image:', error);
	}
}

main();