# Langbase CLI

Langbase CLI is a command line interface for Langbase. It allows you to interact with Langbase from the command line.

# Documentation

Please follow the [Langbase documentation](https://langbase.com/docs) for the latest information.

## Installation

```bash
npx @langbase/cli
```

# Usage

### DOCS MCP Server

Integrate the Langbase Docs MCP server into Cursor IDE.

#### Cursor

```
{
  "mcpServers": {
    "Langbase": {
      "command": "npx",
      "args": ["@langbase/cli","docs-mcp-server"]
    }
  }
}
```
