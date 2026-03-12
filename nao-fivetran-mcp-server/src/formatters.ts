// Generic helpers
const safe = (v: any): string =>
  v === null || v === undefined ? "—" : String(v);
const truncate = (s: string, max = 200): string =>
  s && s.length > max ? s.slice(0, max) + "…" : (s ?? "");
const capitalize = (s: string): string =>
  s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const ROW_LIMIT = 200;

// Fields to exclude from almost all outputs to reduce noise
// Fivetran often has large 'config' and 'setup_tests' objects that are noisy
const NOISE_FIELDS = new Set([
  "setup_guide",
  "setup_tests",
  "config",
  "html_url",
  "connect_card_config",
]);

// Preferred fields for specific models
const MODEL_FIELDS: Record<string, string[]> = {
  connection: [
    "id",
    "service",
    "schema",
    "paused",
    "status.setup_state",
    "status.sync_state",
  ],
  destination: ["id", "service", "region", "time_zone", "status.setup_state"],
  group: ["id", "name", "created_at"],
  user: ["id", "email", "given_name", "family_name", "role"],
};

/**
 * Formats a list of items as a Markdown table.
 */
function formatTable(items: any[], fields?: string[]): string {
  if (!items || items.length === 0) {
    return "_No items found._";
  }

  // Auto-detect columns if not provided
  const cols =
    fields ||
    Object.keys(items[0])
      .filter((k) => !NOISE_FIELDS.has(k) && typeof items[0][k] !== "object")
      .slice(0, 10);

  if (cols.length === 0) {
    return "_Items found but no displayable fields._";
  }

  const header = `| ${cols.map(capitalize).join(" | ")} |`;
  const separator = `| ${cols.map(() => "---").join(" | ")} |`;
  const rows = items.slice(0, ROW_LIMIT).map((item) => {
    return `| ${cols
      .map((c) => {
        // Handle nested properties like 'status.sync_state'
        const val = c.includes(".")
          ? c.split(".").reduce((obj: any, key) => obj?.[key], item)
          : item[c];
        return truncate(safe(val), 80);
      })
      .join(" | ")} |`;
  });

  const result = [header, separator, ...rows];
  if (items.length > ROW_LIMIT) {
    result.push(`\n_Showing ${ROW_LIMIT} of ${items.length} items._`);
  }
  return result.join("\n");
}

/**
 * Formats a single object as a list of key-value pairs or sections.
 */
function formatObject(data: any, fields?: string[]): string {
  if (!data) {
    return "No data returned.";
  }

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
      return `\n### ${capitalize(k)} (${v.length} total)\n${formatTable(v)}`;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // Handle small nested objects like 'status'
      if (k === "status") {
        const statusLines = Object.entries(v)
          .map(([sk, sv]) => `  - **${capitalize(sk)}:** ${safe(sv)}`)
          .join("\n");
        return `- **Status:**\n${statusLines}`;
      }
      return `- **${capitalize(k)}:** ${JSON.stringify(v)}`;
    }
    return `- **${capitalize(k)}:** ${truncate(safe(v), 500)}`;
  });

  return lines.join("\n");
}

/**
 * Main entry point for formatting any Fivetran API response.
 */
export function format(
  data: any,
  options: { model?: string; title?: string } = {},
): string {
  if (!data) {
    return "No data returned.";
  }

  // Fivetran API wraps data in a "data" property
  const payload = data.data || data;
  const { model, title } = options;
  const lines: string[] = [];

  if (title) {
    lines.push(`## ${title}`);
  }

  // Handle lists (Fivetran wraps lists in "items" property)
  const items = payload.items || (Array.isArray(payload) ? payload : null);

  if (items) {
    lines.push(formatTable(items, MODEL_FIELDS[model as string]));
  } else {
    // Single Object
    lines.push(formatObject(payload, MODEL_FIELDS[model as string]));
  }

  return lines.join("\n").trim();
}
