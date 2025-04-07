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