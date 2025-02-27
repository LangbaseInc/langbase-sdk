import { z } from 'zod';

export const deployOptionsSchema = z.object({
	isDev: z.boolean().optional().default(false),
	agent: z
		.string()
		.trim()
		.min(1)
		.refine(
			value => {
				const regex =
					/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
				if (regex.test(value)) return true;
				else return false;
			},
			{
				message:
					'Invalid agent name. Ensure the agent name is in the format: owner/agent'
			}
		),
	filePath: z
		.string()
		.trim()
		.min(1)
		.refine(value => value.endsWith('.js') || value.endsWith('.ts'), {
			message: 'Only JavaScript and TypeScript files are supported'
		}),
	apiKey: z.string().min(1).optional()
});

export const buildOptionsSchema = z.object({
	filePath: z
		.string()
		.trim()
		.min(1)
		.refine(value => value.endsWith('.js') || value.endsWith('.ts'), {
			message: 'Only JavaScript and TypeScript files are supported'
		})
});
