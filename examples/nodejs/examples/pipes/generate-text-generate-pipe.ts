/**
 * Generates a text completion using `generateText()`
 *
 * @docs: https://langbase.com/docs/langbase-sdk/generate-text
 */

import 'dotenv/config';
import {Pipe} from 'langbase';

(async () => {
	console.log('\n============= GENERATE PIPE =============');

	//  Initiate the Pipe.
	const myPipe = new Pipe({
		apiKey: process.env.LANGBASE_SDK_GENERATE_PIPE!,
	});

	// Generate the text by asking a question.
	let {completion} = await myPipe.generateText({
		messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
	});
	console.log(completion);
})();
