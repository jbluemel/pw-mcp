import { z } from 'zod';

// Schema for an auction item from the database
export const AuctionItemSchema = z.object({
  item_id: z.string(),
  auction_date: z.string(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  taxonomy_category: z.string().nullable(),
  hammer_price: z.number().nullable(),
  contract_price: z.number().nullable(),
  buyer_premium: z.number().nullable(),
  seller_service_fee: z.number().nullable(),
  lot_fee: z.number().nullable(),
  item_city: z.string().nullable(),
  item_state: z.string().nullable(),
  item_region_name: z.string().nullable(),
  business_category: z.string().nullable(),
  tsm_first_name: z.string().nullable(),
  tsm_last_name: z.string().nullable(),
});

export type AuctionItem = z.infer<typeof AuctionItemSchema>;

// Input schema for getting auction items with filters
export const GetAuctionItemsInputSchema = z.object({
  category: z.string().optional().describe('Filter by taxonomy_category (e.g., "Tractor", "Excavator")'),
  date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
  min_price: z.number().optional().describe('Minimum hammer price'),
  max_price: z.number().optional().describe('Maximum hammer price'),
  limit: z.number().min(1).default(20).describe('Number of results'),
  offset: z.number().min(0).default(0).describe('Offset for pagination'),
});

export type GetAuctionItemsInput = z.infer<typeof GetAuctionItemsInputSchema>;