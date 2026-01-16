import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listTables, describeTable, executeQuery } from './db/queries.js';
import { DescribeTableInputSchema, QueryDatabaseInputSchema } from './schemas/types.js';

const server = new Server(
  {
    name: 'purple-wave-auction',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_tables',
        description: 'List all tables available for querying. Returns the allowlisted tables that can be accessed through this MCP server.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'describe_table',
        description: 'Get the schema of an allowed table, including column names, data types, and nullability. Use this to understand table structure before writing queries.',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: {
              type: 'string',
              description: 'Name of the table to describe (must be in allowlist)',
            },
          },
          required: ['table_name'],
        },
      },
      {
        name: 'query_database',
        description: 'Execute a read-only SQL query against the allowed tables. Only SELECT queries are permitted. The query will be validated to ensure it only accesses allowlisted tables.',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL SELECT query to execute',
            },
          },
          required: ['sql'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_tables') {
      const tables = await listTables();
      return {
        content: [{
          type: 'text',
          text: `Available tables:\n${tables.map(t => `  - ${t}`).join('\n')}`,
        }],
      };
    }

    if (name === 'describe_table') {
      const input = DescribeTableInputSchema.parse(args);
      const columns = await describeTable(input.table_name);
      const formatted = columns.map(c => 
        `  ${c.column_name}: ${c.data_type}${c.is_nullable ? ' (nullable)' : ''}`
      ).join('\n');
      return {
        content: [{
          type: 'text',
          text: `Table: ${input.table_name}\nColumns:\n${formatted}`,
        }],
      };
    }

    if (name === 'query_database') {
      const input = QueryDatabaseInputSchema.parse(args);
      const result = await executeQuery(input.sql);
      
      // Format as simple table
      let output = `Query returned ${result.row_count} rows.\n\n`;
      
      if (result.row_count > 0) {
        // Add column headers
        output += result.columns.join(' | ') + '\n';
        output += result.columns.map(() => '---').join(' | ') + '\n';
        
        // Add rows (limit to 100 for readability)
        const displayRows = result.rows.slice(0, 100);
        for (const row of displayRows) {
          output += result.columns.map(col => String(row[col] ?? 'NULL')).join(' | ') + '\n';
        }
        
        if (result.row_count > 100) {
          output += `\n... and ${result.row_count - 100} more rows`;
        }
      }
      
      return {
        content: [{ type: 'text', text: output }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Purple Wave Auction MCP server v2.0 running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
