import * as p from '@clack/prompts';

type Spinner = ReturnType<typeof p.spinner>;

export function handleError({
	spinner,
	message,
	error
}: {
	spinner: Spinner;
	message: string;
	error: unknown;
}): void {
	spinner.stop(message);
	p.log.error(`${message}: ${(error as Error).message}`);
	process.exit(1);
}
