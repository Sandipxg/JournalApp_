import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_FILE = path.join(__dirname, 'entries.json')

try {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]')
    console.log('Created entries.json file')
  }
} catch (error) {
  console.error('Error creating data file:', error)
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Journal API is running!' })
})

app.get('/api/entries', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    res.json(JSON.parse(data))
  } catch (error) {
    console.error('Error reading entries:', error)
    res.status(500).json({ error: 'Failed to read entries' })
  }
})

app.post('/api/entries', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    const entries = JSON.parse(data)
    
    const newEntry = {
      id: Date.now(),
      title: req.body.title,
      content: req.body.content,
    }
    
    entries.unshift(newEntry)
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries))
    res.json(newEntry)
  } catch (error) {
    console.error('Error adding entry:', error)
    res.status(500).json({ error: 'Failed to add entry' })
  }
})

app.delete('/api/entries/:id', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    const entries = JSON.parse(data)
    const newEntries = entries.filter(e => e.id != req.params.id)
    fs.writeFileSync(DATA_FILE, JSON.stringify(newEntries))
    res.json({ message: 'deleted' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
