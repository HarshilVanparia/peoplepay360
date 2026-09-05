import mysql from 'mysql2/promise';

// Initialize a connection pool to handle concurrent requests efficiently.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'peoplepay360',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Ensure dates are returned as strings to prevent timezone shifts during SSR
  dateStrings: true, 
});

/**
 * Executes a standard parameterized SQL query.
 * Usage: const users = await query('SELECT * FROM employees WHERE department = ?', ['HR']);
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [results] = await pool.execute(sql, params);
  return results as T[];
}

/**
 * Executes a callback within an atomic database transaction.
 * Critical for Payrun generation where partial writes must be rolled back.
 */
export async function transaction<T>(callback: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export default pool;