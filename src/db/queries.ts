import { pool } from './connection.js';
import { GetAuctionItemsInput, AuctionItem } from '../schemas/types.js';

export async function getAuctionItems(params: GetAuctionItemsInput): Promise<AuctionItem[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.category) {
    conditions.push(`taxonomy_category = $${paramIndex++}`);
    values.push(params.category);
  }

  if (params.date_from) {
    conditions.push(`auction_date >= $${paramIndex++}`);
    values.push(params.date_from);
  }

  if (params.date_to) {
    conditions.push(`auction_date <= $${paramIndex++}`);
    values.push(params.date_to);
  }

  if (params.min_price !== undefined) {
    conditions.push(`hammer_price >= $${paramIndex++}`);
    values.push(params.min_price);
  }

  if (params.max_price !== undefined) {
    conditions.push(`hammer_price <= $${paramIndex++}`);
    values.push(params.max_price);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      item_id, auction_date, make, model, taxonomy_category,
      hammer_price, contract_price, buyer_premium,
      seller_service_fee, lot_fee,
      item_city, item_state, item_region_name,
      business_category, tsm_first_name, tsm_last_name
    FROM items
    ${whereClause}
    ORDER BY auction_date DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  values.push(params.limit, params.offset);

  const result = await pool.query(query, values);
  return result.rows;
}

export async function getItemCount(params: Partial<GetAuctionItemsInput>): Promise<number> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.category) {
    conditions.push(`taxonomy_category = $${paramIndex++}`);
    values.push(params.category);
  }

  if (params.date_from) {
    conditions.push(`auction_date >= $${paramIndex++}`);
    values.push(params.date_from);
  }

  if (params.date_to) {
    conditions.push(`auction_date <= $${paramIndex++}`);
    values.push(params.date_to);
  }

  if (params.min_price !== undefined) {
    conditions.push(`hammer_price >= $${paramIndex++}`);
    values.push(params.min_price);
  }

  if (params.max_price !== undefined) {
    conditions.push(`hammer_price <= $${paramIndex++}`);
    values.push(params.max_price);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `SELECT COUNT(*) as count FROM items ${whereClause}`;
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
}