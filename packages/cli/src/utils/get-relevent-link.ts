import {
	extractDocBlocks,
	extractDocMetadata,
	getRelevanceScore
} from './get-score';

/**
 * Main search function to find relevant documentation based on a query
 * Returns the url of the most relevant documentation
 *
 * @param docs - The complete documentation text
 * @param query - The search query
 * @returns Array of top 5 relevant document objects
 */
export const findRelevantLink = (docs: string, query: string) => {
	// Get top 5 results
	const searchResults = searchDocs(docs, query, 5);
	const hasNoResults = searchResults.length === 0;
	if (hasNoResults) {
		return 'docs/sdk';
	}

	const url = searchResults[0].url?.split('/docs/')[1];
	return url;
};

/**
 * Searches through documentation blocks to find relevant matches for a query
 *
 * @param docs - The complete documentation text containing multiple doc blocks
 * @param query - The search query
 * @param maxResults - Maximum number of results to return
 * @returns Array of relevant docs with their scores, titles and URLs
 */
export const searchDocs = (docs: string, query: string, maxResults: number) => {
	// Extract all document blocks safely
	const docBlocks = extractDocBlocks(docs);
	// Score each document block
	const scoredDocs = docBlocks.map(docBlock => {
		// Extract metadata
		const metadata = extractDocMetadata(docBlock);

		// Calculate scores for title and content separately
		let titleScore = 0;
		const isTitleNoEmpty = metadata.title != '';

		if (isTitleNoEmpty) {
			titleScore = getRelevanceScore(metadata.title, query, true);
		} else {
			titleScore = 0;
		}

		// Extract content from the doc block, handling potential code blocks with backticks
		const contentMatch = /<content>([\s\S]*?)<\/content>/i.exec(docBlock);
		let content = '';

		if (contentMatch) {
			content = contentMatch[1].trim();
		} else {
			content = '';
		}

		const contentScore = getRelevanceScore(content, query, false);
		// Combined score with title weighted more heavily
		const totalScore = titleScore + contentScore;

		return {
			score: totalScore,
			title: metadata.title || 'Untitled Document',
			url: metadata.url || null
		};
	});

	// Sort by score (descending) and filter out irrelevant results
	const filteredDocs = scoredDocs
		.filter(doc => doc.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults);
	return filteredDocs;
};
