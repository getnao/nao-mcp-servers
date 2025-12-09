import { z } from "zod";
import { Tool, axiosInstance } from "./utils.js";

export const tools: Record<string, Tool> = {
  // ==================== QUERIES & CARDS ====================
  "metabase-list-questions": {
    config: {
      title: "List Questions",
      description: "Get all saved questions/cards in Metabase",
      inputSchema: {
        collectionId: z.number().optional().describe("Filter by collection ID"),
      },
    },
    handler: async ({ collectionId }: any) => {
      const url = collectionId
        ? `/api/card?f=all&collection=${collectionId}`
        : `/api/card`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-question": {
    config: {
      title: "Get Question Details",
      description: "Get details of a specific question/card by ID",
      inputSchema: {
        questionId: z.number().describe("Question/Card ID"),
      },
    },
    handler: async ({ questionId }: any) => {
      const response = await axiosInstance.get(`/api/card/${questionId}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-execute-question": {
    config: {
      title: "Execute Question Query",
      description: "Execute a saved question and get the results",
      inputSchema: {
        questionId: z.number().describe("Question/Card ID"),
        parameters: z.record(z.any()).optional().describe("Query parameters"),
      },
    },
    handler: async ({ questionId, parameters }: any) => {
      const response = await axiosInstance.post(
        `/api/card/${questionId}/query`,
        {
          parameters: parameters || {},
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-create-question": {
    config: {
      title: "Create Question",
      description:
        "Create a new question/card in Metabase. IMPORTANT: When type is 'metric', the query.query object MUST include an 'aggregation' field (e.g., 'aggregation': [['count']] or other aggregation functions like sum, avg, etc.)",
      inputSchema: {
        name: z.string().describe("Question name"),
        description: z.string().optional().describe("Question description"),
        databaseId: z.number().describe("Database ID"),
        type: z.enum(["question", "metric", "model"]).describe("Query type"),
        visualization_settings: z
          .object({
            text: z.string().optional().describe("Text for text cards"),
          })
          .describe("Visualization settings"),
        display: z.enum(["table", "text", "chart"]).describe("Display type"),
        query: z
          .object({
            type: z.enum(["query", "native"]),
            database: z.number(),
            native: z
              .object({
                query: z.string(),
              })
              .optional(),
            query: z.any().optional(),
          })
          .describe(
            "Query object (MBQL or native SQL). For metrics, query.query must include 'aggregation' field with an aggregation function like [['count']], [['sum', fieldRef]], etc."
          ),
        collectionId: z
          .number()
          .optional()
          .describe("Collection ID to save to"),
      },
    },
    handler: async ({ query, display, ...config }: any) => {
      const payload: any = {
        dataset_query: query,
        display,
        name: config.name,
        visualization_settings: config.visualization_settings,
        type: config.type,
        description: config.description ?? undefined,
        collection_id: config.collectionId ?? undefined,
      };

      const response = await axiosInstance.post(`/api/card`, payload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== NATIVE QUERIES ====================
  "metabase-execute-native-query": {
    config: {
      title: "Execute Native Query",
      description: "Execute a native SQL query or MBQL query",
      inputSchema: {
        databaseId: z.number().describe("Database ID"),
        query: z.string().describe("SQL query to execute"),
        parameters: z.array(z.any()).optional().describe("Query parameters"),
      },
    },
    handler: async ({ databaseId, query, parameters }: any) => {
      const response = await axiosInstance.post(`/api/dataset`, {
        database: databaseId,
        type: "native",
        native: {
          query,
          template_tags: {},
          parameters: parameters || [],
        },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-export-query-results": {
    config: {
      title: "Export Query Results",
      description:
        "Execute a query and export results in a specific format (csv, json, xlsx)",
      inputSchema: {
        databaseId: z.number().describe("Database ID"),
        query: z.string().describe("SQL query"),
        format: z.enum(["json", "csv", "xlsx"]).describe("Export format"),
      },
    },
    handler: async ({ databaseId, query, format }: any) => {
      const response = await axiosInstance.post(`/api/dataset/${format}`, {
        database: databaseId,
        type: "native",
        native: { query },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== DASHBOARDS ====================
  "metabase-list-dashboards": {
    config: {
      title: "List Dashboards",
      description: "Get all dashboards in Metabase",
      inputSchema: {
        collectionId: z.number().optional().describe("Filter by collection ID"),
      },
    },
    handler: async ({ collectionId }: any) => {
      const url = collectionId
        ? `/api/dashboard?f=all&collection=${collectionId}`
        : "/api/dashboard";

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-dashboard": {
    config: {
      title: "Get Dashboard",
      description: "Get details of a specific dashboard including its cards",
      inputSchema: {
        dashboardId: z.number().describe("Dashboard ID"),
      },
    },
    handler: async ({ dashboardId }: any) => {
      const response = await axiosInstance.get(`/api/dashboard/${dashboardId}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-create-dashboard": {
    config: {
      title: "Create Dashboard",
      description: "Create a new dashboard",
      inputSchema: {
        name: z.string().describe("Dashboard name"),
        description: z.string().optional().describe("Dashboard description"),
        collectionId: z.number().optional().describe("Collection ID"),
      },
    },
    handler: async ({ name, description, collectionId }: any) => {
      const response = await axiosInstance.post(`/api/dashboard`, {
        name,
        description,
        collection_id: collectionId,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-update-dashboard": {
    config: {
      title: "Update Dashboard",
      description:
        "Update an existing dashboard with new details or dashcards.",
      inputSchema: {
        id: z.number().describe("Dashboard ID"),
        name: z.string().optional().describe("Dashboard name"),
        description: z.string().optional().describe("Dashboard description"),
        dashcards: z
          .array(
            z.object({
              col: z
                .number()
                .int()
                .min(0)
                .describe("Column position (must be >= 0)"),
              id: z.number().int().describe("Dashcard ID"),
              card_id: z.number().int().describe("Card ID"),
              row: z
                .number()
                .int()
                .min(0)
                .describe("Row position (must be >= 0)"),
              size_x: z.number().int().min(1).describe("Width (must be >= 1)"),
              size_y: z.number().int().min(1).describe("Height (must be >= 1)"),
            })
          )
          .optional(),
      },
    },
    handler: async ({ id, name, description, dashcards }: any) => {
      const response = await axiosInstance.put(`/api/dashboard/${id}`, {
        name,
        description,
        dashcards,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== DATABASES ====================
  "metabase-list-databases": {
    config: {
      title: "List Databases",
      description: "Get all connected databases",
      inputSchema: {
        includeDetails: z
          .boolean()
          .optional()
          .describe("Include detailed information"),
      },
    },
    handler: async ({ includeDetails }: any) => {
      const url = includeDetails
        ? `/api/database?include=tables`
        : `/api/database`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-database-metadata": {
    config: {
      title: "Get Database Metadata",
      description: "Get metadata (tables, fields) for a database",
      inputSchema: {
        databaseId: z.number().describe("Database ID"),
      },
    },
    handler: async ({ databaseId }: any) => {
      const response = await axiosInstance.get(
        `/api/database/${databaseId}/metadata`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-database-schemas": {
    config: {
      title: "Get Database Schemas",
      description: "Get available schemas for a database",
      inputSchema: {
        databaseId: z.number().describe("Database ID"),
      },
    },
    handler: async ({ databaseId }: any) => {
      const response = await axiosInstance.get(
        `/api/database/${databaseId}/schemas`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== TABLES ====================
  "metabase-get-table-metadata": {
    config: {
      title: "Get Table Metadata",
      description: "Get metadata for a specific table",
      inputSchema: {
        tableId: z.number().describe("Table ID"),
      },
    },
    handler: async ({ tableId }: any) => {
      const response = await axiosInstance.get(
        `/api/table/${tableId}/query_metadata`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-update-table-metadata": {
    config: {
      title: "Update Table Metadata",
      description: "Update metadata for a specific table",
      inputSchema: {
        tableId: z.number().describe("Table ID"),
        description: z
          .string()
          .min(1)
          .describe("New table description")
          .optional(),
      },
    },
    handler: async ({ tableId, description }: any) => {
      const response = await axiosInstance.put(`/api/table/${tableId}`, {
        description,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== FIELDS ====================

  "metabase-update-field-metadata": {
    config: {
      title: "Update Field Metadata",
      description: "Update metadata for a specific field/column",
      inputSchema: {
        fieldId: z.number().describe("Field ID"),
        description: z
          .string()
          .min(1)
          .describe("New field description")
          .optional(),
      },
    },
    handler: async ({ fieldId, description }: any) => {
      const response = await axiosInstance.put(`/api/field/${fieldId}`, {
        description,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== COLLECTIONS ====================
  "metabase-list-collections": {
    config: {
      title: "List Collections",
      description: "Get all collections",
      inputSchema: {},
    },
    handler: async () => {
      const response = await axiosInstance.get(`/api/collection`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-collection-items": {
    config: {
      title: "Get Collection Items",
      description: "Get all items (questions, dashboards) in a collection",
      inputSchema: {
        collectionId: z
          .number()
          .describe('Collection ID (use "root" for root collection)'),
      },
    },
    handler: async ({ collectionId }: any) => {
      const response = await axiosInstance.get(
        `/api/collection/${collectionId}/items`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== SEARCH ====================
  "metabase-search-metabase": {
    config: {
      title: "Search Metabase",
      description:
        "Search for questions, dashboards, collections, tables across Metabase",
      inputSchema: {
        query: z.string().describe("Search query"),
        models: z
          .array(
            z.enum(["card", "dashboard", "collection", "table", "database"])
          )
          .optional()
          .describe("Limit search to specific models"),
      },
    },
    handler: async ({ query, models }: any) => {
      const params = new URLSearchParams({ q: query });
      if (models) {
        models.forEach((m: any) => params.append("models", m));
      }

      const response = await axiosInstance.get(`/api/search?${params}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== ACTIVITY ====================
  "metabase-get-recent-activity": {
    config: {
      title: "Get Recent Activity",
      description: "Get recent activity feed in Metabase",
      inputSchema: {
        limit: z.number().optional().describe("Number of activities to return"),
      },
    },
    handler: async ({ limit }: any) => {
      const url = limit ? `/api/activity?limit=${limit}` : `/api/activity`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-get-recent-views": {
    config: {
      title: "Get Recent Views",
      description: "Get recently viewed items by the current user",
      inputSchema: {},
    },
    handler: async () => {
      const response = await axiosInstance.get(`/api/activity/recent_views`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== USERS ====================
  "metabase-get-current-user": {
    config: {
      title: "Get Current User",
      description: "Get information about the currently authenticated user",
      inputSchema: {},
    },
    handler: async () => {
      const response = await axiosInstance.get(`/api/user/current`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "metabase-list-users": {
    config: {
      title: "List Users",
      description: "Get all users in Metabase (requires admin)",
      inputSchema: {},
    },
    handler: async () => {
      const response = await axiosInstance.get(`/api/user`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },
};

export default tools;
