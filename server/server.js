import express from 'express' // create web server for backend 
import cors from 'cors' // port
import fs from 'fs' // file operations

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Get all entries
app.get('/api/entries', (req, res) => {
  const data = fs.readFileSync('entries.json', 'utf-8')
  res.json(JSON.parse(data)) // sends data back to react
})

// Add new entry
app.post('/api/entries', (req, res) => {
  const data = fs.readFileSync('entries.json', 'utf-8')
  const entries = JSON.parse(data)
  
  const newEntry = {
    title: req.body.title,
    content: req.body.content,
  }
  
  entries.unshift(newEntry)
  fs.writeFileSync('entries.json', JSON.stringify(entries))
  res.json(newEntry)
})

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const data = fs.readFileSync('entries.json', 'utf-8')
  const entries = JSON.parse(data)
  const newEntries = entries.filter(e => e.id != req.params.id)
  fs.writeFileSync('entries.json', JSON.stringify(newEntries))
  res.json({ message: 'deleted' })
})

// Create empty file if doesn't exist
if (!fs.existsSync('entries.json')) {
  fs.writeFileSync('entries.json', '[]')
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
