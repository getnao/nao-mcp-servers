import { z } from 'zod';
import { Tool } from './types.js';
import dotenv from "dotenv";

dotenv.config();
const METABASE_URL = process.env.METABASE_URL || 'http://localhost:3000';

if (!METABASE_URL) {
    throw new Error("METABASE_URL must be set in environment variables.");
}

export const tools: Record<string, Tool> = {
    // ==================== QUERIES & CARDS ====================
    'list-questions': {
        config: {
            title: 'List Questions',
            description: 'Get all saved questions/cards in Metabase',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                collectionId: z.number().optional().describe('Filter by collection ID')
            },
            outputSchema: {
                questions: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    description: z.string().nullable(),
                    collection_id: z.number().nullable()
                }))
            }
        },
        handler: async ({ sessionToken, collectionId }: any) => {
            const url = collectionId
                ? `${METABASE_URL}/api/card?f=all&collection=${collectionId}`
                : `${METABASE_URL}/api/card`;

            const response = await fetch(url, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.length} questions`
                }],
                structuredContent: { questions: data }
            };
        }
    },

    'get-question': {
        config: {
            title: 'Get Question Details',
            description: 'Get details of a specific question/card by ID',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                questionId: z.number().describe('Question/Card ID')
            },
            outputSchema: {
                id: z.number(),
                name: z.string(),
                description: z.string().nullable(),
                dataset_query: z.any(),
                display: z.string()
            }
        },
        handler: async ({ sessionToken, questionId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/card/${questionId}`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Question: ${data.name}\nDescription: ${data.description || 'N/A'}`
                }],
                structuredContent: data
            };
        }
    },

    'execute-question': {
        config: {
            title: 'Execute Question Query',
            description: 'Execute a saved question and get the results',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                questionId: z.number().describe('Question/Card ID'),
                parameters: z.record(z.any()).optional().describe('Query parameters')
            },
            outputSchema: {
                rows: z.array(z.array(z.any())),
                cols: z.array(z.any()),
                row_count: z.number()
            }
        },
        handler: async ({ sessionToken, questionId, parameters }: any) => {
            const response = await fetch(`${METABASE_URL}/api/card/${questionId}/query`, {
                method: 'POST',
                headers: {
                    'X-Metabase-Session': sessionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parameters: parameters || {} })
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Query executed successfully. Returned ${data.row_count} rows.`
                }],
                structuredContent: data
            };
        }
    },

    'create-question': {
        config: {
            title: 'Create Question',
            description: 'Create a new question/card in Metabase',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                name: z.string().describe('Question name'),
                description: z.string().optional().describe('Question description'),
                databaseId: z.number().describe('Database ID'),
                query: z.object({
                    type: z.enum(['query', 'native']),
                    database: z.number(),
                    native: z.object({
                        query: z.string()
                    }).optional(),
                    query: z.any().optional()
                }).describe('Query object (MBQL or native SQL)'),
                collectionId: z.number().optional().describe('Collection ID to save to')
            },
            outputSchema: {
                id: z.number(),
                name: z.string()
            }
        },
        handler: async ({ sessionToken, name, description, query, collectionId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/card`, {
                method: 'POST',
                headers: {
                    'X-Metabase-Session': sessionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    dataset_query: query,
                    display: 'table',
                    visualization_settings: {},
                    collection_id: collectionId
                })
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Question "${data.name}" created with ID: ${data.id}`
                }],
                structuredContent: { id: data.id, name: data.name }
            };
        }
    },

    // ==================== NATIVE QUERIES ====================
    'execute-native-query': {
        config: {
            title: 'Execute Native Query',
            description: 'Execute a native SQL query or MBQL query',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                databaseId: z.number().describe('Database ID'),
                query: z.string().describe('SQL query to execute'),
                parameters: z.array(z.any()).optional().describe('Query parameters')
            },
            outputSchema: {
                rows: z.array(z.array(z.any())),
                cols: z.array(z.any()),
                row_count: z.number()
            }
        },
        handler: async ({ sessionToken, databaseId, query, parameters }: any) => {
            const response = await fetch(`${METABASE_URL}/api/dataset`, {
                method: 'POST',
                headers: {
                    'X-Metabase-Session': sessionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    database: databaseId,
                    type: 'native',
                    native: {
                        query,
                        template_tags: {},
                        parameters: parameters || []
                    }
                })
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Query executed. Returned ${data.row_count} rows.`
                }],
                structuredContent: {
                    rows: data.data.rows,
                    cols: data.data.cols,
                    row_count: data.row_count
                }
            };
        }
    },

    'export-query-results': {
        config: {
            title: 'Export Query Results',
            description: 'Execute a query and export results in a specific format (csv, json, xlsx)',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                databaseId: z.number().describe('Database ID'),
                query: z.string().describe('SQL query'),
                format: z.enum(['json', 'csv', 'xlsx']).describe('Export format')
            },
            outputSchema: {
                data: z.string()
            }
        },
        handler: async ({ sessionToken, databaseId, query, format }: any) => {
            const response = await fetch(`${METABASE_URL}/api/dataset/${format}`, {
                method: 'POST',
                headers: {
                    'X-Metabase-Session': sessionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    database: databaseId,
                    type: 'native',
                    native: { query }
                })
            });
            const data = format === 'json' ? await response.json() : await response.text();
            return {
                content: [{
                    type: 'text',
                    text: `Results exported in ${format} format`
                }],
                structuredContent: data
            };
        }
    },

    // ==================== DASHBOARDS ====================
    'list-dashboards': {
        config: {
            title: 'List Dashboards',
            description: 'Get all dashboards in Metabase',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                collectionId: z.number().optional().describe('Filter by collection ID')
            },
            outputSchema: {
                dashboards: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    description: z.string().nullable()
                }))
            }
        },
        handler: async ({ sessionToken, collectionId }: any) => {
            const url = collectionId
                ? `${METABASE_URL}/api/dashboard?f=all&collection=${collectionId}`
                : `${METABASE_URL}/api/dashboard`;

            const response = await fetch(url, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.length} dashboards`
                }],
                structuredContent: { dashboards: data }
            };
        }
    },

    'get-dashboard': {
        config: {
            title: 'Get Dashboard',
            description: 'Get details of a specific dashboard including its cards',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                dashboardId: z.number().describe('Dashboard ID')
            },
            outputSchema: {
                id: z.number(),
                name: z.string(),
                description: z.string().nullable(),
                dashcards: z.array(z.any())
            }
        },
        handler: async ({ sessionToken, dashboardId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/dashboard/${dashboardId}`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Dashboard: ${data.name}\nCards: ${data.dashcards.length}`
                }],
                structuredContent: data
            };
        }
    },

    'create-dashboard': {
        config: {
            title: 'Create Dashboard',
            description: 'Create a new dashboard',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                name: z.string().describe('Dashboard name'),
                description: z.string().optional().describe('Dashboard description'),
                collectionId: z.number().optional().describe('Collection ID')
            },
            outputSchema: {
                id: z.number(),
                name: z.string()
            }
        },
        handler: async ({ sessionToken, name, description, collectionId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/dashboard`, {
                method: 'POST',
                headers: {
                    'X-Metabase-Session': sessionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    collection_id: collectionId
                })
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Dashboard "${data.name}" created with ID: ${data.id}`
                }],
                structuredContent: { id: data.id, name: data.name }
            };
        }
    },

    // ==================== DATABASES ====================
    'list-databases': {
        config: {
            title: 'List Databases',
            description: 'Get all connected databases',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                includeDetails: z.boolean().optional().describe('Include detailed information')
            },
            outputSchema: {
                databases: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    engine: z.string()
                }))
            }
        },
        handler: async ({ sessionToken, includeDetails }: any) => {
            const url = includeDetails
                ? `${METABASE_URL}/api/database?include=tables`
                : `${METABASE_URL}/api/database`;

            const response = await fetch(url, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.data?.length || data.length} databases`
                }],
                structuredContent: { databases: data.data || data }
            };
        }
    },

    'get-database-metadata': {
        config: {
            title: 'Get Database Metadata',
            description: 'Get metadata (tables, fields) for a database',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                databaseId: z.number().describe('Database ID')
            },
            outputSchema: {
                id: z.number(),
                name: z.string(),
                tables: z.array(z.any())
            }
        },
        handler: async ({ sessionToken, databaseId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/database/${databaseId}/metadata`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Database: ${data.name}\nTables: ${data.tables?.length || 0}`
                }],
                structuredContent: data
            };
        }
    },

    'get-database-schemas': {
        config: {
            title: 'Get Database Schemas',
            description: 'Get available schemas for a database',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                databaseId: z.number().describe('Database ID')
            },
            outputSchema: {
                schemas: z.array(z.string())
            }
        },
        handler: async ({ sessionToken, databaseId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/database/${databaseId}/schemas`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const schemas = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${schemas.length} schemas: ${schemas.join(', ')}`
                }],
                structuredContent: { schemas }
            };
        }
    },

    // ==================== TABLES ====================
    'get-table-metadata': {
        config: {
            title: 'Get Table Metadata',
            description: 'Get metadata for a specific table',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                tableId: z.number().describe('Table ID')
            },
            outputSchema: {
                id: z.number(),
                name: z.string(),
                display_name: z.string(),
                fields: z.array(z.any())
            }
        },
        handler: async ({ sessionToken, tableId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/table/${tableId}/query_metadata`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Table: ${data.display_name}\nFields: ${data.fields?.length || 0}`
                }],
                structuredContent: data
            };
        }
    },

    // ==================== COLLECTIONS ====================
    'list-collections': {
        config: {
            title: 'List Collections',
            description: 'Get all collections',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token')
            },
            outputSchema: {
                collections: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    slug: z.string()
                }))
            }
        },
        handler: async ({ sessionToken }: any) => {
            const response = await fetch(`${METABASE_URL}/api/collection`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.length} collections`
                }],
                structuredContent: { collections: data }
            };
        }
    },

    'get-collection-items': {
        config: {
            title: 'Get Collection Items',
            description: 'Get all items (questions, dashboards) in a collection',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                collectionId: z.number().describe('Collection ID (use "root" for root collection)')
            },
            outputSchema: {
                data: z.array(z.any()),
                total: z.number()
            }
        },
        handler: async ({ sessionToken, collectionId }: any) => {
            const response = await fetch(`${METABASE_URL}/api/collection/${collectionId}/items`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.total} items in collection`
                }],
                structuredContent: data
            };
        }
    },

    // ==================== SEARCH ====================
    'search-metabase': {
        config: {
            title: 'Search Metabase',
            description: 'Search for questions, dashboards, collections, tables across Metabase',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                query: z.string().describe('Search query'),
                models: z.array(z.enum(['card', 'dashboard', 'collection', 'table', 'database'])).optional()
                    .describe('Limit search to specific models')
            },
            outputSchema: {
                results: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    model: z.string(),
                    description: z.string().nullable()
                }))
            }
        },
        handler: async ({ sessionToken, query, models }: any) => {
            const params = new URLSearchParams({ q: query });
            if (models) {
                models.forEach((m: any) => params.append('models', m));
            }

            const response = await fetch(`${METABASE_URL}/api/search?${params}`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const results = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${results.data?.length || results.length} results for "${query}"`
                }],
                structuredContent: { results: results.data || results }
            };
        }
    },

    // ==================== ACTIVITY ====================
    'get-recent-activity': {
        config: {
            title: 'Get Recent Activity',
            description: 'Get recent activity feed in Metabase',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token'),
                limit: z.number().optional().describe('Number of activities to return')
            },
            outputSchema: {
                activities: z.array(z.object({
                    id: z.number(),
                    topic: z.string(),
                    timestamp: z.string(),
                    user_id: z.number()
                }))
            }
        },
        handler: async ({ sessionToken, limit }: any) => {
            const url = limit
                ? `${METABASE_URL}/api/activity?limit=${limit}`
                : `${METABASE_URL}/api/activity`;

            const response = await fetch(url, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Retrieved ${data.length} recent activities`
                }],
                structuredContent: { activities: data }
            };
        }
    },

    'get-recent-views': {
        config: {
            title: 'Get Recent Views',
            description: 'Get recently viewed items by the current user',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token')
            },
            outputSchema: {
                views: z.array(z.object({
                    model: z.string(),
                    model_id: z.number(),
                    timestamp: z.string()
                }))
            }
        },
        handler: async ({ sessionToken }: any) => {
            const response = await fetch(`${METABASE_URL}/api/activity/recent_views`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const data = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${data.length} recently viewed items`
                }],
                structuredContent: { views: data }
            };
        }
    },

    // ==================== USERS ====================
    'get-current-user': {
        config: {
            title: 'Get Current User',
            description: 'Get information about the currently authenticated user',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token')
            },
            outputSchema: {
                id: z.number(),
                email: z.string(),
                first_name: z.string(),
                last_name: z.string(),
                is_superuser: z.boolean()
            }
        },
        handler: async ({ sessionToken }: any) => {
            const response = await fetch(`${METABASE_URL}/api/user/current`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const user = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `User: ${user.first_name} ${user.last_name} (${user.email})`
                }],
                structuredContent: user
            };
        }
    },

    'list-users': {
        config: {
            title: 'List Users',
            description: 'Get all users in Metabase (requires admin)',
            inputSchema: {
                sessionToken: z.string().describe('Metabase session token')
            },
            outputSchema: {
                users: z.array(z.object({
                    id: z.number(),
                    email: z.string(),
                    first_name: z.string(),
                    last_name: z.string()
                }))
            }
        },
        handler: async ({ sessionToken }: any) => {
            const response = await fetch(`${METABASE_URL}/api/user`, {
                headers: { 'X-Metabase-Session': sessionToken }
            });
            const users = await response.json();
            return {
                content: [{
                    type: 'text',
                    text: `Found ${users.data?.length || users.length} users`
                }],
                structuredContent: { users: users.data || users }
            };
        }
    }
};

export default tools;
