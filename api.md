# LANGBASE API REFERENCE

## BASE
- **URL**: `https://api.langbase.com`
- **Version**: `v1` (current), `beta` (deprecated, EOL: Feb 28, 2025)
- **Auth**: Bearer token in `Authorization` header

## AUTHENTICATION
```bash
# Header format
Authorization: Bearer <LANGBASE_API_KEY>
```

**Key Types**:
- User API Keys (account-level)
- Org API Keys (org-level)
- Pipe API Keys (pipe-specific)

**Generate**: Langbase Studio → Sidebar → API Keys

## SDK INSTALL
```bash
npm i langbase
pnpm i langbase
yarn add langbase
```

---

## PIPE API

### Run Pipe
`POST /v1/pipes/run`

**Headers**:
```bash
Content-Type: application/json
Authorization: Bearer <PIPE_API_KEY>
LB-LLM-Key: <LLM_API_KEY>  # optional
```

**Request Body**:
```typescript
{
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | ContentType[] | null;
    tool_call_id?: string;
    name?: string;
  }>;
  variables?: Record<string, string>;
  threadId?: string;
  tools?: Array<Tools>;
  memory?: Array<Memory>;
  stream?: boolean;
}
```

**Response Headers**: `lb-thread-id`

**Response**:
```typescript
{
  completion: string;
  raw: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChoiceGenerate[];
    usage: Usage;
    system_fingerprint: string | null;
  };
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/pipes/run \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <PIPE_API_KEY>' \
-d '{
  "messages": [{"role": "user", "content": "Hello!"}]
}'
```

**TypeScript**:
```typescript
import {Pipe} from 'langbase';

const pipe = new Pipe({apiKey: '<PIPE_API_KEY>'});
const {completion} = await pipe.run({
  messages: [{role: 'user', content: 'Hello!'}]
});
```

**Streaming**:
```bash
curl https://api.langbase.com/v1/pipes/run \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <PIPE_API_KEY>' \
-d '{"messages": [{"role": "user", "content": "Hi"}], "stream": true}'
```

