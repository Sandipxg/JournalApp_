import { rakeDb } from 'rake-db/node-postgres';
import { BaseTable } from './baseTable.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We must manually configure dotenv here because this script runs independently of server.ts
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const options = [{
    databaseURL: process.env.DATABASE_URL as string,
    ssl: { rejectUnauthorized: false }
}];

const rakeDbResult = rakeDb({
    baseTable: BaseTable,
    migrationsPath: path.join(__dirname, '..', 'migrations'),
    import: (path) => import(path),
});

export const change = rakeDbResult.change;

rakeDbResult.run(options);

/**
 * 4. The Configuration Engine:
 * This part takes the commands you type in the terminal (like `up` or `new`) 
 * and executes them against the database. 
 * - baseTable: Template for migrations (styling & defaults)
 * - migrationsPath: Where to save generated .ts files
 * - import: Helper to dynamically read migration files
 * - export const change: Function used by migration files
 */

