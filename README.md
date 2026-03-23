# nao-mcp-servers

[![MCPAmpel](https://img.shields.io/endpoint?url=https://mcpampel.com/badge/getnao/nao-mcp-servers.json)](https://mcpampel.com/repo/getnao/nao-mcp-servers)

---

A library of Model Context Protocol servers for various integrations.

## Output format

By default, both servers return **JSON** output. You can switch to **Markdown** output by adding the `--md` flag to the `args` array. Markdown uses tables and bullet points for a more readable format, while JSON is better suited for programmatic use.

To enable Markdown output, add `"--md"` to the args:

```json
"args": ["-y", "@getnao/metabase-mcp-server@latest", "--md"]
```

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