```typescript
const {stream} = await pipe.run({
  messages: [{role: 'user', content: 'Hi'}],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

---

### Create Pipe
`POST /v1/pipes`

**Request**:
```typescript
{
  name: string;                    // required
  upsert?: boolean;                // update if exists, default: false
  description?: string;
  status?: 'public' | 'private';   // default: public
  model?: string;                  // provider:model_id, default: openai:gpt-4o-mini
  stream?: boolean;                // default: true
  json?: boolean;                  // default: false
  store?: boolean;                 // default: true
  moderate?: boolean;              // default: false
  top_p?: number;                  // default: 1
  max_tokens?: number;             // default: 1000
  temperature?: number;            // 0-2, default: 0.7
  presence_penalty?: number;       // default: 1
  frequency_penalty?: number;      // default: 1
  stop?: string[];                 // max 4
  tool_choice?: string | object;   // auto | required | tool object
  parallel_tool_calls?: boolean;   // default: true
  messages?: Array<Message>;
  variables?: Record<string, string>;
  tools?: Array<Tool>;
  memory?: Array<Memory>;
  response_format?: ResponseFormat;
}
```

**Response**:
```typescript
{
  name: string;
  description: string;
  status: 'public' | 'private';
  owner_login: string;
  url: string;
  type: 'chat' | 'generate' | 'run';
  api_key: string;
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/pipes \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "name": "my-pipe",
  "description": "My pipe",
  "model": "openai:gpt-4o",
  "temperature": 0.7
}'
```

**TypeScript**:
```typescript
const pipe = await langbase.pipes.create({
  name: 'my-pipe',
  description: 'My pipe',
  model: 'openai:gpt-4o',
  temperature: 0.7
});
```

---

### List Pipes
`GET /v1/pipes`

**cURL**:
```bash
curl https://api.langbase.com/v1/pipes \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
const pipes = await langbase.pipes.list();
```

---

### Update Pipe
`POST /v1/pipes/{pipeName}`

Same params as Create (all optional except name).

**cURL**:
```bash
curl https://api.langbase.com/v1/pipes/my-pipe \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{"temperature": 0.9}'
```

**TypeScript**:
```typescript
const pipe = await langbase.pipes.update({
  name: 'my-pipe',
  temperature: 0.9
});
```

---

## MEMORY API

### Create Memory
`POST /v1/memory`

**Request**:
```typescript
{
  name: string;                           // required
  description?: string;
  embedding_model?: string;               // default: openai:text-embedding-3-large
  chunk_size?: number;                    // default: 10000, max: 30000
  chunk_overlap?: number;                 // default: 2048, must be < chunk_size
  top_k?: number;                         // default: 10, min: 1, max: 100
}
```

**Embedding Models**:
- `openai:text-embedding-3-large`
- `cohere:embed-v4.0`
- `cohere:embed-multilingual-v3.0`
- `cohere:embed-multilingual-light-v3.0`
- `google:text-embedding-004`

**Response**:
```typescript
{
  name: string;
  description: string;
  owner_login: string;
  url: string;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/memory \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "name": "my-memory",
  "description": "My knowledge base",
  "chunk_size": 10000
}'
```

**TypeScript**:
```typescript
const memory = await langbase.memory.create({
  name: 'my-memory',
  description: 'My knowledge base',
  chunk_size: 10000
});
```

---

### List Memory
`GET /v1/memory`

**cURL**:
```bash
curl https://api.langbase.com/v1/memory \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
const memories = await langbase.memory.list();
```

---

### Delete Memory
`DELETE /v1/memory/{memoryName}`

**cURL**:
```bash
curl -X DELETE https://api.langbase.com/v1/memory/my-memory \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
await langbase.memory.delete({name: 'my-memory'});
```

---

### Retrieve Memory (Similarity Search)
`POST /v1/memory/retrieve`

**Request**:
```typescript
{
  query: string;                          // required
  memory: Array<{                         // required
    name: string;
    filters?: MemoryFilters;
  }>;
  topK?: number;                          // default: 20, min: 1, max: 100
}
```

**Filter Types**:
```typescript
type FilterOperator = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'And' | 'Or';
type FilterConnective = 'And' | 'Or';
type FilterValue = string | string[];
type FilterCondition = [string, FilterOperator, FilterValue];
type MemoryFilters = [FilterConnective, MemoryFilters[]] | FilterCondition;
```

**Response**:
```typescript
Array<{
  text: string;
  similarity: number;
  meta: Record<string, string>;
}>
```

**cURL**:
```bash
curl https://api.langbase.com/v1/memory/retrieve \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "query": "What is AI?",
  "memory": [{"name": "my-memory"}],
  "topK": 5
}'
```

**TypeScript**:
```typescript
const results = await langbase.memory.retrieve({
  query: 'What is AI?',
  memory: [{name: 'my-memory'}],
  topK: 5
});
```

**With Filters**:
```typescript
const results = await langbase.memory.retrieve({
  query: 'AI concepts',
  memory: [{
    name: 'my-memory',
    filters: ['And', [
      ['category', 'Eq', 'technical'],
      ['year', 'In', ['2023', '2024']]
    ]]
  }]
});
```

---

## DOCUMENTS API

### Upload Document
Two-step process:

**Step 1**: Get signed URL
`POST /v1/memory/documents`

**Request**:
```typescript
{
  memoryName: string;                     // required
  documentName: string;                   // required (with extension)
  meta?: Record<string, string>;          // max 10 key-value pairs
}
```

**Response**: `{signedUrl: string}`

**Step 2**: Upload file
`PUT {signedUrl}`

**Headers**: `Content-Type: <MIME_TYPE>`
**Body**: File content (Buffer, File, FormData, ReadableStream)
**Max Size**: 10 MB
**Formats**: PDF, TXT, MD, CSV, XLSX, XLS, code files

**cURL**:
```bash
# Step 1: Get signed URL
SIGNED_URL=$(curl https://api.langbase.com/v1/memory/documents \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "memoryName": "my-memory",
  "documentName": "doc.pdf",
  "meta": {"author": "John"}
}' | jq -r .signedUrl)

