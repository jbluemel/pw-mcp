import { z } from 'zod';

// Schema for an auction item from the database
export const AuctionItemSchema = z.object({
  unique_id: z.string(),
  auctiondate: z.string(), // ISO date string
  icn: z.string().nullable(),
  model: z.string().nullable(),
  category: z.string().nullable(),
  hammer: z.number().nullable(),
  contract_price: z.number().nullable(),
  seller_service_fee: z.number().nullable(),
  lot_fee: z.number().nullable(),
  power_washing: z.number().nullable(),
  decal_removal: z.number().nullable(),
  total_fees: z.number().nullable(),
});

export type AuctionItem = z.infer<typeof AuctionItemSchema>;

// Input schema for getting auction items with filters
export const GetAuctionItemsInputSchema = z.object({
  category: z.string().optional().describe('Filter by category (e.g., "Heavy Equipment", "Trucks")'),
  date_from: z.string().optional().describe('Start date (ISO format: 2024-01-01)'),
  date_to: z.string().optional().describe('End date (ISO format: 2024-12-31)'),
  min_price: z.number().optional().describe('Minimum hammer price'),
  max_price: z.number().optional().describe('Maximum hammer price'),
  limit: z.number().min(1).max(100).default(20).describe('Number of results (max 100)'),
  offset: z.number().min(0).default(0).describe('Offset for pagination'),
});

export type GetAuctionItemsInput = z.infer<typeof GetAuctionItemsInputSchema>;
