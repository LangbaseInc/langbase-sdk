# Memory Enhancement Methods

The Langbase SDK now includes enhanced memory methods that allow for easier content upload and integration with web tools.

## New Methods

### 1. `memories.uploadText()`

Upload text content directly to memory without file handling.

```typescript
import { Langbase } from 'langbase';

const langbase = new Langbase({
  apiKey: 'your-langbase-api-key'
});

await langbase.memories.uploadText({
  memoryName: 'my-memory',
  text: 'Your text content here...',
  documentName: 'optional-document-name.txt', // Optional: will auto-generate if not provided
  meta: {
    type: 'user-content',
    source: 'api-upload'
  }
});
```

**Parameters:**
- `memoryName`: Name of the target memory
- `text`: Text content to upload
- `documentName` (optional): Custom document name. Auto-generates if not provided
- `meta` (optional): Metadata key-value pairs

### 2. `memories.uploadFromSearch()`

Search the web and upload results directly to memory.

```typescript
await langbase.memories.uploadFromSearch({
  memoryName: 'my-memory',
  query: 'What is artificial intelligence?',
  service: 'exa',
  totalResults: 5,
  domains: ['https://example.com'], // Optional: restrict to specific domains
  apiKey: 'your-exa-api-key',
  documentNamePrefix: 'ai-search', // Optional: prefix for generated document names
  meta: {
    topic: 'artificial-intelligence',
    source: 'web-search'
  }
});
```

**Parameters:**
- `memoryName`: Name of the target memory
- `query`: Search query to execute
- `service`: Search service to use (currently supports 'exa')
- `totalResults` (optional): Number of results to retrieve
- `domains` (optional): List of domains to restrict search to
- `apiKey`: API key for the search service
- `documentNamePrefix` (optional): Prefix for generated document names
- `meta` (optional): Metadata applied to all uploaded documents

### 3. `memories.uploadFromCrawl()`

Crawl URLs and upload the content directly to memory.

```typescript
await langbase.memories.uploadFromCrawl({
  memoryName: 'my-memory',
  url: ['https://example.com', 'https://example.com/about'],
  maxPages: 2,
  apiKey: 'your-crawl-api-key',
  service: 'spider', // or 'firecrawl'
  documentNamePrefix: 'website-content',
  meta: {
    source: 'web-crawl',
    website: 'example.com'
  }
});
```

**Parameters:**
- `memoryName`: Name of the target memory
- `url`: Array of URLs to crawl
- `maxPages` (optional): Maximum pages to crawl per URL
- `apiKey`: API key for the crawl service
- `service` (optional): Crawl service to use ('spider' or 'firecrawl')
- `documentNamePrefix` (optional): Prefix for generated document names
- `meta` (optional): Metadata applied to all uploaded documents

## Return Values

- `uploadText()`: Returns a `Promise<Response>` with the upload response
- `uploadFromSearch()`: Returns a `Promise<Response[]>` with responses for each search result
- `uploadFromCrawl()`: Returns a `Promise<Response[]>` with responses for each crawled page

## Content Format

For search and crawl methods, the uploaded content includes both the URL and the content for better context:

```
URL: https://example.com/page

Content:
[Page content here...]
```

## Metadata

All methods automatically add source metadata to help track the origin of content:

- `uploadFromSearch()` adds: `source: 'web-search'`, `query`, `url`, `searchService`
- `uploadFromCrawl()` adds: `source: 'web-crawl'`, `url`, `crawlService`, `domain`

## Examples

See the `/examples/nodejs/memory/` directory for complete working examples:

- `memory.upload-text.ts`: Basic text upload example
- `memory.upload-from-search.ts`: Web search and upload example
- `memory.upload-from-crawl.ts`: Web crawl and upload example