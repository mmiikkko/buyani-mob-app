import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { user } from '../db/schema.js';

dotenv.config();

async function testConnection() {
  const dbUri = process.env.DB_URI || 'mysql://user:password@localhost:3306/buyani';
  
  console.log('🔍 Testing database connection...');
  console.log(`📡 Connection URI: ${dbUri.replace(/:[^:@]+@/, ':****@')}`); // Hide password

  try {
    // Create connection pool
    const pool = mysql.createPool({ uri: dbUri });
    const db = drizzle(pool);

    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const connection = await pool.getConnection();
    console.log('✅ Connection pool created successfully');
    connection.release();

    // Test 2: Query database
    console.log('\n2️⃣ Testing database query...');
    try {
      const result = await db.select().from(user).limit(1);
      console.log(`✅ Database query successful (found ${result.length} users)`);
    } catch (queryError: any) {
      if (queryError.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️  User table does not exist yet. This is okay if you haven\'t run migrations.');
        console.log('   The connection is working, but tables need to be created.');
      } else {
        throw queryError;
      }
    }

    // Test 3: Check database name
    console.log('\n3️⃣ Checking database info...');
    const [rows] = await pool.execute('SELECT DATABASE() as db_name, VERSION() as version');
    const dbInfo = rows as any[];
    if (dbInfo.length > 0) {
      console.log(`✅ Connected to database: ${dbInfo[0].db_name || 'N/A'}`);
      console.log(`   MySQL version: ${dbInfo[0].version || 'N/A'}`);
    }

    // Close connection
    await pool.end();
    
    console.log('\n✅ All connection tests passed!');
    console.log('🎉 Database connection is working correctly.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed!');
    console.error('Error details:', error.message);
    console.error('Error code:', error.code || 'N/A');
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible issues:');
      console.error('   - MySQL server is not running');
      console.error('   - Wrong host or port in DB_URI');
      console.error('   - Start MySQL service: net start MySQL80 (Windows)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message?.includes('Access denied')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Wrong username or password in DB_URI');
      console.error('   - User does not have access to the database');
      console.error('   - Check your .env file: server/.env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database does not exist');
      console.error('   - Create the database first: CREATE DATABASE buyani;');
    } else if (error.message?.includes('username') || error.message?.includes('password')) {
      console.error('\n💡 The .env file still has placeholder values!');
      console.error('   - Update server/.env with your actual MySQL credentials');
      console.error('   - Format: DB_URI=mysql://root:yourpassword@localhost:3306/buyani');
    }
    
    process.exit(1);
  }
}

testConnection();

