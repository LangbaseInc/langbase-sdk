# @langbase/eslint-config

## 1.0.0

### Major Changes

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

    ‼️ BREAKING: `ChoiceNonStream` type is now renamed to `ChoiceGenerate`.

    ‼️ BREAKING: [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text) now returns a threadId and stream as an object instead of returning stream alone.

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

    📦 NEW: Chat support in both both [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text) and [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)
    👌 IMPROVE: Example updates for Node, browser, Next.js, React, etc.
    👌 IMPROVE: ⌘ Langbase [SDK Docs](https://langbase.com/docs/langbase-sdk) and API reference for both [`generateText()`](https://langbase.com/docs/langbase-sdk/generate-text) and [`streamText()`](https://langbase.com/docs/langbase-sdk/stream-text)

## 0.1.0

### Minor Changes

- b026a61: Initial beta release
