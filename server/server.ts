import express, { Request, Response } from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
// app.listen strictly wants number so..
const PORT = Number(process.env.PORT) || 3001

// Database connection pool ( stock of many connections , users borrows connections and return it to pool after using it )
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for most cloud databases
})

app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  credentials: true
}))
app.use(express.json())

// Initialize the database table
app.listen(PORT, '0.0.0.0', async () => {
  try {
    // We use GENERATED ALWAYS AS IDENTITY for automatic, unique IDs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `)
    console.log('Database initialized')
  } catch (err) {
    console.error('Failed to initialize database (Ensure DATABASE_URL is set)', err)
  }
  console.log(`Server running on port ${PORT}`)
})

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Journal API is running on PostgreSQL!' })
})

app.get('/api/entries', async (req: Request, res: Response) => {
  try {
    // ORDER BY id DESC to place newest entries first
    const result = await pool.query('SELECT * FROM entries ORDER BY id DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error reading entries:', error)
    res.status(500).json({ error: 'Failed to read entries' })
  }
})

app.post('/api/entries', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body
    console.log('Received new entry request:', { title, content })

    // Database now handles ID generation automatically
    const result = await pool.query(
      'INSERT INTO entries (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    )
    console.log('Successfully saved entry:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error adding entry. Details:', error)
    res.status(500).json({
      error: 'Failed to add entry',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

app.delete('/api/entries/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM entries WHERE id = $1', [req.params.id])
    res.json({ message: 'deleted' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})
