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

app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`)
  next()
})

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:8080',
  'https://journalapp-pi.vercel.app',
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
]

// 1. CORS at the very top to handle all preflights
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost port in development
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true)
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// 2. Body Parser and other middleware
app.use(express.json())

// 3. Auth Redirection Handler for Mobile/Web (GET)
app.get('/api/auth/social-login/:provider', async (req, res) => {
  const { provider } = req.params;
  const callbackURL = req.query.callbackURL as string || 'http://localhost:8080';
  
  console.log(`[AUTH-LOG] Redirecting to ${provider} with callback: ${callbackURL}`);
  
  try {
    const result = await auth.api.signInSocial({
      body: {
        provider: provider as "google",
        callbackURL: callbackURL,
      },
      headers: new Headers(req.headers as any),
    });

    if (result && result.url) {
      res.redirect(result.url);
    } else {
      res.status(400).send('Failed to initiate social login');
    }
  } catch (error) {
    console.error('[AUTH-LOG] Error during social login initiation:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 4. Main Auth Handler
app.use('/api/auth', (req, res) => {
  console.log(`[AUTH-LOG] ${req.method} ${req.url}`)
  return toNodeHandler(auth)(req, res)
})

const rpcHandler = new RPCHandler(router)

// oRPC endpoint – matches /rpc and any sub-path
app.all(['/rpc', '/rpc/*'], async (req, res) => {
  console.log(`[RPC] ${req.method} ${req.url} | Content-Type: ${req.headers['content-type']} | Body:`, JSON.stringify(req.body))
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any)
    });

    console.log(`[RPC] Session: ${session?.user?.email ?? 'anonymous'}`)

    // Safety net: if the body is not wrapped in "json", wrap it for oRPC
    if (req.method === 'POST' && req.body && !req.body.json && Object.keys(req.body).length > 0) {
      req.body = { json: req.body }
    }

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
  } catch (error: any) {
    console.error('oRPC Error:', error)
    if (error.stack) console.error(error.stack)
    
    // Map specific errors to status codes
    let status = 500
    if (error.message === 'Unauthorized') status = 401

    if (!res.headersSent) {
      res.status(status).json({ 
        error: status === 401 ? 'Unauthorized' : 'Internal Server Error',
        message: error.message,
        details: error.toString()
      })
    }
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Journal oRPC API is running with Orchid ORM!' })
})

// Sentry error handler must be registered before any other error middleware, and after all controllers
// Sentry.setupExpressErrorHandler(app);

// Generic Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[FINAL-ERROR-HANDLER]:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Critical Error', message: err.message });
  }
});

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
