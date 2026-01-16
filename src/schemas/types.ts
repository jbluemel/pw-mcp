import { z } from 'zod';

// Input schema for describe_table tool
export const DescribeTableInputSchema = z.object({
  table_name: z.string().describe('Name of the table to describe'),
});

export type DescribeTableInput = z.infer<typeof DescribeTableInputSchema>;

// Input schema for query_database tool
export const QueryDatabaseInputSchema = z.object({
  sql: z.string().describe('SQL SELECT query to execute'),
});

export type QueryDatabaseInput = z.infer<typeof QueryDatabaseInputSchema>;

// Output type for describe_table (column info)
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
}

// Output type for query results
export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
}
