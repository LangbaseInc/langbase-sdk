# Langbase SDK

The AI framework for building declarative and composable AI-powered LLM products.

## Getting Started with `langbase` SDK

### Installation

First, install the `langbase` package using npm or yarn:

```bash
npm install langbase
```

or

```bash
pnpm add langbase
```

or

```bash
yarn add langbase
```

### Usage

You can `generateText` or `streamText` based on the type of a pipe.

Check our [SDK documentation](https://langbase.com/docs) for more details.

### Example projects

Check the following examples:
- [Node: Generate Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/everything/generate-text.ts)
- [Node: Stream Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/everything/stream-text.ts)
- [Next.js Example](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs)
  - TypeScript code
  - [React component](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/components/langbase) to display the response
  - [API Route handlers](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/app/api/langbase/pipe) to send requests to ⌘ Langbase

### Demo code:

```TypeScript
import 'dotenv/config';
import {Pipe} from 'langbase';

// STREAM: OFF
console.log('STREAM-OFF: generateText()');

// 1. Initiate the Pipe.
const pipe = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY!,
});

// 3. Generate the text by asking a question.
const result = await pipe.generateText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 4. Done: You got the generated completion.
console.log(result.completion);

// ======= OR ======== //

// STREAM: ON
console.log('');
console.log('STREAM-ON: streamText()');

// 2. Generate a stream by asking a question
const stream = await pipe.streamText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 3. Print the stream
for await (const chunk of stream) {
	// Streaming text part — a single word or several.
	const textPart = chunk.choices[0]?.delta?.content || '';

	// Demo: Print the stream — you can use it however.
	process.stdout.write(textPart);
}
```
