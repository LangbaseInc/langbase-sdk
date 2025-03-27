// Experimental upcoming beta AI primitve.
// Please refer to the documentation for more information: https://langbase.com/docs for more information.

import 'dotenv/config';
import {Langbase, Workflow} from 'langbase';

const langbase = new Langbase({
	apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
	const {step} = new Workflow({debug: true});

	const result = await step({
		id: 'sumamrize',
		run: async () => {
			return langbase.llm.run({
				model: 'openai:gpt-4o-mini',
				apiKey: process.env.OPENAI_API_KEY!,
				messages: [
					{
						role: 'system',
						content:
							'You are an expert summarizer. Summarize the user input.',
					},
					{
						role: 'user',
						content:
							'I am testing workflows. I just created an example of summarize workflow. Can you summarize this?',
					},
				],
				stream: false,
			});
		},
	});

	console.log(result['completion']);
}

main();
