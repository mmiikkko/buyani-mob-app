import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Connection pool creation
// The pool manages multiple connections and reuses them
const pool = mysql.createPool({ 
  uri: process.env.DB_URI 
});

// Wrap the pool with Drizzle ORM to provide a query interface
export const db = drizzle(pool);

// Connection flow:
// 1. Environment Variable (DB_URI) → mysql://username:password@host:port/database_name
// 2. mysql.createPool() → Creates connection pool
// 3. drizzle(pool) → Wraps pool with ORM
// 4. export const db → Exported for use
// 5. Imported in queries/auth/etc → Used throughout app
//
// Important points:
// - Connection pooling: Uses a pool, not a single connection, which improves performance
// - Lazy connection: The pool connects when the first query runs
// - Promise-based: Uses mysql2/promise for async/await support
// - Single instance: The db instance is created once and reused across the app
// - No explicit connect() call needed - the pool handles it automatically

