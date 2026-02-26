import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { RPCHandler } from '@orpc/server/node'
import { router } from './router.js'
import { db } from './db/db.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

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

app.use(express.json())

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Journal oRPC API is running with Orchid ORM!' })
})

// Server initialization and database setup
app.listen(PORT, '0.0.0.0', async () => {
  try {
    console.log('Connecting via Orchid ORM...')
    // Database connectivity is handled by Orchid ORM
  } catch (err) {
    console.error('Failed to initialize database (Ensure DATABASE_URL is set)', err)
  }
  console.log(`oRPC endpoint: http://localhost:${PORT}/rpc`)
})
