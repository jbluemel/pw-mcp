// Allowlisted tables - ONLY these tables can be accessed via MCP
export const ALLOWED_TABLES: ReadonlySet<string> = new Set([
   'items',
    'weekly_metrics_summary',
    'weekly_metrics_by_category',
    'weekly_metrics_by_business_category',
    'weekly_metrics_by_industry',
    'weekly_metrics_by_family',
    'weekly_metrics_by_category',
    'weekly_metrics_by_region',
    'weekly_metrics_by_district',
    'weekly_metrics_by_territory',
]);

// Helper function to check if a table is allowed
export function isTableAllowed(tableName: string): boolean {
  return ALLOWED_TABLES.has(tableName.toLowerCase());
}

// Get list of allowed tables as array (for list_tables tool)
export function getAllowedTables(): string[] {
  return Array.from(ALLOWED_TABLES);
}
