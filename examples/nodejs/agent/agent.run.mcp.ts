import 'dotenv/config';
import { Langbase } from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {

	const response = await langbase.agent.run({
		stream: false,
		mcp_servers: [
			{
                type: 'url',
                name: 'deepwiki',
				url: 'https://mcp.deepwiki.com/sse',
			},
		],
		model: 'openai:gpt-4.1-mini',
		apiKey: process.env.LLM_API_KEY!,
        instructions: 'You are a helpful assistant that help users summarize text.',
		input: [
			{
				role: 'user',
				content: 'What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?',
			},
		],
	});

	console.log('response: ', response.output);
}

main();

