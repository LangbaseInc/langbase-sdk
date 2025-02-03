import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

/**
 * Generates embeddings for the given text chunks.
 */
async function main() {
	const response = await langbase.embed({
		chunks: [
			'Langbase is the most powerful serverless platform for building AI agents with memory. Build, scale, and evaluate AI agents with semantic memory (RAG) and world-class developer experience. We process billions of AI messages/tokens daily. Built for every developer, not just AI/ML experts.',
		],
		embeddingModel: 'openai:text-embedding-3-large',
	});

	console.log(response);
}

main();
