// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.
import 'dotenv/config';
import {Langbase} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const results = await langbase.chunker({
		content: `Langbase is the most powerful serverless AI platform for building AI agents with memory.
Build, deploy, and scale AI agents with tools and memory (RAG). Simple AI primitives with a world-class developer experience without using any frameworks.

Compared to complex AI frameworks, Langbase is serverless and the first composable AI platform.

Build AI agents without any bloated frameworks. You write the logic, we handle the logistics.

Start by building simple AI agents (pipes)
Then train serverless semantic Memory agents (RAG) to get accurate and trusted results
Langbase provides several options to get started:

AI Studio: Build, collaborate, and deploy AI Agents with tools and Memory (RAG).
Langbase SDK: Easiest wasy to build AI Agents with TypeScript. (recommended)
HTTP API: Build AI agents with any language (Python, Go, PHP, etc.).
or BaseAI.dev: Local-first, open-source web AI framework.`,
		chunkOverlap: 256,
		chunkMaxLength: 1024,
	});

	console.log(results);
}

main();
