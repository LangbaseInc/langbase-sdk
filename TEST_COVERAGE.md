# Langbase SDK Test Coverage

## Overview

Comprehensive test suite for the Langbase SDK covering all API endpoints and methods. Tests are written using Vitest and follow best practices for API testing.

## Test Files Created

### 1. **Pipes API Tests** (`src/langbase/pipes.test.ts`)
- **Total Tests**: 14
- **Coverage**:
  - `pipes.run()` - Non-streaming operations
  - `pipes.run()` - Streaming operations
  - `pipes.create()` - Create new pipes
  - `pipes.list()` - List all pipes
  - `pipes.update()` - Update existing pipes
  - Deprecated `pipe.*` methods (backwards compatibility)

**Key Test Cases**:
- Run pipe with messages
- Run pipe with variables
- Run pipe with threadId for conversation continuity
- Run pipe using pipe API key directly
- Handle JSON mode
- Streaming with proper stream handling
- Create pipe with upsert option
- Create pipe with messages and variables
- List and update operations

---

### 2. **Memory API Tests** (`src/langbase/memory.test.ts`)
- **Total Tests**: 13
- **Coverage**:
  - `memories.create()` - Create memory
  - `memories.list()` - List memories
  - `memories.delete()` - Delete memory
  - `memories.retrieve()` - Retrieve similar documents
  - `memories.documents.upload()` - Upload documents
  - `memories.documents.list()` - List documents
  - `memories.documents.delete()` - Delete documents
  - `memories.documents.embeddings.retry()` - Retry embeddings
  - Deprecated `memory.*` methods

**Key Test Cases**:
- Create memory with custom settings (chunk size, overlap, embedding model, top_k)
- Upload various document types (text, markdown, CSV)
- List documents with status information
- Retrieve with similarity search
- Retrieve with metadata filters
- Delete operations

---

### 3. **Threads API Tests** (`src/langbase/threads.test.ts`)
- **Total Tests**: 11
- **Coverage**:
  - `threads.create()` - Create thread
  - `threads.get()` - Get thread by ID
  - `threads.update()` - Update thread metadata
  - `threads.append()` - Append messages
  - `threads.messages.list()` - List messages
  - `threads.delete()` - Delete thread

**Key Test Cases**:
- Create thread with/without initial messages
- Create thread with custom threadId
- Update thread metadata
- Append messages with metadata
- List messages in chronological order
- Full thread lifecycle test (create, append, list, update, delete)
- Integration with pipes API (using threadId from pipe.run)

---

### 4. **Tools API Tests** (`src/langbase/tools.test.ts`)
- **Total Tests**: 9
- **Coverage**:
  - `tools.crawl()` - Web crawling with Spider/Firecrawl
  - `tools.webSearch()` - Web search with Exa
  - Deprecated `tool.*` methods

**Key Test Cases**:
- Crawl single webpage
- Crawl multiple pages
- Crawl with different services (Spider, Firecrawl)
- Handle multiple URLs
- Web search with Exa
- Search with domain filters
- Different result limits

**Note**: Tests gracefully skip if API keys (SPIDER_API_KEY, FIRECRAWL_API_KEY, EXA_API_KEY) are not provided.

---

### 5. **Agent API Tests** (`src/langbase/agent.test.ts`)
- **Total Tests**: 18
- **Coverage**:
  - `agent.run()` - Non-streaming agent execution
  - `agent.run()` - Streaming agent execution
  - Multiple LLM providers

**Key Test Cases**:
- Run agent with string input
- Run agent with array of messages
- Custom instructions
- Temperature, top_p, max_tokens, presence_penalty, frequency_penalty
- Stop sequences
- Tools/function calling
- Parallel tool calls
- Streaming mode
- Different models (OpenAI GPT-4o, Anthropic Claude, Google Gemini)
- Custom model parameters
- Multi-turn conversations

---

### 6. **Parser API Tests** (`src/langbase/parser.test.ts`)
- **Total Tests**: 18
- **Coverage**:
  - `parse()` - Parse documents
  - `parser()` - Alias method

**Key Test Cases**:
- Parse text documents
- Parse markdown documents
- Parse CSV content
- Handle special characters and unicode
- Parse long documents
- Parse empty documents
- Different content types (text/plain, text/markdown, text/csv)
- Response structure validation
- Real-world examples (code snippets, tables, technical documentation)

