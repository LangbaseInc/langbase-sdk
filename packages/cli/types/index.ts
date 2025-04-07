import * as p from '@clack/prompts';

export type Headers = Record<string, string | null | undefined>;
export type Spinner = ReturnType<typeof p.spinner>;
