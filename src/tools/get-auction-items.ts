import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetAuctionItemsInputSchema, AuctionItemSchema } from '../schemas/types.js';
import { getAuctionItems } from '../db/queries.js';
import { z } from 'zod';

export const getAuctionItemsTool = {
  name: 'get_auction_items',
  description: 'List auction items with optional filters. Returns items with all fields including fees. Use pagination for large result sets.',
  inputSchema: zodToJsonSchema(GetAuctionItemsInputSchema),
  outputSchema: zodToJsonSchema(z.array(AuctionItemSchema)),
  
  async handler(args: any) {
    // Validate and parse input
    const params = GetAuctionItemsInputSchema.parse(args);
    
    // Query database
    const items = await getAuctionItems(params);
    
    // Format response
    const summary = `Found ${items.length} auction items`;
    const details = items.map(item => 
      `${item.unique_id}: ${item.model || 'Unknown'} - $${item.hammer || 0}`
    ).join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${details}`,
        },
      ],
      isError: false,
    };
  },
};