---

### 7. **Chunker API Tests** (`src/langbase/chunker.test.ts`)
- **Total Tests**: 17
- **Coverage**:
  - `chunk()` - Chunk text
  - `chunker()` - Alias method

**Key Test Cases**:
- Chunk with default settings
- Handle small text
- Handle empty text
- Custom chunk sizes (500, 2000, 30000, 1024 characters)
- Custom overlap (100, 500, 256, 2000 characters)
- Real-world content (articles, documentation, conversations, code)
- Edge cases (special characters, newlines, long words)
- Response validation

---

### 8. **Embed API Tests** (`src/langbase/embed.test.ts`)
- **Total Tests**: 26
- **Coverage**:
  - `embed()` - Generate embeddings

**Key Test Cases**:
- Single chunk embeddings
- Multiple chunks (3, 5, 10, 100 chunks)
- Different embedding models:
  - OpenAI: text-embedding-3-large
  - Cohere: embed-v4.0, embed-multilingual-v3.0, embed-multilingual-light-v3.0
  - Google: text-embedding-004
- Multilingual content (English, Chinese, Spanish, French)
- Semantic similarity validation
- Different content types (technical, questions, conversational, structured)
- Varying text lengths (short, medium, long)
- Special characters and formatting (emojis, line breaks, tabs)
- Response validation (2D array structure, consistent dimensions, finite values)
- Real-world use cases (product descriptions, reviews, FAQs, documents)

---

### 9. **Images API Tests** (`src/langbase/images.test.ts`)
- **Total Tests**: 13
- **Coverage**:
  - `images.generate()` - Generate images

**Key Test Cases**:
- OpenAI model (gpt-image-1)
- Together AI FLUX model (black-forest-labs/FLUX.1-schnell-Free)
- Google Gemini model (gemini-2.5-flash-image-preview)
- Custom dimensions (width, height)
- Multiple images (n parameter)
- Custom steps parameter
- Image-to-image transformation
- Different prompt types (simple, detailed, abstract, technical)
- Usage tracking
- Response structure validation

---

### 10. **Utilities Integration Tests** (`src/langbase/utilities.test.ts`)
- **Total Tests**: 30+
- **Coverage**: Combined tests for Parser, Chunker, and Embed

**Key Test Cases**:
- Complete pipeline: Parse → Chunk → Embed
- Integration testing across multiple APIs

---

### 11. **Deprecated Pipe Class Tests** (`src/pipes/pipes.test.ts`)
- **Total Tests**: 4
- **Coverage**: Legacy Pipe class (mocked tests)

**Key Test Cases**:
- `generateText()` for non-chat generation
- `generateText()` for chat generation
- `streamText()` for non-chat streaming
- `streamText()` for chat streaming

---

## Test Configuration

### Environment Setup

Tests are configured to load environment variables from the root `.env` file:

```javascript
// vitest.node.config.js
import {config} from 'dotenv';
config({path: path.resolve(__dirname, '../../.env')});
```

### Required Environment Variables

```env
# Required for most tests
LANGBASE_API_KEY="org_..."

# Required for pipe tests
LANGBASE_PIPE_API_KEY="pipe_..."
LANGBASE_SDK_GENERATE_PIPE="pipe_..."
LANGBASE_SDK_CHAT_PIPE="pipe_..."

# Optional - for tools tests
SPIDER_API_KEY="..."
FIRECRAWL_API_KEY="..."
EXA_API_KEY="..."
```

### Path Aliases

Tests use TypeScript path aliases configured in `vitest.node.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## Running Tests

### Run All Tests
```bash
pnpm test:node
```

### Run Specific Test File
```bash
pnpm test:node src/langbase/pipes.test.ts
pnpm test:node src/langbase/memory.test.ts
pnpm test:node src/langbase/threads.test.ts
```

### Run Tests in Watch Mode
```bash
pnpm test:node --watch
```

### Cleanup Test Resources

Tests automatically clean up created resources. If needed, manually cleanup:

```bash
# From langbase package
pnpm cleanup:test

