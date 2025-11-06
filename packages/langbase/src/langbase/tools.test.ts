import {beforeEach, describe, expect, it} from 'vitest';
import {Langbase} from './langbase';

describe('Langbase Tools API - langbase.tools.*', () => {
	let langbase: Langbase;
	const apiKey = process.env.LANGBASE_API_KEY || '';

	beforeEach(() => {
		langbase = new Langbase({apiKey});
	});

	describe('tools.crawl()', () => {
		it('should successfully crawl a single webpage using Spider', async () => {
			// Note: This test requires a Spider API key to be set
			// Skip if not available
			const spiderKey = process.env.SPIDER_API_KEY;
			if (!spiderKey) {
				console.log('Skipping Spider crawl test - no SPIDER_API_KEY set');
				return;
			}

			const result = await langbase.tools.crawl({
				url: ['https://example.com'],
				maxPages: 1,
				service: 'spider',
				apiKey: spiderKey,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			if (result.length > 0) {
				expect(result[0]).toHaveProperty('url');
				expect(result[0]).toHaveProperty('content');
				expect(typeof result[0].url).toBe('string');
				expect(typeof result[0].content).toBe('string');
			}
		}, 60000);

		it('should successfully crawl multiple pages using Spider', async () => {
			const spiderKey = process.env.SPIDER_API_KEY;
			if (!spiderKey) {
				console.log('Skipping Spider multi-page crawl test - no SPIDER_API_KEY set');
				return;
			}

			const result = await langbase.tools.crawl({
				url: ['https://example.com'],
				maxPages: 3,
				service: 'spider',
				apiKey: spiderKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);

		it('should successfully crawl using Firecrawl', async () => {
			const firecrawlKey = process.env.FIRECRAWL_API_KEY;
			if (!firecrawlKey) {
				console.log('Skipping Firecrawl test - no FIRECRAWL_API_KEY set');
				return;
			}

			const result = await langbase.tools.crawl({
				url: ['https://example.com'],
				maxPages: 1,
				service: 'firecrawl',
				apiKey: firecrawlKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);

		it('should handle multiple URLs with Spider', async () => {
			const spiderKey = process.env.SPIDER_API_KEY;
			if (!spiderKey) {
				console.log('Skipping Spider multiple URLs test - no SPIDER_API_KEY set');
				return;
			}

			const result = await langbase.tools.crawl({
				url: ['https://example.com', 'https://example.org'],
				maxPages: 1,
				service: 'spider',
				apiKey: spiderKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);
	});

	describe('tools.webSearch()', () => {
		it('should successfully perform web search using Exa', async () => {
			// Note: This test requires an Exa API key
			const exaKey = process.env.EXA_API_KEY;
			if (!exaKey) {
				console.log('Skipping Exa web search test - no EXA_API_KEY set');
				return;
			}

			const result = await langbase.tools.webSearch({
				query: 'Latest developments in artificial intelligence',
				service: 'exa',
				totalResults: 5,
				apiKey: exaKey,
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			if (result.length > 0) {
				expect(result[0]).toHaveProperty('url');
				expect(result[0]).toHaveProperty('content');
				expect(typeof result[0].url).toBe('string');
				expect(typeof result[0].content).toBe('string');
			}
		}, 60000);

		it('should successfully search with domain filters', async () => {
			const exaKey = process.env.EXA_API_KEY;
			if (!exaKey) {
				console.log('Skipping Exa domain filter test - no EXA_API_KEY set');
				return;
			}

			const result = await langbase.tools.webSearch({
				query: 'machine learning tutorials',
				service: 'exa',
				totalResults: 3,
				domains: ['github.com', 'medium.com'],
				apiKey: exaKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);

		it('should handle different result limits', async () => {
			const exaKey = process.env.EXA_API_KEY;
			if (!exaKey) {
				console.log('Skipping Exa result limit test - no EXA_API_KEY set');
				return;
			}

			const result = await langbase.tools.webSearch({
				query: 'cloud computing',
				service: 'exa',
				totalResults: 10,
				apiKey: exaKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);
	});

	describe('deprecated tool.* methods (backwards compatibility)', () => {
		it('should work with deprecated tool.crawl() method', async () => {
			const spiderKey = process.env.SPIDER_API_KEY;
			if (!spiderKey) {
				console.log('Skipping deprecated crawl test - no SPIDER_API_KEY set');
				return;
			}

			const result = await langbase.tool.crawl({
				url: ['https://example.com'],
				maxPages: 1,
				service: 'spider',
				apiKey: spiderKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);

		it('should work with deprecated tool.webSearch() method', async () => {
			const exaKey = process.env.EXA_API_KEY;
			if (!exaKey) {
				console.log('Skipping deprecated webSearch test - no EXA_API_KEY set');
				return;
			}

			const result = await langbase.tool.webSearch({
				query: 'test query',
				service: 'exa',
				totalResults: 3,
				apiKey: exaKey,
			});

			expect(Array.isArray(result)).toBe(true);
		}, 60000);
	});
});