# Step 2: Upload file
curl -X PUT "$SIGNED_URL" \
-H 'Content-Type: application/pdf' \
--data-binary @doc.pdf
```

**TypeScript**:
```typescript
const file = fs.readFileSync('doc.pdf');

await langbase.memory.documents.upload({
  memoryName: 'my-memory',
  documentName: 'doc.pdf',
  document: file,
  contentType: 'application/pdf',
  meta: {author: 'John'}
});
```

---

### List Documents
`GET /v1/memory/{memoryName}/documents`

**Response**:
```typescript
Array<{
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  status_message: string | null;
  metadata: {
    size: number;
    type: string;
  };
  enabled: boolean;
  chunk_size: number;
  chunk_overlap: number;
  owner_login: string;
}>
```

**cURL**:
```bash
curl https://api.langbase.com/v1/memory/my-memory/documents \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
const docs = await langbase.memory.documents.list({
  memoryName: 'my-memory'
});
```

---

### Delete Document
`DELETE /v1/memory/{memoryName}/documents/{documentName}`

**cURL**:
```bash
curl -X DELETE https://api.langbase.com/v1/memory/my-memory/documents/doc.pdf \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
await langbase.memory.documents.delete({
  memoryName: 'my-memory',
  documentName: 'doc.pdf'
});
```

---

### Retry Embeddings
`GET /v1/memory/{memoryName}/documents/{documentName}/embeddings/retry`

Use when embeddings fail due to rate limits, invalid API keys, parsing errors, corrupted PDFs.

**cURL**:
```bash
curl https://api.langbase.com/v1/memory/my-memory/documents/doc.pdf/embeddings/retry \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
await langbase.memory.documents.retryEmbeddings({
  memoryName: 'my-memory',
  documentName: 'doc.pdf'
});
```

---

## THREADS API

### Create Thread
`POST /v1/threads`

**Request**:
```typescript
{
  threadId?: string;
  metadata?: Record<string, string>;
  messages?: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    name?: string;
    tool_call_id?: string;
    tool_calls?: Array<ToolCall>;
    attachments?: Array<any>;
    metadata?: Record<string, string>;
  }>;
}
```

**Response**:
```typescript
{
  id: string;
  object: "thread";
  created_at: number;
  metadata: Record<string, string>;
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/threads \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "metadata": {"user": "123"},
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

**TypeScript**:
```typescript
const thread = await langbase.threads.create({
  metadata: {user: '123'},
  messages: [{role: 'user', content: 'Hello'}]
});
```

---

### Get Thread
`GET /v1/threads/{threadId}`

**cURL**:
```bash
curl https://api.langbase.com/v1/threads/{threadId} \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
const thread = await langbase.threads.get({threadId: 'thread_123'});
```

---

### Update Thread
`POST /v1/threads/{threadId}`

**Request**:
```typescript
{
  metadata: Record<string, string>;       // required
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/threads/{threadId} \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{"metadata": {"status": "active"}}'
```

**TypeScript**:
```typescript
await langbase.threads.update({
  threadId: 'thread_123',
  metadata: {status: 'active'}
});
```

---

### Delete Thread
`DELETE /v1/threads/{threadId}`

**cURL**:
```bash
curl -X DELETE https://api.langbase.com/v1/threads/{threadId} \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
await langbase.threads.delete({threadId: 'thread_123'});
```

---

### Append Messages
`POST /v1/threads/{threadId}/messages`

**Request**:
```typescript
{
  messages: Array<ThreadMessage>;         // required
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/threads/{threadId}/messages \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "messages": [{"role": "user", "content": "Follow-up question"}]
}'
```

**TypeScript**:
```typescript
await langbase.threads.messages.append({
  threadId: 'thread_123',
  messages: [{role: 'user', content: 'Follow-up question'}]
});
```

---

### List Messages
`GET /v1/threads/{threadId}/messages`

Returns messages in chronological order (oldest first).

**Response**:
```typescript
Array<{
  id: string;
  thread_id: string;
  created_at: number;
  role: string;
  content: string | null;
  tool_call_id: string | null;
  tool_calls: Array<ToolCall> | [];
  name: string | null;
  attachments: Array<any> | [];
  metadata: Record<string, string> | {};
}>
```

**cURL**:
```bash
curl https://api.langbase.com/v1/threads/{threadId}/messages \
-H 'Authorization: Bearer <YOUR_API_KEY>'
```

**TypeScript**:
```typescript
const messages = await langbase.threads.messages.list({
  threadId: 'thread_123'
});
```

---

## TOOLS API

### Crawl
`POST /v1/tools/crawl`

**Headers**:
```bash
Authorization: Bearer <YOUR_API_KEY>
LB-CRAWL-KEY: <CRAWL_KEY>               # Spider/Firecrawl API key
```

**Request**:
```typescript
{
  url: string[];                          // required, max 100
  maxPages?: number;                      // max 50
  service?: 'spider' | 'firecrawl';       // default: spider
}
```

**Response**:
```typescript
Array<{
  url: string;
  content: string;
}>
```

**cURL**:
```bash
curl https://api.langbase.com/v1/tools/crawl \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-H 'LB-CRAWL-KEY: <SPIDER_KEY>' \
-d '{
  "url": ["https://example.com"],
  "maxPages": 10,
  "service": "spider"
}'
```

**TypeScript**:
```typescript
const result = await langbase.tools.crawl({
  url: ['https://example.com'],
  maxPages: 10,
  service: 'spider',
  crawlKey: '<SPIDER_KEY>'
});
```

---

### Web Search
`POST /v1/tools/web-search`

**Headers**:
```bash
Authorization: Bearer <YOUR_API_KEY>
LB-WEB-SEARCH-KEY: <EXA_API_KEY>
```

**Request**:
```typescript
{
  query: string;                          // required
  service: 'exa';                         // required
  totalResults?: number;
  domains?: string[];
}
```

**Response**:
```typescript
Array<{
  url: string;
  content: string;
}>
```

**cURL**:
```bash
curl https://api.langbase.com/v1/tools/web-search \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-H 'LB-WEB-SEARCH-KEY: <EXA_KEY>' \
-d '{
  "query": "AI developments 2024",
  "service": "exa",
  "totalResults": 10
}'
```

**TypeScript**:
```typescript
const results = await langbase.tools.webSearch({
  query: 'AI developments 2024',
  service: 'exa',
  totalResults: 10,
  webSearchKey: '<EXA_KEY>'
});
```

---

## AGENT API

### Agent Run
`POST /v1/agent/run`

Runtime LLM agent with 100+ unified LLM providers.

**Headers**:
```bash
Content-Type: application/json
Authorization: Bearer <YOUR_API_KEY>
LB-LLM-Key: <LLM_API_KEY>               # optional
```

**Request**:
```typescript
{
  model: string;                          // required, provider:model_id
  input: string | Array<InputMessage>;    // required
  instructions?: string;
  stream?: boolean;
  tools?: Array<Tools>;
  tool_choice?: string | object;
  parallel_tool_calls?: boolean;
  mcp_servers?: Array<McpServerSchema>;
  temperature?: number;                   // 0-2, default: 0.7
  top_p?: number;                         // default: 1
  max_tokens?: number;                    // default: 1000
  presence_penalty?: number;              // default: 0
  frequency_penalty?: number;             // default: 0
  stop?: string[];                        // max 4
  customModelParams?: Record<string, any>;
}
```

**Response**: Same as Pipe Run API

**cURL**:
```bash
curl https://api.langbase.com/v1/agent/run \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-H 'LB-LLM-Key: <OPENAI_KEY>' \
-d '{
  "model": "openai:gpt-4o",
  "input": "Explain quantum computing",
  "temperature": 0.7
}'
```

**TypeScript**:
```typescript
const response = await langbase.agent.run({
  model: 'openai:gpt-4o',
  input: 'Explain quantum computing',
  temperature: 0.7
});
```

---

## PARSER API

### Parse Document
`POST /v1/parser`

**Headers**: `Content-Type: multipart/form-data`

**Request**:
```typescript
{
  document: File;                         // required
  documentName: string;                   // required (with extension)
  contentType: string;                    // required (MIME type)
}
```

**Limits**: Max 10 MB, supports TXT, MD, PDF, CSV, XLSX, XLS, code files

**Response**:
```typescript
{
  documentName: string;
  content: string;
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/parser \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-F 'document=@doc.pdf' \
-F 'documentName=doc.pdf' \
-F 'contentType=application/pdf'
```

**TypeScript**:
```typescript
const file = fs.readFileSync('doc.pdf');

const result = await langbase.parser({
  document: file,
  documentName: 'doc.pdf',
  contentType: 'application/pdf'
});
```

---

## CHUNKER API

### Chunk Content
`POST /v1/chunker`

**Request**:
```typescript
{
  content: string;                        // required
  chunkMaxLength?: number;                // 1024-30000, default: 1024
  chunkOverlap?: number;                  // ≥256, <chunkMaxLength, default: 256
}
```

**Response**: `string[]`

**cURL**:
```bash
curl https://api.langbase.com/v1/chunker \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "content": "Long text content...",
  "chunkMaxLength": 2048,
  "chunkOverlap": 512
}'
```

**TypeScript**:
```typescript
const chunks = await langbase.chunker({
  content: 'Long text content...',
  chunkMaxLength: 2048,
  chunkOverlap: 512
});
```

---

## EMBED API

### Generate Embeddings
`POST /v1/embed`

**Request**:
```typescript
{
  chunks: string[];                       // required, max 100, 8192 chars each
  embeddingModel?: string;                // default: openai:text-embedding-3-large
}
```

**Models**:
- `openai:text-embedding-3-large`
- `cohere:embed-v4.0`
- `cohere:embed-multilingual-v3.0`
- `cohere:embed-multilingual-light-v3.0`
- `google:text-embedding-004`

**Response**: `number[][]` (2D array)

**cURL**:
```bash
curl https://api.langbase.com/v1/embed \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-d '{
  "chunks": ["text one", "text two"],
  "embeddingModel": "openai:text-embedding-3-large"
}'
```

**TypeScript**:
```typescript
const embeddings = await langbase.embed({
  chunks: ['text one', 'text two'],
  embeddingModel: 'openai:text-embedding-3-large'
});
```

---

## IMAGES API

### Generate Images
`POST /v1/images`

**Headers**:
```bash
Authorization: Bearer <YOUR_API_KEY>
LB-LLM-Key: <LLM_PROVIDER_KEY>
```

**Request**:
```typescript
{
  prompt: string;                         // required
  model: string;                          // required, provider:model-name
  width?: number;
  height?: number;
  n?: number;                             // default: 1
  steps?: number;
  image_url?: string;                     // for image-to-image
}
```

**Models**: `openai:gpt-image-1`, `together:black-forest-labs/FLUX.1-schnell-Free`, `google:gemini-2.5-flash-image-preview`

**Response**:
```typescript
{
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: Choice[];
  usage: Usage;
}
```

**cURL**:
```bash
curl https://api.langbase.com/v1/images \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <YOUR_API_KEY>' \
-H 'LB-LLM-Key: <OPENAI_KEY>' \
-d '{
  "prompt": "A futuristic city",
  "model": "openai:gpt-image-1",
  "width": 1024,
  "height": 1024
}'
```

**TypeScript**:
```typescript
const result = await langbase.images.generate({
  prompt: 'A futuristic city',
  model: 'openai:gpt-image-1',
  width: 1024,
  height: 1024
});
```

---

## WORKFLOW (SDK-only)

Client-side orchestration primitive for multi-step task execution with timeouts, retries, error handling.

**TypeScript**:
```typescript
import {Langbase} from 'langbase';

const langbase = new Langbase({apiKey: process.env.LANGBASE_API_KEY!});
const workflow = langbase.workflow({debug: true});

// Basic step
const result = await workflow.step({
  id: 'step-1',
  run: async () => 'result'
});

// With timeout & retries
const data = await workflow.step({
  id: 'fetch-data',
  timeout: 5000,
  retries: {
    limit: 3,
    delay: 1000,
    backoff: 'exponential' // exponential | linear | fixed
  },
  run: async () => fetch('https://api.example.com').then(r => r.json())
});

// Parallel steps
const [summary, translation] = await Promise.all([
  workflow.step({
    id: 'summarize',
    run: async () => langbase.agent.run({...})
  }),
  workflow.step({
    id: 'translate',
    run: async () => langbase.agent.run({...})
  })
]);

await workflow.end(); // optional, enables tracing
```

**Config**:
- `debug` (boolean): Log execution details (default: false)

**StepConfig**:
- `id` (string, required): Unique step identifier
- `timeout` (number): Max execution time in ms
- `retries` (RetryConfig): Retry behavior
  - `limit` (number): Max retry attempts
  - `delay` (number): Base delay in ms
  - `backoff` ('exponential' | 'linear' | 'fixed'): Delay strategy
- `run` (Function, required): Step execution function

---

## LIMITS

### Rate Limits

| Plan | Limit |
|------|-------|
| Hobby | 25 req/min |
| Pro | 300 req/min |
| Enterprise | 300 req/min (custom up to 1K/sec) |
| Unauthenticated | 10 req/min |

**Headers**:
- `lb-ratelimit-limit`: Rate limit
- `lb-ratelimit-remaining`: Remaining requests
- `lb-ratelimit-reset`: Reset timestamp

### Usage Limits

| Plan | Monthly Runs | Overage |
|------|--------------|---------|
| Hobby | 500 | None |
| Enterprise | Custom | Custom |

**1 run** = max 1,000 tokens (~750 words)

**Headers**:
- `lb-usagelimit-limit`: Usage limit
- `lb-usagelimit-remaining`: Remaining runs
- `lb-usagelimit-used`: Used runs

---

## ERROR CODES

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| 400 | Bad Request | Invalid request body/params | Verify request format |
| 401 | Unauthorized | Missing/invalid API key | Check API key |
| 403 | Forbidden | Insufficient permissions | Verify permissions |
| 403 | Insufficient Permissions | Lack required permissions | Check RBAC |
| 403 | Usage Exceeded | Monthly limit reached | Upgrade plan |
| 404 | Not Found | Incorrect endpoint | Verify URL |
| 409 | Conflict | Duplicate resource names | Use unique IDs |
| 412 | Precondition Failed | Unmet preconditions | Check headers |
| 429 | Rate Limited | Exceeded rate limits | Wait or upgrade |
| 500 | Internal Server Error | Server issues | Contact support |

---

## DEPRECATED (Beta → v1)

**EOL**: Feb 28, 2025

### Pipe
- `/beta/pipes/run` → `/v1/pipes/run`
- `/beta/generate` → `/v1/pipes/run`
- `/beta/chat` → `/v1/pipes/run`
- `/beta/org/{org}/pipes` → `/v1/pipes`
- `/beta/user/pipes` → `/v1/pipes`
- `/beta/pipes/{owner}/{pipe}` → `/v1/pipes/{pipeName}`

### Memory
- `/beta/org/{org}/memorysets` → `/v1/memory`
- `/beta/user/memorysets` → `/v1/memory`
- `/beta/memorysets/{owner}/{memoryName}` → `/v1/memory/{memoryName}`
- `/beta/memory/retrieve` → `/v1/memory/retrieve`

### Documents
- `/beta/user/memorysets/documents` → `/v1/memory/documents`
- `/beta/org/{org}/memorysets/documents` → `/v1/memory/documents`
- `/beta/memorysets/{owner}/{memoryName}/documents` → `/v1/memory/{memoryName}/documents`

---

## MIGRATION (Beta → v1)

**Changes**:
1. Unified user/org endpoints
2. Simplified request body
3. `model` format: `provider:model_id`
4. `config` → individual properties
5. `memorysets` → `memory`
6. `prompt` → `messages` array
7. New `upsert` property
8. Removed `ownerLogin` from endpoints
