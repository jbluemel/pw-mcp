import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getAuctionItems } from './db/queries.js';
import { GetAuctionItemsInputSchema } from './schemas/types.js';

// Create MCP server
const server = new Server(
  {
    name: 'purple-wave-auction-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_auction_items',
        description: 'List auction items with optional filters. Returns items with all fields including fees.',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category' },
            date_from: { type: 'string', description: 'Start date (ISO format)' },
            date_to: { type: 'string', description: 'End date (ISO format)' },
            min_price: { type: 'number', description: 'Minimum hammer price' },
            max_price: { type: 'number', description: 'Maximum hammer price' },
            limit: { type: 'number', default: 20, description: 'Number of results' },
            offset: { type: 'number', default: 0, description: 'Offset for pagination' },
          },
        },
      },
    ],
  };
});

// Handle tool call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_auction_items') {
    const params = GetAuctionItemsInputSchema.parse(request.params.arguments);
    const items = await getAuctionItems(params);
    
    // Format each item with all fields
    const formattedItems = items.map(item => {
      return `Item ${item.unique_id}:
  Model: ${item.model || 'N/A'}
  Category: ${item.category || 'N/A'}
  Auction Date: ${item.auctiondate || 'N/A'}
  ICN: ${item.icn || 'N/A'}
  Hammer Price: $${item.hammer || 0}
  Contract Price: $${item.contract_price || 0}
  Seller Service Fee: $${item.seller_service_fee || 0}
  Lot Fee: $${item.lot_fee || 0}
  Power Washing: $${item.power_washing || 0}
  Decal Removal: $${item.decal_removal || 0}
  Total Fees: $${item.total_fees || 0}`;
    }).join('\n\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${items.length} items:\n\n${formattedItems}`,
        },
      ],
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Purple Wave Auction MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
