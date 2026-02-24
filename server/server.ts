import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { RPCHandler } from '@orpc/server/node'
import { router, pool } from './router.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

const rpcHandler = new RPCHandler(router)

// oRPC endpoint – matches /rpc and any sub-path
app.all(['/rpc', '/rpc/*'], async (req, res) => {
  try {
    const matched = await rpcHandler.handle(req, res, { prefix: '/rpc' })
    if (!matched.matched) {
      res.status(404).json({ error: 'Not Found' })
    }
  } catch (error) {
    console.error('oRPC Error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Journal oRPC API is running!' })
})

// Server initialization and database setup
app.listen(PORT, '0.0.0.0', async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `)
    console.log('Database initialized and table ensured.')
  } catch (err) {
    console.error('Failed to initialize database (Ensure DATABASE_URL is set)', err)
  }
  console.log(`Server running on port ${PORT}`)
  console.log(`oRPC endpoint: http://localhost:${PORT}/rpc`)
})
