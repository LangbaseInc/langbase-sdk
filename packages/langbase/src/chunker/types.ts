export interface ChunkOptions {
	content: string;
	chunkOverlap?: number;
	chunkMaxLength?: number;
}

export type ChunkResponse = string[];
