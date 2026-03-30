# Metabase MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server designed by [Nao Labs](https://getnao.io) to interact with Metabase. It lets AI assistants query, create, and manage your Metabase instance — questions, dashboards, databases, collections, and more.

## Features

- **Cards (Questions):** List, get, create, update, and execute saved questions — including metric and model card types with full visualization settings
- **Native Queries:** Run raw SQL or MBQL queries directly, and export results as CSV, JSON, or XLSX
- **Dashboards:** List, get, create, and update dashboards with configurable dashcard layouts
- **Databases:** List connected databases, explore schemas, and fetch table/field metadata
- **Collections:** Browse collections and their contents (questions, dashboards)
- **Search:** Full-text search across questions, dashboards, collections, and tables
- **Users:** Get current user info and list all users (admin)
- **Activity:** Retrieve recent activity feed and recently viewed items

## How to Install

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "metabase-nao": {
      "command": "npx",
      "args": ["-y", "@getnao/metabase-mcp-server@latest"],
      "env": {
        "METABASE_URL": "<YOUR_METABASE_URL>",
        "METABASE_API_KEY": "<YOUR_METABASE_API_KEY>"
      }
    }
  }
}
```

## Configuration

| Variable | Description |
|---|---|
| `METABASE_URL` | Base URL of your Metabase instance (e.g. `https://metabase.example.com`) |
| `METABASE_API_KEY` | Your Metabase API key |

### Output format

By default the server returns **JSON** output. Add `--md` to args to switch to **Markdown** (tables and bullet points):

```json
"args": ["-y", "@getnao/metabase-mcp-server@latest", "--md"]
```

## Available Tools

### Cards (Questions)

| Tool | Description |
|---|---|
| `metabase-list-questions` | List all saved questions/cards |
| `metabase-get-question` | Get details of a specific question by ID |
| `metabase-execute-question` | Execute a saved question and return results |
| `metabase-create-question` | Create a new question/card |
| `metabase-update-question` | Update an existing question/card |

### Native Queries

| Tool | Description |
|---|---|
| `metabase-execute-native-query` | Execute a native SQL or MBQL query |
| `metabase-export-query-results` | Execute a query and export results (csv, json, xlsx) |

### Dashboards

| Tool | Description |
|---|---|
| `metabase-list-dashboards` | List all dashboards |
| `metabase-get-dashboard` | Get a dashboard and its cards |
| `metabase-create-dashboard` | Create a new dashboard |
| `metabase-update-dashboard` | Update a dashboard's details or dashcards |

### Databases

| Tool | Description |
|---|---|
| `metabase-list-databases` | List all connected databases |
| `metabase-get-database-metadata` | Get tables and fields for a database |
| `metabase-get-database-schemas` | Get available schemas for a database |

### Tables & Fields

| Tool | Description |
|---|---|
| `metabase-get-table-metadata` | Get metadata for a specific table |
| `metabase-update-table-metadata` | Update metadata for a specific table |
| `metabase-update-field-metadata` | Update metadata for a specific field/column |

### Collections

| Tool | Description |
|---|---|
| `metabase-list-collections` | List all collections |
| `metabase-get-collection-items` | Get all items in a collection |

### Search

| Tool | Description |
|---|---|
| `metabase-search-metabase` | Search across questions, dashboards, collections, and tables |

### Activity

| Tool | Description |
|---|---|
| `metabase-get-recent-activity` | Get the recent activity feed |
| `metabase-get-recent-views` | Get recently viewed items for the current user |

### Users

| Tool | Description |
|---|---|
| `metabase-get-current-user` | Get info about the authenticated user |
| `metabase-list-users` | List all users (requires admin) |
