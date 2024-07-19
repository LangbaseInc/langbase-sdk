# Base AI

The AI framework for building declarative and composable AI-powered LLM products.

## Getting Started with langbase

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


```TypeScript
import 'dotenv/config';
import {Pipe} from 'langbase';

// STREAM: OFF
const pipeStreamOff = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY!,
});

const result = await pipeStreamOff.generateText({
	messages: [{role: 'user', content: 'Who is Ahmad Awais?'}],
});

console.log(result.completion);

// STREAM: ON
const pipeStreaming = new Pipe({
	apiKey: process.env.PIPE_LESS_WORDY_STREAM!,
});

const stream = await pipeStreaming.streamText({
	messages: [{role: 'user', content: 'Who is Ahmad Awais?'}],
});

for await (const chunk of stream) {
	process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```
