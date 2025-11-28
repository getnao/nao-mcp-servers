# nao-mcp-server
***
A library of Model Context Protocol servers for various integrations.

## nao-metabase-mcp-server
```
{
  "mcpServers": {
    "metabase-nao": {
      "command": "npx",
      "args": [
        "-y",
        "@getnao/metabase-mcp-server@latest"
      ],
      "env": {
        "METABASE_URL": <YOUR_METABASE_URL>,
        "METABASE_API_KEY": <YOUR_METABASE_API_KEY>
      },
    }
  }
}
```
