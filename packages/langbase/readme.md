# Base AI

The AI framework for building declarative and composable AI-powered LLM products.

## Getting Started with @langbase/core

### Installation

First, install the `@langbase/core` package using npm or yarn:

```bash
npm install @langbase/core
```

or

```bash
pnpm add @langbase/core
```

or

```bash
yarn add @langbase/core
```

### Usage

To use the `generate` function from the `@langbase/core` package, follow these steps:

1. **Import the `generate` function**:

    ```typescript
    import {generate} from '@langbase/core';
    ```

2. **Set up environment variables**:

    Ensure you have the following environment variables set in your `.env` file:

    ```env
    OPENAI_API_KEY=your_openai_api_key
    ```

3. **Generate a response using a prompt**:

    ```typescript
    import {generate} from '@langbase/core';

    async function exampleWithPrompt() {
    	const response = await generate({
    		model: 'gpt-3.5-turbo-0125',
    		prompt: '1+1',
    	});

    	console.log(response); // Output: '2'
    }

    exampleWithPrompt();
    ```

4. **Generate a response using messages array**:

    ```typescript
    import {generate} from '@langbase/core';

    async function exampleWithMessages() {
    	const response = await generate({
    		model: 'gpt-3.5-turbo-0125',
    		messages: [
    			{role: 'system', content: 'You are a helpful assistant.'},
    			{role: 'user', content: 'Give me 5 title ideas'},
    			{role: 'assistant', content: 'Sure, here you go … …'},
    		],
    	});

    	console.log(response);
    }

    exampleWithMessages();
    ```

## API Reference

### `generate`

Generates a response using the specified model, prompt, or messages array.

#### Signature

```typescript
async function generate(params: GenerateParams): Promise<string>;
```

#### Parameters

-   `params`: An object containing the following properties:
    -   `model` (string): The model to use for generating the response.
    -   `prompt` (optional string): The prompt to use for generating the response. Either `prompt` or `messages` must be provided.
    -   `messages` (optional `Message[]`): An array of message objects. Each message object should contain `role` and `content` properties. Either `prompt` or `messages` must be provided.

#### Returns

-   A promise that resolves to a string containing the generated response.

#### Example

```typescript
import {generate} from '@langbase/core';

const responseFromPrompt = await generate({
	model: 'gpt-3.5-turbo-0125',
	prompt: '1+1',
});

console.log(responseFromPrompt);

const responseFromMessages = await generate({
	model: 'gpt-3.5-turbo-0125',
	messages: [
		{role: 'system', content: 'You are a helpful assistant.'},
		{role: 'user', content: 'Give me 5 title ideas'},
		{role: 'assistant', content: 'Sure, here you go … …'},
	],
});

console.log(responseFromMessages);
```

### `validateInput`

Validates the input parameters and environment variables.

#### Signature

```typescript
function validateInput(params: GenerateParams): ValidatedParams;
```

#### Parameters

-   `params`: An object containing the following properties:
    -   `model` (string): The model to use for generating the response.
    -   `prompt` (optional string): The prompt to use for generating the response.
    -   `messages` (optional `Message[]`): An array of message objects.

#### Returns

-   An object containing the validated parameters and environment variables.

#### Example

```typescript
const validatedParams = validateInput({
	model: 'gpt-3.5-turbo-0125',
	prompt: 'Hi',
});
```

### `buildMessages`

Constructs the messages array using the provided prompt or messages array.

#### Signature

```typescript
function buildMessages({
	prompt,
	messages,
}: {
	prompt?: string;
	messages?: Message[];
}): Message[];
```

#### Parameters

-   `prompt` (optional string): The prompt to use for generating the response.
-   `messages` (optional `Message[]`): An array of message objects.

#### Returns

-   An array of message objects.

#### Example

```typescript
const messages = buildMessages({prompt: 'Hi'});
```

### `buildHeaders`

Constructs the headers for the API request using the provided API key.

#### Signature

```typescript
function buildHeaders(API_KEY: string): Record<string, string>;
```

#### Parameters

-   `API_KEY` (string): The API key to use for the request.

#### Returns

-   An object containing the headers for the API request.

#### Example

```typescript
const headers = buildHeaders('your-api-key');
```

### `handleResponse`

Processes the API response and extracts the generated message content.

#### Signature

```typescript
async function handleResponse(response: Response): Promise<string>;
```

#### Parameters

-   `response` (Response): The response object from the API request.

#### Returns

-   A promise that resolves to a string containing the generated message content.

#### Example

```typescript
const content = await handleResponse(response);
```

## Types

### `GenerateParams`

Type definition for the parameters of the `generate` function.

```typescript
interface GenerateParams {
	model: string;
	prompt?: string;
	messages?: Message[];
}
```

### `Message`

Type definition for a message object.

```typescript
interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}
```

### `ValidatedEnv`

Type definition for the validated environment variables.

```typescript
interface ValidatedEnv {
	API_KEY: string;
	API_URL_CHAT: string;
}
```

## Environment Variables

### `OPEN_AI_API_KEY`

The API key for authenticating requests to the OpenAI API.

### `OPEN_AI_API_URL_CHAT`

The URL for the OpenAI API chat endpoint.

## Example Usage

```typescript
import {generate} from '@langbase/core';

const responseFromPrompt = await generate({
	model: 'gpt-3.5-turbo-0125',
	prompt: '1+1',
});

console.log(responseFromPrompt);

const responseFromMessages = await generate({
	model: 'gpt-3.5-turbo-0125',
	messages: [
		{role: 'system', content: 'You are a helpful assistant.'},
		{role: 'user', content: 'Give me 5 title ideas'},
		{role: 'assistant', content: 'Sure, here you go … …'},
	],
});

console.log(responseFromMessages);
```

This documentation provides a comprehensive guide for getting started with the `@langbase/core` package, as well as a detailed API reference for the `generate` function and its related components.
