import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getAuctionItems, getItemCount } from './db/queries.js';
import { GetAuctionItemsInputSchema } from './schemas/types.js';

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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_auction_items',
        description: 'List auction items with optional filters. Returns items with pricing, location, and category info. Use count_only=true for "how many" questions.',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by taxonomy_category (e.g., Tractor, Excavator)' },
            date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            min_price: { type: 'number', description: 'Minimum hammer price' },
            max_price: { type: 'number', description: 'Maximum hammer price' },
            limit: { type: 'number', default: 20, description: 'Number of results' },
            offset: { type: 'number', default: 0, description: 'Offset for pagination' },
            count_only: { type: 'boolean', default: false, description: 'Return only the count, not item details' },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_auction_items') {
    const args = request.params.arguments as any;
    
    if (args.count_only) {
      const count = await getItemCount(args);
      return {
        content: [{ type: 'text', text: `Total items: ${count}` }],
      };
    }
    
    const params = GetAuctionItemsInputSchema.parse(args);
    const items = await getAuctionItems(params);
    
    const formattedItems = items.map(item => {
      return `Item ${item.item_id}:
  Make/Model: ${item.make || ''} ${item.model || 'N/A'}
  Category: ${item.taxonomy_category || 'N/A'}
  Auction Date: ${item.auction_date || 'N/A'}
  Location: ${item.item_city || ''}, ${item.item_state || ''}
  Region: ${item.item_region_name || 'N/A'}
  Hammer Price: $${item.hammer_price || 0}
  Contract Price: $${item.contract_price || 0}
  Buyer Premium: $${item.buyer_premium || 0}
  Seller Service Fee: $${item.seller_service_fee || 0}
  Lot Fee: $${item.lot_fee || 0}
  Business Category: ${item.business_category || 'N/A'}
  TSM: ${item.tsm_first_name || ''} ${item.tsm_last_name || ''}`;
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Purple Wave Auction MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});