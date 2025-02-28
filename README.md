# Langbase SDK

The AI SDK for building declarative and composable AI-powered LLM products.

## Documentation

Check the [Langbase SDK documentation](https://langbase.com/docs/sdk) for more details.

The following examples are for reference only. Prefer docs for the latest information.

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

You can [`langbase.pipes.run()`](https://langbase.com/docs/sdk/pipe/run) to generate or stream from a Pipe.

Check our [SDK documentation](https://langbase.com/docs/sdk) for more details.

### Example projects

Check the following examples:

-   [Node: Generate Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/nodejs/examples/pipes/pipe.run.ts)
-   [Node: Stream Text](https://github.com/LangbaseInc/langbase-sdk/blob/main/examples/nodejs/examples/pipes/pipe.run.stream.ts)
-   [Next.js Example](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs)
    -   TypeScript code
    -   [React component](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/components/langbase) to display the response
    -   [API Route handlers](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples/nextjs/app/langbase/pipe/run) to send requests to ⌘ Langbase

### Node.js Example Code

## Node.js Examples

### Add a `.env` file with your LANGBASE API key

```bash
# Add your Langbase API key here: https://langbase.com/docs/api-reference/api-keys
LANGBASE_API_KEY="your-api-key"
```

---

### Generate text [`langbase.pipes.run()`](https://langbase.com/docs/sdk/pipe/run)

Set the `stream` to `false`. For more, check the API reference of [`langbase.pipes.run()`](https://langbase.com/docs/langbase-sdk/generate-text)

```ts
import 'dotenv/config';
import {Langbase} from 'langbase';

// 1. Initiate the Langbase.
const langbase = new Langbase({
    // Make sure you have a .env file with LANGBASE_API_KEY.
    apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
    // 2. Run the pipe with a question.
    const response = await langbase.pipes.run({
        stream: false,
        name: 'summary' // pipe name to run
        messages: [
            {
                role: 'user',
                content: 'Who is an AI Engineer?',
            },
        ],
    });

    // 3. Print the response.
    console.log('response: ', response);
}

main();
```

---

### Stream text [`langbase.pipes.run()`](https://langbase.com/docs/sdk/pipe/run)

Set the `stream` to `true`. For more, check the API reference of [`langbase.pipes.run()`](https://langbase.com/docs/langbase-sdk/generate-text)

```ts
import 'dotenv/config';
import {getRunner, Langbase} from 'langbase';

// 1. Initiate the Langbase.
const langbase = new Langbase({
    // Make sure you have a .env file with LANGBASE_API_KEY.
    apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
    const userMsg = 'Who is an AI Engineer?';

    // 2. Run the pipe with a question.
    const {stream} = await langbase.pipes.run({
        stream: true,
        name: 'summary', // pipe name to run
        messages: [{role: 'user', content: userMsg}],
    });

    // 3. Get the runner and listen to the content.
    const runner = getRunner(stream);

    // 4. Print the response.
    runner.on('content', content => {
        process.stdout.write(content);
    });
}

main();
```

Check out [more examples in the docs](https://langbase.com/docs/sdk/examples) →
