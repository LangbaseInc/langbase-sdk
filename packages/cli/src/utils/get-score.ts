/**
 * Enhanced relevance scoring algorithm that evaluates the similarity between a text and a search query
 * with special handling for document metadata extraction.
 *
 * Scoring system:
 * - Exact match of full query: 10 points (highest priority)
 * - Title match: 5 points per matching word in title
 * - Content match: 1 point per matching word in content
 * - Partial word matches (minimum 3 chars): 0.5 points
 * - Word proximity bonus: additional points when query words appear close together
 *
 * @param text - The text to check against the search query (could be title or content)
 * @param searchQuery - The search query to check against the text
 * @param isTitle - Boolean indicating if the text is a title (for boosting score)
 * @returns A numerical score indicating relevance
 */
export const getRelevanceScore = (
	text: string,
	searchQuery: string,
	isTitle: boolean
): number => {
	if (!text || !searchQuery) return 0;

	const lowerText = text.toLowerCase();
	const lowerQuery = searchQuery.toLowerCase().trim();

	// Early return for empty queries
	if (lowerQuery.length === 0) return 0;

	let score = 0;

	// Highest score for exact matches (10 points)
	const isExactMatch = lowerText.includes(lowerQuery);
	if (isExactMatch) {
		score += 10;
	}

	// Score based on individual word matches
	const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);

	// Track positions of matched words for proximity calculation
	const matchPositions: number[] = [];

	for (const word of queryWords) {
		// Skip very short words
		const isWordShort = word.length < 2;
		if (isWordShort) continue;

		const isWordMatch = lowerText.includes(word);
		if (isWordMatch) {
			// Full word match
			if (isTitle) {
				score += 5;
			} else {
				score += 1;
			}

			// Store position for proximity calculation
			const pos = lowerText.indexOf(word);
			if (pos >= 0) matchPositions.push(pos);
		} else if (word.length >= 3) {
			// Partial word match for longer words (at least 3 chars)
			for (const textWord of lowerText.split(/\s+/)) {
				const isLongWord = textWord.length >= 3;
				const isWordMatch =
					textWord.includes(word) || word.includes(textWord);
				if (isLongWord && isWordMatch) {
					if (isTitle) {
						score += 2.5;
					} else {
						score += 0.5;
					}
					break;
				}
			}
		}
	}

	// Calculate word proximity bonus when multiple words matched
	const isMultipleWordsMatched = matchPositions.length > 1;
	if (isMultipleWordsMatched) {
		matchPositions.sort((a, b) => a - b);
		// If words appear within 50 chars of each other, give proximity bonus
		const isProximityBonus =
			matchPositions[matchPositions.length - 1] - matchPositions[0] < 50;
		if (isProximityBonus) {
			score += 2;
		}
	}

	return score;
};

/**
 * Parse document metadata from structured document text
 * This function handles document text that may contain code blocks with backticks
 *
 * @param docText - The document text containing metadata in a structured format
 * @returns An object containing the title and URL if found
 */
export const extractDocMetadata = (
	docText: string
): { title: string | ''; url: string | '' } => {
	const result = { title: '', url: '' };

	// Extract metadata section
	const metadataSection = docText.match(/<metadata>([\s\S]*?)<\/metadata>/i);
	const isMetadataSection = metadataSection && metadataSection[1];
	if (isMetadataSection) {
		// Within the metadata section, extract title and url
		const metadataContent = metadataSection[1];

		// Extract title
		const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(metadataContent);
		const isTitleMatch = titleMatch && titleMatch[1];
		if (isTitleMatch) {
			result.title = titleMatch[1].trim();
		}

		// Extract URL
		const urlMatch = /<url>([\s\S]*?)<\/url>/i.exec(metadataContent);
		const isUrlMatch = urlMatch && urlMatch[1];
		if (isUrlMatch) {
			result.url = urlMatch[1].trim();
		}
	}

	return result;
};

/**
 * Safely extracts document blocks from documentation text
 * Handles potential code blocks with triple backticks
 *
 * @param docs - The complete documentation text
 * @returns Array of document block objects
 */
export const extractDocBlocks = (docs: string): string[] => {
	// Use regex to find all doc blocks, handling potential nested code blocks with backticks
	const docPattern = /<doc>[\s\S]*?<\/doc>/g;
	const matches = docs.match(docPattern) || [];
	return matches;
};
