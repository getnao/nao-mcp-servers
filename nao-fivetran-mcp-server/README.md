# Fivetran MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server designed by [Nao Labs](https://getnao.io) to interact with Fivetran. It lets AI assistants manage your Fivetran pipelines — connectors, destinations, groups, and users.

## Features

- **Connections (Connectors):** List, create, update, pause, resume, and inspect connectors; generate Connect Cards for user-managed setup
- **Destinations:** List, create, update, and inspect sync destinations
- **Groups:** Organize connectors with groups; manage group membership and properties
- **Users:** List users, update user details, and manage role assignments across groups and connections

## How to Install

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "fivetran-nao": {
      "command": "npx",
      "args": ["-y", "@getnao/fivetran-mcp-server@latest"],
      "env": {
        "FIVETRAN_BASE_64_API_KEY": "<YOUR_FIVETRAN_BASE_64_API_KEY>"
      }
    }
  }
}
```

## Configuration

| Variable | Description |
|---|---|
| `FIVETRAN_BASE_64_API_KEY` | Your Fivetran API key, Base64-encoded (`key:secret`) |

### Output format

By default the server returns **JSON** output. Add `--md` to args to switch to **Markdown** (tables and bullet points):

```json
"args": ["-y", "@getnao/fivetran-mcp-server@latest", "--md"]
```

## Available Tools

### Connections

| Tool | Description |
|---|---|
| `fivetran-list-connections` | List all connectors in the account |
| `fivetran-get-connection-details` | Get details of a specific connector |
| `fivetran-get-connection-state` | Get the current state of a connector |
| `fivetran-create-connection` | Create a new connector |
| `fivetran-modify-connection` | Update a connector's configuration |
| `fivetran-modify-connection-state` | Pause or resume a connector |
| `fivetran-create-connect-card` | Generate a Connect Card for user-managed connector setup |

### Destinations

| Tool | Description |
|---|---|
| `fivetran-list-destinations` | List all destinations in the account |
| `fivetran-get-destination-details` | Get details of a specific destination |
| `fivetran-create-destination` | Create a new destination in a group |
| `fivetran-modify-destination` | Update a destination's configuration |

### Groups

| Tool | Description |
|---|---|
| `fivetran-list-groups` | List all groups in the account |
| `fivetran-create-group` | Create a new group |
| `fivetran-modify-group` | Update a group's properties |
| `fivetran-list-users-in-group` | List all users in a group |
| `fivetran-add-user-to-group` | Add a user to a group with a specific role |

### Users

| Tool | Description |
|---|---|
| `fivetran-list-all-users` | List all users in the account |
| `fivetran-get-user-details` | Get details of a specific user |
| `fivetran-modify-user` | Update a user's properties |
| `fivetran-update-user-connection-membership` | Update a user's role in a specific connection |
| `fivetran-update-user-group-membership` | Update a user's role in a specific group |
