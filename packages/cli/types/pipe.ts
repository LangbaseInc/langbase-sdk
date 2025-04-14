import { z } from "zod";

export type PipeStatus = 'public' | 'private';

export const pipeNameSchema = z
	.string()
	.min(3, 'Pipe name must be at least 3 characters long')
	.max(50, 'Pipe name must not exceed 50 characters')
	.regex(
		/^[a-zA-Z0-9.-]+$/,
		'Pipe name can only contain letters, numbers, dots, and hyphens'
	);