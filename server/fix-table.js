import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixTable() {
    try {
        console.log("Dropping old entries table...");
        await pool.query('DROP TABLE IF EXISTS entries');

        console.log("Creating new entries table with IDENTITY column...");
        await pool.query(`
      CREATE TABLE entries (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);

        console.log("Table recreated successfully!");
    } catch (err) {
        console.error("Error recreating table:", err);
    } finally {
        await pool.end();
    }
}

fixTable();
