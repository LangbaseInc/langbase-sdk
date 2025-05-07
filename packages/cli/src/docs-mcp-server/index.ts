import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fetchDocsList, fetchDocsPost, fetchSdKDocsList } from './docs';
import { findRelevantLink } from '@/utils/get-relevent-link';

export async function docsMcpServer() {
	const server = new McpServer({
		name: 'langbase-docs-server',
		version: '0.1.0'
	});

	server.tool(
		'docs-route-finder',
		"Searches through all available documentation routes and returns relevant paths based on the user's query. This tool helps navigate the documentation by finding the most appropriate sections that match the search criteria.",
		{
			query: z.string()
				.describe(`A refined search term extracted from the user's question.
            For example, if user asks 'How do I create a pipe?', the query would be 'SDK Pipe'.
            This should be the specific concept or topic to search for in the documentation.
            Treat keyword add as create if user ask for Eg. 'How do I add memory to pipe?' the query should be 'create memory'`)
		},
		async ({ query }) => {
			const docs = await fetchDocsList();
			// search through the docs and return the most relevent path based on the query
			const url = findRelevantLink(docs, query);
			if (!url) {
				return {
					content: [
						{
							type: 'text',
							text:
								'No relevant documentation found for the query: ' +
								query
						}
					]
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: `This is the most relevant documentation for the query: ${url}`
					}
				]
			};
		}
	);

	server.tool(
		'sdk-route-finder',
		"Searches through all available SDK documentation routes and returns relevant paths based on the user's query. This tool helps navigate the documentation by finding the most appropriate sections that match the search criteria.",
		{
			query: z.string()
				.describe(`A refined search term extracted from the user's question.
            For example, if user asks 'How do I create a pipe?', the query would be 'SDK Pipe'.
            This should be the specific concept or topic to search for in the documentation.
            Treat keyword add as create if user ask for Eg. 'How do I add memory to pipe?' the query should be 'create memory'`)
		},
		async ({ query }) => {
			const docs = await fetchSdKDocsList();
			const url = findRelevantLink(docs, query);

			if (!url) {
				return {
					content: [
						{
							type: 'text',
							text:
								'No relevant documentation found for the query: ' +
								query
						}
					]
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: `This is the most relevant documentation for the query: ${url}`
					}
				]
			};
		}
	);

	server.tool(
		'sdk-docs-tool',
		'Always First Use sdk-route-finder to find the most relevant documentation and then use this tool to fetch the detailed documentation.Fetches detailed SDK documentation, specializing in implementation guides for core features like pipes, memory, and tools. This is the primary source for the latest SDK documentation and should be consulted first for questions about creating or implementing SDK components. Use this tool for detailed step-by-step instructions on building pipes, configuring memory systems, and developing custom tools.',
		{
			url: z
				.string()
				.describe(
					'URL of a specific SDK page to fetch. Format: /sdk/...'
				)
		},
		async ({ url }) => {
			const content = await fetchDocsPost(
				`https://langbase.com/docs${url}`
			);
			return {
				content: [
					{
						type: 'text',
						text: content
					}
				]
			};
		}
	);

	server.tool(
		'examples-tool',
		'Always first use docs-route-finder to find the most relevant documentation and then use this tool to fetch the detailed documentation. Fetches code examples and sample implementations from the documentation. Use this tool when users specifically request examples, sample code, or implementation demonstrations. This tool provides practical code snippets and complete working examples that demonstrate how to implement various features.',
		{
			url: z
				.string()
				.describe(
					'URL of a specific examples page to fetch. Format: /examples/...'
				)
		},
		async ({ url }) => {
			const content = await fetchDocsPost(
				`https://langbase.com/docs${url}`
			);
			return {
				content: [
					{
						type: 'text',
						text: content
					}
				]
			};
		}
	);

	server.tool(
		'guide-tool',
		'Always first use docs-route-finder to find the most relevant documentation and then use this tool to fetch the detailed documentation. Fetches detailed guides and tutorials from the documentation. Use this tool when users explicitly request guides, tutorials, or how-to content. This tool provides step-by-step instructions and practical examples for implementing various features.',
		{
			url: z
				.string()
				.describe(
					'URL of a specific guide page to fetch. Format: /guides/...'
				)
		},
		async ({ url }) => {
			const content = await fetchDocsPost(
				`https://langbase.com/docs${url}`
			);
			return {
				content: [
					{
						type: 'text',
						text: content
					}
				]
			};
		}
	);

	server.tool(
		'api-reference-tool',
		'Always first use docs-route-finder to find the most relevant documentation and then use this tool to fetch the detailed documentation. Fetches API reference documentation. Use this tool ONLY when the user explicitly asks about API endpoints, REST API calls, or programmatically creating/updating/deleting resources (like pipes, memory, etc.) through the API interface. For general SDK implementation questions, use the sdk-documentation-fetcher instead.',
		{
			url: z
				.string()
				.describe(
					'URL of a specific api-reference page to fetch. Format: /api-reference/...'
				)
		},
		async ({ url }) => {
			const content = await fetchDocsPost(
				`https://langbase.com/docs${url}`
			);
			return {
				content: [
					{
						type: 'text',
						text: content
					}
				]
			};
		}
	);

	async function main() {
		const transport = new StdioServerTransport();

		try {
			await server.connect(transport);
		} catch (error) {
			console.error('Error connecting to transport:', error);
			process.exit(1);
		}
	}

	main().catch(error => {
		console.error('Something went wrong:', error);
		process.exit(1);
	});
}
