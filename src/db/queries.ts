import { pool } from './connection.js';
import { GetAuctionItemsInput, AuctionItem } from '../schemas/types.js';

export async function getAuctionItems(params: GetAuctionItemsInput): Promise<AuctionItem[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build WHERE clause based on provided filters
  if (params.category) {
    conditions.push(`category = $${paramIndex++}`);
    values.push(params.category);
  }

  if (params.date_from) {
    conditions.push(`auctiondate >= $${paramIndex++}`);
    values.push(params.date_from);
  }

  if (params.date_to) {
    conditions.push(`auctiondate <= $${paramIndex++}`);
    values.push(params.date_to);
  }

  if (params.min_price !== undefined) {
    conditions.push(`hammer >= $${paramIndex++}`);
    values.push(params.min_price);
  }

  if (params.max_price !== undefined) {
    conditions.push(`hammer <= $${paramIndex++}`);
    values.push(params.max_price);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      unique_id, auctiondate, icn, model, category, 
      hammer, contract_price,
      seller_service_fee, lot_fee, power_washing, decal_removal, total_fees
    FROM itemsbasics
    ${whereClause}
    ORDER BY auctiondate DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  values.push(params.limit, params.offset);

  const result = await pool.query(query, values);
  return result.rows;
}
