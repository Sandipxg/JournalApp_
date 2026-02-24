import { orchidORM } from 'orchid-orm/node-postgres';
import { EntryTable } from './EntryTable.js';
import dotenv from 'dotenv';

dotenv.config();

export const db = orchidORM(
    {
        databaseURL: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    },
    {
        entry: EntryTable,
    }
);