# Or from repo root
pnpm --filter langbase cleanup:test
```

See `CLEANUP_GUIDE.md` for detailed cleanup information.

---

## Test Characteristics

### Best Practices Implemented

1. **Descriptive Test Names**: Each test has a clear, descriptive name explaining what it tests
2. **Arrange-Act-Assert Pattern**: Tests follow AAA pattern for clarity
3. **Proper Timeouts**: All async tests have appropriate timeouts (30s-60s for API calls)
4. **Environment Variable Handling**: Tests check for required env vars and skip gracefully when missing
5. **Error Handling**: Tests validate error responses and edge cases
6. **Response Validation**: Tests verify complete response structures
7. **Real-world Scenarios**: Tests include practical use cases and integration tests
8. **Backwards Compatibility**: Tests for deprecated methods ensure migration path
9. **Type Safety**: Full TypeScript typing for test assertions
10. **Isolated Tests**: Each test is independent and can run in any order

### Test Organization

- Tests are organized by API category
- Each describe block groups related functionality
- Nested describe blocks for sub-categories
- Clear separation between success cases, error cases, and edge cases

### Coverage Areas

✅ **Core Functionality**: All main SDK methods
✅ **Streaming**: Both streaming and non-streaming operations
✅ **Error Handling**: API errors, validation errors
✅ **Edge Cases**: Empty inputs, maximum limits, special characters
✅ **Integration**: Multi-API workflows (Parse→Chunk→Embed, Pipe→Threads)
✅ **Backwards Compatibility**: Deprecated methods
✅ **Different Models**: Multiple LLM and embedding providers
✅ **Real-world Use Cases**: Practical scenarios and examples

---

## Test Statistics

| API Category | Test File | Test Count | Status |
|-------------|-----------|------------|--------|
| Pipes | pipes.test.ts | 14 | ✅ Created |
| Memory | memory.test.ts | 13 | ✅ Created |
| Threads | threads.test.ts | 11 | ✅ Created |
| Tools | tools.test.ts | 9 | ✅ Created |
| Agent | agent.test.ts | 18 | ✅ Created |
| Parser | parser.test.ts | 18 | ✅ Created |
| Chunker | chunker.test.ts | 17 | ✅ Created |
| Embed | embed.test.ts | 26 | ✅ Created |
| Images | images.test.ts | 13 | ✅ Created |
| Utilities | utilities.test.ts | 30+ | ✅ Created |
| Legacy Pipe | pipes/pipes.test.ts | 4 | ✅ Updated |

**Total**: 173+ comprehensive tests covering all Langbase SDK methods

---

## Notes

### Test Execution

- Tests make **real API calls** to Langbase endpoints
- Ensure valid API keys are set in `.env` file
- Some tests may take longer due to API processing (embeddings, image generation)
- Tests for external services (Spider, Firecrawl, Exa) will skip if API keys are not provided

### ⚠️ Important: API Usage Limits

These are **integration tests** that make real API calls. When running the full test suite:

- **Free Plan Limits**: You will hit usage limits quickly (chunkerRuns, embedRuns, etc.)
- **Rate Limits**: 25 req/min on free tier - running 170+ tests will cause 429 errors
- **Solution Options**:
  1. Run tests selectively (one file at a time)
  2. Upgrade to Pro plan (300 req/min)
  3. Use mocked tests for development (see TEST_RESULTS.md)
  4. Run tests in CI/CD with delays between suites

See `TEST_RESULTS.md` for detailed error explanations and solutions.

### Future Enhancements

Potential areas for expansion:
- Mock tests for offline development
- Performance benchmarks
- Load testing for rate limits
- End-to-end workflow tests
- React hooks testing (already exists: `use-pipe.ui.test.ts`)

---

## Troubleshooting

### Common Issues

1. **404 Errors**: Verify pipe names in .env match existing pipes in your Langbase account
2. **Authentication Errors**: Ensure LANGBASE_API_KEY is valid and not expired
3. **Rate Limiting**: Tests may fail if hitting rate limits - add delays or run fewer tests concurrently
4. **Timeout Errors**: Increase timeout values for slow API responses
5. **Path Alias Errors**: Verify vitest.node.config.js has correct path alias configuration

---

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Add descriptive test names
3. Include both success and failure cases
4. Test edge cases and boundary conditions
5. Update this document with new test information
6. Ensure tests are independent and idempotent
7. Use appropriate timeouts for async operations
8. Handle missing API keys gracefully (skip tests)

---

Generated: 2025-11-05
SDK Version: 1.2.4
Test Framework: Vitest
