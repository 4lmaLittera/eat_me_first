import * as SQLite from 'expo-sqlite';

// Types
export interface Product {
  id: number;
  name: string;
  image: string | null;
  expiryDate: string;
  category: 'Fridge' | 'Pantry' | 'Freezer';
  quantity: string;
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  status: 'active' | 'consumed' | 'expired';
}

export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'consumedAt' | 'status'>;

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('eatmefirst.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      expiryDate TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Fridge', 'Pantry', 'Freezer')),
      quantity TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      consumedAt TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired'))
    );
  `);
}

// Get database instance
function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// CRUD Operations

export async function insertProduct(product: NewProduct): Promise<number> {
  const database = getDb();
  const result = await database.runAsync(
    `INSERT INTO products (name, image, expiryDate, category, quantity, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      product.name,
      product.image,
      product.expiryDate,
      product.category,
      product.quantity,
      product.notes,
    ]
  );
  return result.lastInsertRowId;
}

export async function getProducts(): Promise<Product[]> {
  const database = getDb();
  const products = await database.getAllAsync<Product>(
    `SELECT * FROM products WHERE status = 'active' ORDER BY expiryDate ASC`
  );
  return products;
}

export async function getProductById(id: number): Promise<Product | null> {
  const database = getDb();
  const product = await database.getFirstAsync<Product>(
    `SELECT * FROM products WHERE id = ?`,
    [id]
  );
  return product;
}

export async function getExpiringProducts(daysThreshold: number = 3): Promise<Product[]> {
  const database = getDb();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  const dateString = thresholdDate.toISOString().split('T')[0];
  
  const products = await database.getAllAsync<Product>(
    `SELECT * FROM products 
     WHERE status = 'active' AND expiryDate <= ? 
     ORDER BY expiryDate ASC`,
    [dateString]
  );
  return products;
}

export async function getProductsByCategory(category: Product['category']): Promise<Product[]> {
  const database = getDb();
  const products = await database.getAllAsync<Product>(
    `SELECT * FROM products 
     WHERE status = 'active' AND category = ? 
     ORDER BY expiryDate ASC`,
    [category]
  );
  return products;
}

export async function updateProduct(id: number, updates: Partial<NewProduct>): Promise<void> {
  const database = getDb();
  const fields: string[] = [];
  const values: (string | null)[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.image !== undefined) {
    fields.push('image = ?');
    values.push(updates.image);
  }
  if (updates.expiryDate !== undefined) {
    fields.push('expiryDate = ?');
    values.push(updates.expiryDate);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.quantity !== undefined) {
    fields.push('quantity = ?');
    values.push(updates.quantity);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  
  if (fields.length > 0) {
    values.push(String(id));
    await database.runAsync(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const database = getDb();
  await database.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
}

export async function markAsConsumed(id: number): Promise<void> {
  const database = getDb();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE products SET status = 'consumed', consumedAt = ? WHERE id = ?`,
    [now, id]
  );
}

export async function markAsExpired(id: number): Promise<void> {
  const database = getDb();
  await database.runAsync(
    `UPDATE products SET status = 'expired' WHERE id = ?`,
    [id]
  );
}

// Utility function to update expired items
export async function updateExpiredProducts(): Promise<void> {
  const database = getDb();
  const today = new Date().toISOString().split('T')[0];
  await database.runAsync(
    `UPDATE products SET status = 'expired' 
     WHERE status = 'active' AND expiryDate < ?`,
    [today]
  );
}

// Get statistics
export async function getStats(): Promise<{
  totalActive: number;
  expiringSoon: number;
  consumed: number;
  expired: number;
}> {
  const database = getDb();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + 3);
  const dateString = thresholdDate.toISOString().split('T')[0];
  
  const stats = await database.getFirstAsync<{
    totalActive: number;
    expiringSoon: number;
    consumed: number;
    expired: number;
  }>(`
    SELECT 
      (SELECT COUNT(*) FROM products WHERE status = 'active') as totalActive,
      (SELECT COUNT(*) FROM products WHERE status = 'active' AND expiryDate <= ?) as expiringSoon,
      (SELECT COUNT(*) FROM products WHERE status = 'consumed') as consumed,
      (SELECT COUNT(*) FROM products WHERE status = 'expired') as expired
  `, [dateString]);
  
  return stats || { totalActive: 0, expiringSoon: 0, consumed: 0, expired: 0 };
}
