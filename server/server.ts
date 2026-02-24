import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { db } from './db/db.js'

dotenv.config()

const app = express()
// app.listen strictly wants number so..
const PORT = Number(process.env.PORT) || 3001

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
    console.log('Connecting via Orchid ORM...')
    // Removed raw SQL table creation in favor of managing it via Orchid ORM or migrations in the future.
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
    // Fetch all entries, ordered by ID descending
    const entries = await db.entry.order({ id: 'DESC' })
    res.json(entries)
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
    const newEntry = await db.entry.create({ title, content })
    console.log('Successfully saved entry:', newEntry)
    res.json(newEntry)
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
    await db.entry.find(Number(req.params.id)).delete()
    res.json({ message: 'deleted' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})
