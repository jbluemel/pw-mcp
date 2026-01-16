import { pool } from './connection.js';
import { ColumnInfo, QueryResult } from '../schemas/types.js';
import { getAllowedTables, isTableAllowed } from '../config/allowlist.js';
import { validateQuery } from '../security/validator.js';

/**
 * List all allowed tables
 */
export async function listTables(): Promise<string[]> {
  return getAllowedTables();
}

/**
 * Describe a table's schema (columns, types, nullability)
 */
export async function describeTable(tableName: string): Promise<ColumnInfo[]> {
  if (!isTableAllowed(tableName)) {
    throw new Error("Table '" + tableName + "' is not in the allowlist");
  }

  const query = `
    SELECT
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    ORDER BY ordinal_position
  `;

  const result = await pool.query(query, [tableName.toLowerCase()]);

  if (result.rows.length === 0) {
    throw new Error("Table '" + tableName + "' not found in database");
  }

  return result.rows.map(row => ({
    column_name: row.column_name,
    data_type: row.data_type,
    is_nullable: row.is_nullable === 'YES',
  }));
}

/**
 * Execute a validated SQL query
 */
export async function executeQuery(sql: string): Promise<QueryResult> {
  const validation = validateQuery(sql);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const result = await pool.query(sql);
  const columns = result.fields.map(f => f.name);

  return {
    columns,
    rows: result.rows,
    row_count: result.rows.length,
  };
}
