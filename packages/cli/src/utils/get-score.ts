/**
 * Calculates a relevance score between a line of text and a search query.
 *
 * The scoring algorithm works as follows:
 * - If the entire search query is found within the line, returns a score of 3 (highest relevance)
 * - Otherwise, adds 1 point for each individual search query word found in the line
 *
 * @param line - The text line to check against the search query
 * @param searchQuery - The search query to check against the line
 * @returns A numerical score indicating relevance: 3 for exact matches, or the count of matching words
 */
export const getRelevanceScore = (line: string, searchQuery: string) => {
	const lowerLine = line.toLowerCase();
	const lowerQuery = searchQuery.toLowerCase();
	// Higher score for exact matches
	if (lowerLine.includes(lowerQuery)) {
		return 3;
	}

	// Score based on word matches
	const queryWords = lowerQuery.split(' ');
	return queryWords.reduce((score, word) => {
		return score + (lowerLine.includes(word) ? 1 : 0);
	}, 0);
};
