# Testing Guide

This document provides comprehensive information about testing the Langbase SDK.

## Test Environment Setup

The SDK uses **Vitest** for testing with multiple configurations:

- **Node.js environment** (`vitest.node.config.js`) - For server-side testing
- **Edge runtime environment** (`vitest.edge.config.js`) - For edge computing platforms
- **React UI environment** (`vitest.ui.react.config.js`) - For React components with JSDOM

## Running Tests

### Local Development

Run all tests locally using our comprehensive script:

```bash
./scripts/test-all.sh
```

Or run specific test suites:

```bash
cd packages/langbase

# Node.js environment tests
pnpm test:node

# Edge runtime tests  
pnpm test:edge

# React UI component tests
pnpm test:ui:react

# Run all tests
pnpm test
```

### Individual Test Files

Run specific test files:

```bash
# Test specific module
pnpm vitest src/langbase/langbase.test.ts --config vitest.node.config.js --run

# Test with watch mode
pnpm vitest src/common/request.test.ts --config vitest.node.config.js
```

### GitHub Actions / CI

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The CI pipeline runs:
1. **Linting** with ESLint
2. **Type checking** with TypeScript
3. **Unit tests** in Node.js environment
4. **Unit tests** in Edge runtime environment  
5. **UI tests** for React components
6. **Ecosystem tests** (Node ESM/CJS, Bun, Deno) - PR only

## Test Structure

### Core Test Files

- **`src/langbase/langbase.test.ts`** - Main SDK class tests
- **`src/common/request.test.ts`** - HTTP client and error handling
- **`src/common/stream.test.ts`** - Streaming functionality
- **`src/common/errors.test.ts`** - Error class hierarchy
- **`src/langbase/threads.test.ts`** - Thread operations
- **`src/langbase/workflows.test.ts`** - Workflow execution engine
- **`src/lib/helpers/index.test.ts`** - Helper utilities
- **`src/lib/utils/doc-to-formdata.test.ts`** - Document conversion utilities

### Test Coverage Areas

#### 1. Core SDK Operations
- **Pipes**: Create, update, list, run (streaming and non-streaming)
- **Memories**: Create, delete, list, retrieve, document operations
- **Tools**: Web search, crawling
- **Agent**: Run with various configurations
- **Threads**: Full thread lifecycle management
- **Workflows**: Step execution, retries, timeouts, tracing

#### 2. HTTP Client (`Request` class)
- All HTTP methods (GET, POST, PUT, DELETE)
- Error handling for various HTTP status codes
- Request/response processing
- Stream handling
- Header management
- Raw response processing

#### 3. Error Handling
- API error types and inheritance
- Network connection errors
- Timeout handling
- Proper error messages and status codes

#### 4. Streaming
- Server-Sent Events (SSE) processing
- ReadableStream handling
- Stream tee/split operations
- Error handling in streams

#### 5. Utilities
- Document to FormData conversion
- Tool extraction from streams
- Helper functions for OpenAI integration

## Test Patterns

### Mocking External Dependencies

Tests use Vitest's mocking capabilities:

```typescript
// Mock external modules
vi.mock('../common/request');

// Mock global functions
global.fetch = vi.fn();

// Mock class methods
const mockPost = vi.fn().mockResolvedValue(mockResponse);
(langbase as any).request = {post: mockPost};
```

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  const result = await langbase.pipes.run(options);
  expect(result).toEqual(expectedResponse);
});
```

### Error Testing

```typescript
it('should throw appropriate errors', async () => {
  await expect(
    langbase.pipes.run(invalidOptions)
  ).rejects.toThrow('Expected error message');
});
```

### Stream Testing

```typescript
it('should handle streams correctly', async () => {
  const stream = createMockStream();
  const results = [];
  
  for await (const chunk of stream) {
    results.push(chunk);
  }
  
  expect(results).toEqual(expectedChunks);
});
```

## Continuous Integration

### GitHub Actions Workflow

The CI workflow (`.github/workflows/tests.yml`) includes:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]  # Test multiple Node.js versions
```

### Test Jobs

1. **Main Test Job**
   - Install dependencies
   - Run linting
   - Run type checking  
   - Test in Node.js environment
   - Test in Edge runtime environment
   - Test React UI components

2. **Ecosystem Test Job** (PR only)
   - Test with Node.js ESM/CJS
   - Test with Bun runtime
   - Test with Deno runtime

### Performance Considerations

- Tests use timeouts to prevent hanging
- Ecosystem tests have 30-second timeouts
- Parallel execution where possible
- Efficient mocking to reduce test time

## Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Cover edge cases** and error scenarios
3. **Mock external dependencies** properly
4. **Test in multiple environments** if applicable
5. **Update documentation** as needed

### Test Checklist

- [ ] Unit tests for new functionality
- [ ] Error handling tests
- [ ] Edge case coverage
- [ ] Integration tests where appropriate
- [ ] Performance considerations
- [ ] Documentation updates

## Debugging Tests

### Local Debugging

```bash
# Run with verbose output
pnpm vitest --reporter=verbose

# Run single test with debugging
pnpm vitest src/path/to/test.ts --reporter=verbose

# Watch mode for development
pnpm vitest --watch
```

### Common Issues

1. **Path Resolution**: Ensure `@` alias is configured in vitest configs
2. **Mocking**: Use `vi.resetAllMocks()` in `beforeEach`
3. **Async**: Always `await` async operations in tests
4. **Global Objects**: Mock globals like `fetch`, `FormData`, etc.

## Best Practices

- **Keep tests focused** - One concept per test
- **Use descriptive test names** - Describe what should happen
- **Mock external dependencies** - Keep tests isolated
- **Test error scenarios** - Don't just test the happy path
- **Clean up after tests** - Reset mocks and global state
- **Use proper TypeScript types** - Maintain type safety in tests