# `langbase` SDK

## 1.1.51

### Patch Changes

- Fix filter types

## 1.1.50

### Patch Changes

- 👌 IMPROVE: Chunk inputs

## 1.1.49

### Patch Changes

- Add workflows

## 1.1.48

### Patch Changes

- 📦 NEW: Create memory response types

## 1.1.47

### Patch Changes

- 👌 IMPROVE: llm.run()

## 1.1.46

### Patch Changes

- Add chunk size and chunk overlap option in memory create

## 1.1.45

### Patch Changes

- configurable top-k in memory

## 1.1.44

### Patch Changes

- 👌 IMPROVE: Types

## 1.1.43

### Patch Changes

- 👌 IMPROVE: Threads message response type

## 1.1.42

### Patch Changes

- 📦 NEW: Export tool interface

## 1.1.41

### Patch Changes

- Improve LLM Primitive

## 1.1.40

### Patch Changes

- 📦 NEW: onCancel function in usePipe

## 1.1.39

### Patch Changes

- Runtime LLM

## 1.1.38

### Patch Changes

- 📦 NEW: Threads support

## 1.1.37

### Patch Changes

- 📦 NEW: Base url

## 1.1.36

### Patch Changes

- 👌 IMPROVE: SDK syntax

## 1.1.35

### Patch Changes

- 📦 NEW: Threads support

## 1.1.34

### Patch Changes

- 🐛 FIX: Thread id null in response

## 1.1.33

### Patch Changes

- 4f0d103: 📦 NEW: Thread id in onFinish
- 📦 NEW: Thread id in onFinish()

## 1.1.32

### Patch Changes

- 🐛 FIX: Thread id in run response

## 1.1.31

### Patch Changes

- 👌 IMPROVE: Tool stream code

## 1.1.30

### Patch Changes

- 📦 NEW: Helper functions for getting tools from stream and non-stream response

## 1.1.29

### Patch Changes

- 📦 NEW: Json flag support

## 1.1.28

### Patch Changes

- 🐛 FIX: Docs link

## 1.1.27

### Patch Changes

- 📦 NEW: usePipe support

## 1.1.26

### Patch Changes

- Add filters in memory

## 1.1.25

### Patch Changes

- 📦 NEW: Parse primitive support

## 1.1.24

### Patch Changes

- 📦 NEW: Remove baseai as dependency

## 1.1.23

### Patch Changes

- 📦 NEW: Chunk support

## 1.1.22

### Patch Changes

- 📦 NEW: Pipe API key support in pipe.run()

## 1.1.21

### Patch Changes

- 👌 IMPROVE: pipe.run() native SDK support

## 1.1.20

### Patch Changes

- 📦 NEW: Embed support

## 1.1.19

### Patch Changes

- 👌 IMPROVE: Web search tool

## 1.1.18

### Patch Changes

- 📦 NEW: Crawl support

## 1.1.17

### Patch Changes

- 📦 NEW: Web search tool support

## 1.1.16

### Patch Changes

- 📦 NEW: LB-LLM-Key header support

## 1.1.15

### Patch Changes

- 📦 NEW: Optional langbase key

## 1.1.14

### Patch Changes

- 📦 NEW: Google embedding model support

## 1.1.13

### Patch Changes

- 👌 IMPROVE: Run types

## 1.1.12

### Patch Changes

- 🐛 FIX: Name type in Messages

## 1.1.11

### Patch Changes

- 📦 NEW: tools support in pipe.run()

## 1.1.10

### Patch Changes

- 📦 NEW: Pipe API key support in pipe.run()

## 1.1.9

### Patch Changes

- 👌 IMPROVE: Change filename to documentName

## 1.1.8

### Patch Changes

- 📦 NEW: Support all pipes and memory methods from Langbase class

## 1.1.7

### Patch Changes

- 📦 NEW: Support embedding model selection when creating memory

## 1.1.6

### Patch Changes

- 👌 IMPROVE: Message required in pipe.run()

## 1.1.5

### Patch Changes

- 👌 IMPROVE: pipe.run() method

## 1.1.4

### Patch Changes

- 📦 NEW: All memory and docs endpoints support

## 1.1.3

### Patch Changes

- 📦 NEW: Memory create/list and Pipe list support

## 1.1.2

### Patch Changes

- 📦 NEW: Support for Pipe create and update

## 1.1.1

### Patch Changes

- 📦 NEW: run endpoint support

## 1.1.0

### Minor Changes

- Export all pipe helper functions

## 1.0.0

### Major Changes

- 📦 NEW: Chat support in both both [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text) and [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)
- 👌 IMPROVE: Example updates for Node, browser, Next.js, React, etc.
- 👌 IMPROVE: ⌘ Langbase [SDK Docs](https://langbase.com/docs/langbase-sdk) and API reference for both [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text) and [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)
- ‼️ BREAKING: `ChoiceNonStream` type is now renamed to `ChoiceGenerate`.
- ‼️ BREAKING: [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text) now doesn't return raw instead all properties are included in the main response.

    #### BEFORE

    ```ts
    interface GenerateNonStreamResponse {
    	completion: string;
    	raw: {
    		id: string;
    		object: string;
    		created: number;
    		model: string;
    		choices: ChoiceNonStream[];
    		usage: Usage;
    		system_fingerprint: string | null;
    	};
    }
    ```

    #### NOW

    ```ts
    interface GenerateResponse {
    	completion: string;
    	threadId?: string;
    	id: string;
    	object: string;
    	created: number;
    	model: string;
    	system_fingerprint: string | null;
    	choices: ChoiceGenerate[];
    	usage: Usage;
    }
    ```

- ‼️ BREAKING: [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text) now returns a threadId and stream as an object instead of returning stream alone.

    #### BEFORE

    ```ts
    const stream = await pipe.streamText({
    	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
    });
    ```

    #### NOW

    ```ts
    const {threadId, stream} = await pipe.streamText({
    	messages: [{role: 'user', content: 'Who is an AI Engineer?'}],
    });
    ```

## 0.6.0

### Minor Changes

- Support variables

## 0.5.0

### Minor Changes

- Switch off the stream in generateText()

## 0.4.0

### Minor Changes

- 📦 NEW: TypeScript types in Stream Delta for tool calls

## 0.3.0

### Minor Changes

- 📦 NEW: Tool calls TypeScript types

## 0.2.5

### Patch Changes

- 📖 DOC: Example and docs link

## 0.2.4

### Patch Changes

- 📖 DOC: readme and docs update

## 0.2.3

### Patch Changes

- 👌 IMPROVE: TypeScript Types and examples

## 0.2.2

### Patch Changes

- 👌 IMPROVE: Readme docs and lingo

## 0.2.1

### Patch Changes

- Readme with examples and docs link

## 0.2.0

### Minor Changes

- 139e314: export browser readable stream method `fromReadableStream()`

## 0.1.0

### Minor Changes

- b026a61: Initial beta release

## 0.0.1

### Patch Changes

- Initial package. Let's do this IA.
