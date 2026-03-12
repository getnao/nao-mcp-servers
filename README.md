# nao-mcp-servers

[![MCPAmpel](https://img.shields.io/endpoint?url=https://mcpampel.com/badge/getnao/nao-mcp-servers.json)](https://mcpampel.com/repo/getnao/nao-mcp-servers)

***
A library of Model Context Protocol servers for various integrations.

## metabase-mcp-server
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
      }
    }
  }
}
```

## fivetran-mcp-server
```
{
  "mcpServers": {
    "fivetran-nao": {
      "command": "npx",
      "args": [
        "-y",
        "@getnao/fivetran-mcp-server@latest"
      ],
      "env": {
        "FIVETRAN_BASE_64_API_KEY": <YOUR_FIVETRAN_BASE_64_API_KEY>
      }
    }
  }
}
```
