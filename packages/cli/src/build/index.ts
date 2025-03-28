import { buildCode } from '@/utils/build';
import { color } from '@/utils/formatting';
import { handleError } from '@/utils/handle-error';
import { heading } from '@/utils/heading';
import { buildOptionsSchema } from '@/utils/schema';
import * as p from '@clack/prompts';
import { outro } from '@clack/prompts';

type BuildOptions = {
	filePath: string;
};

export async function build(options: BuildOptions) {
	const spinner = p.spinner();
	try {
		p.intro(heading({ text: 'BUILD', sub: 'Building code' }));

		// 1. Validate options
		const validatedOptions = validateOptions(options);

		// 2. Build code
		const { distPath } = await buildCode({
			spinner,
			filePath: validatedOptions.filePath
		});

		// 3. Output success message
		outro(color.green(`Built code is stored in ${distPath}/langbase.build.js`));
	} catch (error) {
		handleError({
			spinner,
			message: 'An unexpected error occurred',
			error
		});
	}
}

function validateOptions(options: BuildOptions) {
	const {
		data: deployOptions,
		success,
		error
	} = buildOptionsSchema.safeParse(options);
	if (!success) {
		const errorMessages = error.errors.map((error: any) => {
			return error.message;
		});

		const errorMessage = errorMessages.join('. ');

		p.cancel(`Invalid options: ${errorMessage}`);
		process.exit(1);
	}

	return {
		filePath: deployOptions.filePath
	};
}
