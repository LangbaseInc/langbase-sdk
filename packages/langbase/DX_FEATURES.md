# Langbase SDK Developer Experience Features

This document outlines the comprehensive developer experience improvements added to the Langbase SDK.

## 🚀 Quick Start with Enhanced Features

```typescript
import { Langbase } from 'langbase';

// Enhanced constructor with validation
const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!
});

// Quick run method
const response = await langbase.run('my-pipe', 'What is AI?');
console.log(response.completion);

// Message builder pattern
const messages = langbase.utils.createMessageBuilder('my-pipe')
  .system('You are a helpful assistant')
  .user('Hello!')
  .build();
```

## ✨ New Features

### 1. Convenience Methods

#### Quick Run
Execute a pipe with a simple string prompt:

```typescript
const response = await langbase.run('summary', 'Summarize this text...');
console.log(response.completion);
```

#### Quick Stream
Stream responses with a simple interface:

```typescript
const { stream } = await langbase.stream('story-writer', 'Tell me a story');
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

#### Quick Chat with History
Create conversational experiences easily:

```typescript
const history = [
  { user: 'Hello!', assistant: 'Hi there!' },
  { user: 'How are you?', assistant: 'I am doing well!' }
];

const response = await langbase.chat('chatbot', history, 'What can you help me with?');
```

### 2. Message Builder Pattern

Create messages fluently with method chaining:

```typescript
const builder = langbase.utils.createMessageBuilder('my-pipe')
  .system('You are a coding expert')
  .user('Explain JavaScript promises')
  .assistant('Promises are a way to handle asynchronous operations...')
  .user('How do I use async/await?');

// Get message count
console.log(builder.count()); // 4

// Get last message
console.log(builder.lastMessage());

// Build messages array
const messages = builder.build();

// Or run directly if bound to a pipe
const response = await builder.run({ stream: false });
```

### 3. Enhanced Error Handling

Get detailed error information with actionable suggestions:

```typescript
try {
  const response = await langbase.pipes.run({
    name: 'non-existent-pipe',
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof LangbaseError) {
    console.log('Error:', error.message);
    console.log('Suggestion:', error.info?.suggestion);
    console.log('Documentation:', error.info?.docs);
    console.log('Retryable:', error.isRetryable());
  }
}
```

### 4. Message Helper Utilities

Create messages easily with helper functions:

```typescript
// Individual message creators
const userMsg = langbase.utils.userMessage('Hello!', 'John');
const systemMsg = langbase.utils.systemMessage('You are helpful');
const assistantMsg = langbase.utils.assistantMessage('Hi there!');

// Create conversations from exchanges
const conversation = langbase.utils.createConversation([
  { user: 'Hi', assistant: 'Hello!' },
  { user: 'How are you?', assistant: 'Good!' }
]);

// Add system message to existing conversation
const withSystem = langbase.utils.withSystemMessage(
  'You are a helpful assistant',
  conversation
);
```

### 5. Debug and Development Utilities

Enhanced debugging capabilities for development:

```typescript
// Enable debugging
langbase.utils.debug.enable();

// Debug is automatically enabled in development mode
// or when LANGBASE_DEBUG environment variable is set

// Get debug logs
const logs = langbase.utils.debug.getLogs();
console.log('Debug logs:', logs);

// Get summary statistics
const summary = langbase.utils.debug.getSummary();
console.log('Operations:', summary.totalOperations);
console.log('Errors:', summary.errors);
console.log('Average response time:', summary.averageResponseTime);

// Clear logs
langbase.utils.debug.clearLogs();

// Disable debugging
langbase.utils.debug.disable();
```

### 6. Enhanced Validation

Get detailed validation errors with suggestions:

```typescript
// Constructor validation
try {
  const langbase = new Langbase({
    apiKey: 'invalid-key-format'
  });
} catch (error) {
  console.log(error.message);
  // Output: "Validation failed: API key format appears invalid..."
}

// Runtime validation for pipe options
try {
  await langbase.pipes.run({
    // Missing name and apiKey
    messages: [] // Empty messages array
  });
} catch (error) {
  console.log(error.message);
  // Output: Detailed validation errors with suggestions
}
```

## 🛠️ Advanced Usage Patterns

### Fluent Interface for Complex Workflows

```typescript
const response = await langbase.utils.createMessageBuilder('complex-pipe')
  .system('You are an expert analyst')
  .user('Analyze this data: ...')
  .assistant('Based on the data, I can see...')
  .user('What are the key insights?')
  .run({ 
    stream: false,
    rawResponse: true,
    runTools: true 
  });
```

### Error Handling with Retry Logic

```typescript
import { LangbaseError, ErrorHandler } from 'langbase';

async function runWithRetry(options: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await langbase.pipes.run(options);
    } catch (error) {
      const enhancedError = ErrorHandler.handle(error);
      
      if (!enhancedError.isRetryable() || attempt === maxRetries) {
        throw enhancedError;
      }
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### Development vs Production Configuration

```typescript
const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
  baseUrl: process.env.NODE_ENV === 'development' 
    ? 'https://api-staging.langbase.com' 
    : 'https://api.langbase.com'
});

// Debug is automatically enabled in development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
}
```

## 🎯 Best Practices

### 1. Use Convenience Methods for Simple Cases

```typescript
// ✅ Good - Simple and readable
const response = await langbase.run('summarizer', text);

// ❌ Verbose - For simple cases
const response = await langbase.pipes.run({
  name: 'summarizer',
  messages: [{ role: 'user', content: text }],
  stream: false
});
```

### 2. Use Message Builder for Complex Conversations

```typescript
// ✅ Good - Readable and chainable
const messages = langbase.utils.createMessageBuilder()
  .system('You are a helpful assistant')
  .user('Hello!')
  .assistant('Hi there!')
  .user('How can you help?')
  .build();

// ❌ Verbose - Manual array construction
const messages = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How can you help?' }
];
```

### 3. Enable Debug Mode During Development

```typescript
if (process.env.NODE_ENV === 'development') {
  langbase.utils.debug.enable();
}
```

### 4. Handle Errors with Enhanced Information

```typescript
try {
  const response = await langbase.pipes.run(options);
} catch (error) {
  if (error instanceof LangbaseError) {
    console.error('Error:', error.message);
    if (error.info?.suggestion) {
      console.log('Suggestion:', error.info.suggestion);
    }
    if (error.info?.docs) {
      console.log('See:', error.info.docs);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🔧 Migration Guide

All new features are **non-breaking** and **additive**. Existing code will continue to work unchanged.

### Gradually Adopt New Features

1. **Start with convenience methods** for new code
2. **Use message builders** for complex conversations
3. **Enable debugging** during development
4. **Update error handling** to use enhanced errors

### Example Migration

```typescript
// Before (still works)
const response = await langbase.pipes.run({
  name: 'my-pipe',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: false
});

// After (enhanced DX)
const response = await langbase.run('my-pipe', 'Hello');
```

## 📚 Additional Resources

- [Langbase SDK Documentation](https://langbase.com/docs/sdk)
- [API Reference](https://langbase.com/docs/api-reference)
- [Examples Repository](https://github.com/LangbaseInc/langbase-sdk/tree/main/examples)

---

## 🤝 Contributing

Found an issue or want to contribute? Check out our [contributing guide](../../CONTRIBUTING.md).

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](../../LICENSE) file for details.