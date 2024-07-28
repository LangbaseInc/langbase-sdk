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

You can [`generateText`](https://langbase.com/docs/langbase-sdk/generate-text) or [`streamText`](https://langbase.com/docs/langbase-sdk/stream-text) based on the type of a pipe.

Check our [SDK documentation](https://langbase.com/docs/langbase-sdk/overview) for more details.

### Example projects

Check the following examples:

- [Node: Generate Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/everything/generate-text.ts)
- [Node: Stream Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/everything/stream-text.ts)
- [Next.js Example](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs)
  - TypeScript code
  - [React component](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/components/langbase) to display the response
  - [API Route handlers](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/app/api/langbase/pipe) to send requests to ⌘ Langbase

### Node.js Example Code


## Node.js Examples

### Add a `.env` file with your Pipe API key

```bash
# Add your Pipe API key here.
LANGBASE_PIPE_API_KEY="pipe_12345`"
```

---

### Generate text [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text)

For more check the API reference of [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text)

```ts
import 'dotenv/config';
import {Pipe} from 'langbase';

// 1. Initiate the Pipe.
const pipe = new Pipe({
	// Make sure you have a .env file with any pipe you wanna use.
	// As a demo we're using a pipe that has less wordy responses.
	apiKey: process.env.LANGBASE_PIPE_API_KEY!,
});

// 3. Generate the text by asking a question.
const result = await pipe.generateText({
	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
});

// 4. Done: You got the generated completion.
console.log(result.completion);
```

---

### Stream text [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)

For more check the API reference of [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)

```ts
import 'dotenv/config';
import {Pipe} from 'langbase';

// 1. Initiate the Pipe.
const pipe = new Pipe({
	// Make sure you have a .env file with any pipe you wanna use.
	// As a demo we're using a pipe that has less wordy responses.
	apiKey: process.env.LANGBASE_PIPE_API_KEY!,
});

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

Check out [more examples in the docs](https://langbase.com/docs/langbase-sdk/examples) →
