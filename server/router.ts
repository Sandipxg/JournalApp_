import { implement } from '@orpc/server'
import { contract } from '../shared/contract.js'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const i = implement(contract)

const router = {
    getEntries: i.getEntries.handler(async () => {
        const result = await pool.query('SELECT * FROM entries ORDER BY id DESC')
        return result.rows
    }),

    addEntry: i.addEntry.handler(async ({ input }) => {
        const { title, content } = input
        const result = await pool.query(
            'INSERT INTO entries (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        )
        return result.rows[0]
    }),

    deleteEntry: i.deleteEntry.handler(async ({ input }) => {
        await pool.query('DELETE FROM entries WHERE id = $1', [input.id])
        return { success: true }
    }),

    updateEntry: i.updateEntry.handler(async ({ input }) => {
        const { id, title, content } = input

        let result;
        if (title && content) {
            result = await pool.query(
                'UPDATE entries SET title = $1, content = $2 WHERE id = $3 RETURNING *',
                [title, content, id]
            )
        } else if (title) {
            result = await pool.query(
                'UPDATE entries SET title = $1 WHERE id = $2 RETURNING *',
                [title, id]
            )
        } else if (content) {
            result = await pool.query(
                'UPDATE entries SET content = $1 WHERE id = $2 RETURNING *',
                [content, id]
            )
        } else {
            result = await pool.query('SELECT * FROM entries WHERE id = $1', [id])
        }

        return result.rows[0]
    }),
}

export type AppRouter = typeof router
export { router, pool }
