// Generic helpers
const safe = (v: any): string =>
  v === null || v === undefined ? "—" : String(v);
const truncate = (s: string, max = 200): string =>
  s && s.length > max ? s.slice(0, max) + "…" : (s ?? "");
const capitalize = (s: string): string =>
  s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const ROW_LIMIT = 200;

// Fields to exclude from almost all outputs to reduce noise
const NOISE_FIELDS = new Set([
  "visualization_settings",
  "dataset_query",
  "result_metadata",
  "creator_id",
  "made_public_by_id",
  "embedding_params",
  "last_edit_info",
  "moderation_reviews",
  "collection_authority_level",
  "parameter_mappings",
  "points_of_interest",
  "caveats",
  "show_in_getting_started",
  "entity_id",
  "collection_position",
  "archived",
  "revision_last_updated",
]);

// Preferred fields for specific models (White list for important info)
const MODEL_FIELDS: Record<string, string[]> = {
  card: ["id", "name", "display", "collection_id", "description"],
  dashboard: ["id", "name", "collection_id", "description"],
  database: ["id", "name", "engine", "description"],
  table: ["id", "name", "schema", "db_id", "description"],
  field: ["id", "name", "base_type", "semantic_type", "description"],
  collection: ["id", "name", "location", "description"],
  user: ["id", "email", "first_name", "last_name", "is_superuser"],
  activity: ["timestamp", "topic", "model", "model_id", "user_id"],
};

/**
 * Formats a list of items as a Markdown table.
 */
function formatTable(items: any[], fields?: string[]): string {
  if (!items || items.length === 0) return "_No items found._";

  // Auto-detect columns if not provided
  const cols =
    fields ||
    Object.keys(items[0])
      .filter((k) => !NOISE_FIELDS.has(k) && typeof items[0][k] !== "object")
      .slice(0, 10);

  if (cols.length === 0) return "_Items found but no displayable fields._";

  const header = `| ${cols.map(capitalize).join(" | ")} |`;
  const separator = `| ${cols.map(() => "---").join(" | ")} |`;
  const rows = items.slice(0, ROW_LIMIT).map((item) => {
    return `| ${cols
      .map((c) => {
        // Handle nested properties like 'collection.name'
        const val = c.includes(".")
          ? c.split(".").reduce((obj: any, key) => obj?.[key], item)
          : item[c];
        return truncate(safe(val), 80);
      })
      .join(" | ")} |`;
  });

  const result = [header, separator, ...rows];
  if (items.length > ROW_LIMIT) {
    result.push(
      `\n_Showing ${ROW_LIMIT} of ${items.length} items. Refine your query to see more._`,
    );
  }
  return result.join("\n");
}

/**
 * Formats a single object as a list of key-value pairs or sections.
 */
function formatObject(data: any, fields?: string[]): string {
  if (!data) return "No data returned.";

  const entries = fields
    ? fields.map((f) => [
        f,
        f.includes(".")
          ? f.split(".").reduce((obj: any, key) => obj?.[key], data)
          : data[f],
      ])
    : Object.entries(data).filter(([k]) => !NOISE_FIELDS.has(k));

  const lines = entries.map(([k, v]) => {
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") {
      // Nested tables (e.g., dashcards in dashboard, tables in database)
      return `\n### ${capitalize(k)} (${v.length} total)\n${formatTable(v)}`;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // Small nested objects (e.g., creator, collection)
      const name =
        v.display_name ?? v.name ?? v.email ?? v.id ?? JSON.stringify(v);
      return `- **${capitalize(k)}:** ${name}`;
    }
    return `- **${capitalize(k)}:** ${truncate(safe(v), 500)}`;
  });

  return lines.join("\n");
}

/**
 * Specialized formatter for SQL/MBQL query results.
 */
function formatQueryResults(data: any): string {
  const inner = data.data ?? data;
  const cols: any[] = inner.cols ?? inner.columns ?? [];
  const rows: any[][] = inner.rows ?? [];

  if (cols.length === 0 && rows.length === 0) return "No results returned.";

  const headers = cols.map((c: any) => c.display_name ?? c.name ?? "?");
  const separator = headers.map(() => "---");
  const displayRows = rows.slice(0, ROW_LIMIT);

  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...displayRows.map((row) => `| ${row.map((v) => safe(v)).join(" | ")} |`),
  ];

  if (rows.length > ROW_LIMIT) {
    lines.push(`\n_Showing ${ROW_LIMIT} of ${rows.length} rows._`);
  } else {
    lines.push(`\n_${rows.length} row${rows.length !== 1 ? "s" : ""}_`);
  }

  return lines.join("\n");
}

/**
 * Main entry point for formatting any Metabase API response.
 */
export function format(
  data: any,
  options: { model?: string; title?: string; query?: string } = {},
): string {
  if (!data) return "No data returned.";

  const { model, title, query } = options;
  const lines: string[] = [];

  if (title) lines.push(`## ${title}`);
  if (query) lines.push(`**Query:** \`${query}\`\n`);

  // Handle Query Results (Special Case)
  if ((data.cols && data.rows) || (data.data?.cols && data.data?.rows)) {
    lines.push(formatQueryResults(data));
    return lines.join("\n");
  }

  // Handle lists
  const items = Array.isArray(data)
    ? data
    : data.data && Array.isArray(data.data)
      ? data.data
      : null;

  if (items) {
    // If it's a search result with mixed models, group them
    const hasMultipleModels =
      items.length > 0 && new Set(items.map((i: any) => i.model)).size > 1;
    if (hasMultipleModels) {
      const grouped: Record<string, any[]> = {};
      items.forEach((item: any) => {
        const m = item.model ?? "unknown";
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push(item);
      });

      for (const [m, group] of Object.entries(grouped)) {
        lines.push(`### ${capitalize(m)}s (${group.length})`);
        lines.push(formatTable(group, MODEL_FIELDS[m]));
        lines.push("");
      }
    } else {
      const m = model || (items.length > 0 ? items[0].model : null);
      lines.push(formatTable(items, MODEL_FIELDS[m as string]));
    }
  } else {
    // Single Object
    const m = model || data.model;
    lines.push(formatObject(data, MODEL_FIELDS[m as string]));
  }

  return lines.join("\n").trim();
}
