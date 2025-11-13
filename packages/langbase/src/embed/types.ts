/**
 * Type definitions for Langbase Embed
 *
 * This file contains all type definitions and interfaces related to Embed,
 * including embedding generation operations.
 */

/**
 * Supported embedding models
 */
export type EmbeddingModels =
	| 'openai:text-embedding-3-large'
	| 'cohere:embed-multilingual-v3.0'
	| 'cohere:embed-multilingual-light-v3.0'
	| 'google:text-embedding-004';

/**
 * Options for generating embeddings
 */
export interface EmbedOptions {
	chunks: string[];
	embeddingModel?: EmbeddingModels;
}

/**
 * Response from embedding generation
 * Array of embedding vectors, where each vector is an array of numbers
 */
export type EmbedResponse = number[][];
