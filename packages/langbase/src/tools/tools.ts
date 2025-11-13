import {Request} from '../common/request';
import {ToolWebSearchOptions, ToolWebSearchResponse, ToolCrawlOptions, ToolCrawlResponse} from './types';

/**
 * Performs a web search using the Langbase API.
 *
 * @param request - The Request instance for making API calls
 * @param options - Web search configuration options
 * @param options.query - The search query string
 * @param options.service - The search service to use (currently 'exa')
 * @param options.totalResults - Optional number of results to return
 * @param options.domains - Optional array of domains to search within
 * @param options.apiKey - API key for web search authentication
 * @returns Promise that resolves to an array of web search results
 */
export async function webSearch(
	request: Request,
	options: ToolWebSearchOptions,
): Promise<ToolWebSearchResponse[]> {
	return request.post({
		endpoint: '/v1/tools/web-search',
		body: options,
		headers: {
			'LB-WEB-SEARCH-KEY': options.apiKey,
		},
	});
}

/**
 * Performs a web crawl on target websites using the Langbase API.
 *
 * @param request - The Request instance for making API calls
 * @param options - Crawl configuration options
 * @param options.url - Array of URLs to crawl
 * @param options.maxPages - Optional maximum number of pages to crawl
 * @param options.apiKey - API key for crawl authentication
 * @param options.service - Optional crawl service to use ('spider' or 'firecrawl')
 * @returns An array of responses containing data from the crawl operation.
 */
export async function webCrawl(
	request: Request,
	options: ToolCrawlOptions,
): Promise<ToolCrawlResponse[]> {
	return request.post({
		endpoint: '/v1/tools/crawl',
		body: options,
		headers: {
			'LB-CRAWL-KEY': options.apiKey,
		},
	});
}
