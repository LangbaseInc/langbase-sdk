/**
 * Type definitions for Langbase Memory
 *
 * This file contains all type definitions and interfaces related to Memory,
 * including document management and retrieval operations.
 */

/**
 * Runtime memory configuration
 */
export type RuntimeMemory = {
	name: string;
}[];

/**
 * Supported embedding models for memory
 */
export type EmbeddingModels =
	| 'openai:text-embedding-3-large'
	| 'cohere:embed-multilingual-v3.0'
	| 'cohere:embed-multilingual-light-v3.0'
	| 'google:text-embedding-004';

/**
 * Supported content types for document uploads
 */
export type ContentType =
	| 'application/pdf'
	| 'text/plain'
	| 'text/markdown'
	| 'text/csv'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/vnd.ms-excel';

/**
 * Filter operators for memory retrieval
 */
type FilterOperator = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'And' | 'Or';

/**
 * Filter connective operators
 */
type FilterConnective = 'And' | 'Or';

/**
 * Filter value types
 */
type FilterValue = string | string[];

/**
 * Filter condition tuple
 */
type FilterCondition = [string, FilterOperator, FilterValue];

/**
 * Memory filters for retrieval operations
 */
export type MemoryFilters = [FilterConnective, MemoryFilters[]] | FilterCondition;

/**
 * Base response for memory operations
 */
export interface MemoryBaseResponse {
	name: string;
	description: string;
	owner_login: string;
	url: string;
}

/**
 * Base response for delete operations
 */
export interface BaseDeleteResponse {
	success: boolean;
}

/**
 * Options for creating a memory
 */
export interface MemoryCreateOptions {
	name: string;
	description?: string;
	embedding_model?: EmbeddingModels;
	top_k?: number;
	chunk_size?: number;
	chunk_overlap?: number;
}

/**
 * Response from memory creation
 */
export interface MemoryCreateResponse extends MemoryBaseResponse {
	chunk_size: number;
	chunk_overlap: number;
	embedding_model: EmbeddingModels;
}

/**
 * Options for deleting a memory
 */
export interface MemoryDeleteOptions {
	name: string;
}

/**
 * Response from memory deletion
 */
export interface MemoryDeleteResponse extends BaseDeleteResponse {}

/**
 * Response from memory list operation
 */
export interface MemoryListResponse extends MemoryBaseResponse {
	embeddingModel: EmbeddingModels;
}

/**
 * Options for retrieving from memory
 */
export interface MemoryRetrieveOptions {
	query: string;
	memory: {
		name: string;
		filters?: MemoryFilters;
	}[];
	topK?: number;
}

/**
 * Response from memory retrieval
 */
export interface MemoryRetrieveResponse {
	text: string;
	similarity: number;
	meta: Record<string, string>;
}

/**
 * Options for listing documents in a memory
 */
export interface MemoryListDocOptions {
	memoryName: string;
}

/**
 * Response from listing documents in a memory
 */
export interface MemoryListDocResponse {
	name: string;
	status: 'queued' | 'in_progress' | 'completed' | 'failed';
	status_message: string | null;
	metadata: {
		size: number;
		type: ContentType;
	};
	enabled: boolean;
	chunk_size: number;
	chunk_overlap: number;
	owner_login: string;
}

/**
 * Options for deleting a document from memory
 */
export interface MemoryDeleteDocOptions {
	memoryName: string;
	documentName: string;
}

/**
 * Response from deleting a document
 */
export interface MemoryDeleteDocResponse extends BaseDeleteResponse {}

/**
 * Options for uploading a document to memory
 */
export interface MemoryUploadDocOptions {
	memoryName: string;
	documentName: string;
	meta?: Record<string, string>;
	document: Buffer | File | FormData | ReadableStream;
	contentType: ContentType;
}

/**
 * Options for retrying document embedding
 */
export interface MemoryRetryDocEmbedOptions {
	memoryName: string;
	documentName: string;
}

/**
 * Response from retrying document embedding
 */
export interface MemoryRetryDocEmbedResponse extends BaseDeleteResponse {}
