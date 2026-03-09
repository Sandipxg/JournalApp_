import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { RPCHandler } from '@orpc/server/node'
import { router } from './router.js'
import { db } from './db/db.js'
import { auth } from './auth.js'
import { toNodeHandler } from "better-auth/node"
import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

dotenv.config()

// Ensure to call this before loading any modules that shouldn't be instrumented.
Sentry.init({
  dsn: "https://bd295f340adfd746c67e87f99e219ba6@o4510964654211072.ingest.us.sentry.io/4510964661354496",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app = express()
const PORT = Number(process.env.PORT) || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://journalapp-pi.vercel.app',
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
]

// 1. CORS at the very top to handle all preflights
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// 2. Auth Handler
// BETTER_AUTH_URL and basePath must align with this route
app.all('/api/auth/*', (req, res) => {
  console.log(`[AUTH] ${req.method} ${req.url}`)
  return toNodeHandler(auth)(req, res)
})

// 3. Body Parser and other middleware AFTER auth
app.use(express.json())

const rpcHandler = new RPCHandler(router)

// oRPC endpoint – matches /rpc and any sub-path
app.all(['/rpc', '/rpc/*'], async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any)
    });

    const matched = await rpcHandler.handle(req, res, {
      prefix: '/rpc',
      context: {
        db,
        user: session?.user ?? null,
        session: session?.session ?? null
      }
    })
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
  res.json({ message: 'Journal oRPC API is running with Orchid ORM!' })
})

// Sentry error handler must be registered before any other error middleware, and after all controllers
Sentry.setupExpressErrorHandler(app);

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
