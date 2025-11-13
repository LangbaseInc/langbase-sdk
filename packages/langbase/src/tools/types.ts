export interface Function {
	name: string;
	arguments: string;
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: Function;
}

export interface ToolChoice {
	type: 'function';
	function: {name: string};
}

export interface Tools {
	type: 'function';
	function: {
		name: string;
		description?: string;
		parameters?: Record<string, any>;
	};
}

export interface ToolWebSearchOptions {
	query: string;
	service: 'exa';
	totalResults?: number;
	domains?: string[];
	apiKey: string;
}

export interface ToolWebSearchResponse {
	url: string;
	content: string;
}

export interface ToolCrawlOptions {
	url: string[];
	maxPages?: number;
	apiKey: string;
	service?: 'spider' | 'firecrawl';
}

export interface ToolCrawlResponse {
	url: string;
	content: string;
}
