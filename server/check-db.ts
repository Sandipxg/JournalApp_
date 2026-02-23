import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM entries');
        console.log("--- DATABASE ENTRIES ---");
        console.table(res.rows);
        console.log("------------------------");
    } catch (error) {
        console.error("Error connecting to DB:", error);
    } finally {
        await client.end();
    }
}

run();
