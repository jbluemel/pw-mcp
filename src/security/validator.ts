import { ALLOWED_TABLES } from '../config/allowlist.js';

// Block these SQL operations (read-only server)
const WRITE_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'TRUNCATE', 'GRANT', 'REVOKE', 'COPY'
];

/**
 * Extract table names referenced in a SQL query
 */
export function extractTableReferences(sql: string): Set<string> {
  // Remove comments
  let cleanSql = sql
    .replace(/--.*$/gm, '')           // Single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
    .toLowerCase();

  const tables = new Set<string>();

  // Patterns: FROM table, JOIN table, FROM schema.table
  const patterns = [
    /\bfrom\s+([a-z_][a-z0-9_]*)/g,
    /\bjoin\s+([a-z_][a-z0-9_]*)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleanSql)) !== null) {
      // Handle schema.table - take just the table name
      const table = match[1].split('.').pop()!;
      tables.add(table);
    }
  }

  return tables;
}

/**
 * Validate a SQL query for safety and allowlist compliance
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateQuery(sql: string): { valid: true } | { valid: false; error: string } {
  const sqlUpper = sql.toUpperCase();

  // Check for write operations
  for (const keyword of WRITE_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`);
    if (pattern.test(sqlUpper)) {
      return {
        valid: false,
        error: `Write operations (${keyword}) are not allowed. This server is read-only.`
      };
    }
  }

  // Extract and validate table references
  const referencedTables = extractTableReferences(sql);

  // Allow queries without FROM (e.g., SELECT 1, SELECT current_date)
  if (referencedTables.size === 0) {
    return { valid: true };
  }

  // Check all tables are in allowlist
  const unauthorized: string[] = [];
  for (const table of referencedTables) {
    if (!ALLOWED_TABLES.has(table)) {
      unauthorized.push(table);
    }
  }

  if (unauthorized.length > 0) {
    const allowedList = Array.from(ALLOWED_TABLES).join(', ');
    return {
      valid: false,
      error: `Query references unauthorized table(s): ${unauthorized.join(', ')}. Allowed tables: ${allowedList}`
    };
  }

  return { valid: true };
}
