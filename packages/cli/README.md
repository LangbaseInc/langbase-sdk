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
        "args": ["@langbase/cli","docs-mcp-server"]
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

## Next steps

- Read the [Langbase SDK documentation](https://langbase.com/docs/sdk) for more details
- Join our [Discord](https://langbase.com/discord) community for feedback, requests, and support
