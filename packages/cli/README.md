# Langbase CLI

The Langbase CLI is a command-line interface for Langbase. It provides a set of commands to interact with the Langbase SDK and perform various tasks related to AI development.

## Usage

### Langbase Docs MCP Server

Integrate the Langbase Docs MCP server into your IDEs and Claude Desktop.

#### Cursor

- Open Cursor settings
- Navigate to the MCP settings
- Click on the `+` button to add a new global MCP server
- Paste the following configuration in the `mcp.json` file:

```json
{
	"mcpServers": {
		"Langbase": {
			"command": "npx",
			"args": ["@langbase/cli", "docs-mcp-server"]
		}
	}
}
```

#### Windsurf

- Navigate to Windsurf - Settings > Advanced Settings
- You will find the option to Add Server
- Click “Add custom server +”
- Paste the following configuration in the `mcp_config.json` file:

```json
{
	"mcpServers": {
		"Langbase": {
			"command": "npx",
			"args": ["@langbase/cli", "docs-mcp-server"]
		}
	}
}
```

#### Claude Desktop

- Open Claude Desktop File Menu
- Navigate to the settings
- Go to Developer Tab
- Click on the Edit Config button
- Paste the following configuration in the `claude_desktop_config.json` file:

```json
{
	"mcpServers": {
		"Langbase": {
			"command": "npx",
			"args": ["@langbase/cli", "docs-mcp-server"]
		}
	}
}
```

## CLI Commands

Get started with the Langbase CLI by running the following command:

```bash
npx @langbase/cli help
```

### Pipe Agent

The CLI provides commands to manage your Langbase pipes.

- Create a new pipe agent

```bash
npx @langbase/cli pipe
```

- Run a pipe agent

```bash
npx @langbase/cli pipe --run
```

- List all pipe agents

```bash
npx @langbase/cli pipe --listPipes
```

- Update a pipe agent

```bash
npx @langbase/cli pipe --update
```

### Memory

The CLI provides commands to manage your Langbase memories.

- Create a new memory

```bash
npx @langbase/cli memory
```

- Upload a document to memory

```bash
npx @langbase/cli memory --upload
```

- List all memories

```bash
npx @langbase/cli memory --listMemories
```

- Retrieve chunks from memory

```bash
npx @langbase/cli memory --retrieve
```

- List all documents in memory

```bash
npx @langbase/cli memory --listDocs
```

- Retry embedding of a document in a memory

```bash
npx @langbase/cli memory --embed
```

- Delete a memory

```bash
npx @langbase/cli memory --delete
```

## Next steps

- Read the [Langbase SDK documentation](https://langbase.com/docs/sdk) for more details
- Join our [Discord](https://langbase.com/discord) community for feedback, requests, and support
