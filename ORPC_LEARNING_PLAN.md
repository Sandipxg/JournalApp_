# 📖 oRPC Complete Learning Plan
**Using your Journal App as the living example throughout.**

---

## 🗺️ Plan Overview

| Phase | Topic | What you'll understand |
|-------|-------|------------------------|
| 1 | Why oRPC exists | The problem it solves vs REST |
| 2 | Core concepts | Contracts, Procedures, Routers |
| 3 | Zod schemas | How inputs/outputs are validated |
| 4 | Server side | Implementing procedures |
| 5 | Client side | Type-safe client, no fetch() |
| 6 | End-to-end flow | How a single request travels |
| 7 | Advanced | Error handling, context, middleware |

---

## Phase 1 — Why oRPC? (The Problem)

### 1.1 The old way — REST + fetch()
In the original Journal App, the frontend talked to the backend like this:

```ts
// ❌ OLD WAY (REST)
const res = await fetch('http://localhost:3001/api/entries')
const data = await res.json()  // TypeScript has NO idea what shape this is
```

**Problems with this:**
- `data` is typed as `any` — TypeScript can't help you
- If you rename a field on the backend (e.g. `title` → `heading`), TypeScript won't warn you
- You must manually write types on both frontend and backend
- You can make typos in URLs and only find out at runtime

### 1.2 The new way — oRPC
```ts
// ✅ NEW WAY (oRPC)
const data = await client.getEntries()
// TypeScript KNOWS data is: { id: number; title: string; content: string }[]
// If backend changes, TypeScript errors immediately on frontend too
```

**oRPC gives you:**
- ✅ Full type safety from database → backend → frontend
- ✅ Auto-completion in your editor
- ✅ Compile-time errors when types don't match
- ✅ No manual type duplication

---

## Phase 2 — Core Concepts

### 2.1 The Three Building Blocks

```
CONTRACT  →  ROUTER (server implementation)  →  CLIENT (frontend)
    ↑                    ↑                            ↑
  Zod schemas        actual logic               type-safe caller
  (shared)           (backend only)             (frontend only)
```

### 2.2 What is a CONTRACT?
A **contract** is a specification — it says:
> "This procedure exists, it accepts THIS input, and returns THIS output."

It does NOT contain any real logic. Think of it as the menu at a restaurant — it lists what's available, not how it's cooked.

```ts
// shared/contract.ts — used by BOTH frontend and backend
import { oc } from '@orpc/contract'
import { z } from 'zod'

export const contract = oc.router({
  getEntries: oc
    .output(z.array(EntrySchema)),   // No input needed, output is an array of entries

  addEntry: oc
    .input(z.object({               // Requires: title + content
      title: z.string().min(1),
      content: z.string().min(1),
    }))
    .output(EntrySchema),            // Returns: the newly created entry
})
```

### 2.3 What is a ROUTER?
A **router** is the actual implementation on the backend. It takes the contract and fills in the real code.

```ts
// server/router.ts — backend ONLY
const router = implement(contract).router({
  getEntries: implement(contract).getEntries.handler(async () => {
    // Real database query goes here
    const result = await pool.query('SELECT * FROM entries')
    return result.rows
  }),
})
```

### 2.4 What is a CLIENT?
A **client** is an object on the frontend that lets you call backend procedures as if they were local async functions.

```ts
// my-react-app/src/rpc.ts — frontend ONLY
const client = createORPCClient<RouterClient<AppRouter>>(link)

// Usage in React:
const entries = await client.getEntries()  // calls backend over HTTP automatically
```

---

## Phase 3 — Zod Schemas (The Type System)

oRPC uses **Zod** to define and validate the shape of data.

### 3.1 What is Zod?
Zod is a TypeScript-first schema validation library. You write schemas, and Zod:
1. Creates TypeScript types for you automatically
2. Validates real data at runtime

### 3.2 Basic Zod syntax used in our app

```ts
import { z } from 'zod'

// Primitive types
z.string()          // any string
z.number()          // any number
z.boolean()         // true or false

// String with constraints
z.string().min(1)   // string with at least 1 character
z.string().max(100) // string with at most 100 characters
z.string().email()  // must be a valid email

// Numbers
z.number()
z.coerce.number()   // tries to convert input to number first (e.g. "5" → 5)

// Objects
z.object({
  id: z.number(),
  title: z.string(),
})

// Arrays
z.array(z.string())          // array of strings
z.array(EntrySchema)         // array of entries

// Optional fields
z.object({
  title: z.string().optional(),  // title field is not required
})
```

### 3.3 Our EntrySchema explained line by line

```ts
export const EntrySchema = z.object({
  id: z.coerce.number(),   // "coerce" = convert "1" string to 1 number
                           // (PostgreSQL sometimes returns numbers as strings)
  title: z.string(),       // must be a string
  content: z.string(),     // must be a string
})

// Zod automatically gives you this TypeScript type:
// type Entry = { id: number; title: string; content: string }
export type Entry = z.infer<typeof EntrySchema>
// z.infer<> extracts the TypeScript type FROM the Zod schema
```

---

## Phase 4 — Server Side Implementation

### 4.1 File: `shared/contract.ts`

```ts
import { oc } from '@orpc/contract'   // oc = "orpc contract" builder
import { z } from 'zod'

// oc.router({}) creates a collection of procedure definitions
export const contract = oc.router({

  // PROCEDURE 1: getEntries
  // no .input() = takes no parameters
  getEntries: oc
    .output(z.array(EntrySchema)),    // returns an array of entries

  // PROCEDURE 2: addEntry
  addEntry: oc
    .input(z.object({                 // .input() defines what the caller must send
      title: z.string().min(1),
      content: z.string().min(1),
    }))
    .output(EntrySchema),             // .output() defines what the server returns

  // PROCEDURE 3: deleteEntry
  deleteEntry: oc
    .input(z.object({
      id: z.coerce.number(),
    }))
    .output(z.object({ success: z.boolean() })),

  // PROCEDURE 4: updateEntry
  updateEntry: oc
    .input(z.object({
      id: z.coerce.number(),
      title: z.string().optional(),   // optional = may or may not be provided
      content: z.string().optional(),
    }))
    .output(EntrySchema),
})
```

### 4.2 File: `server/router.ts`

```ts
import { implement } from '@orpc/server'  // implement() connects contract to real code
import { contract } from '../shared/contract.js'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// implement(contract) reads the contract and creates a typed builder
const i = implement(contract)

export const router = i.router({        // .router({}) = implement all procedures

  // Implements getEntries from the contract
  // handler() receives a context object and must return the contract's output type
  getEntries: i.getEntries.handler(async () => {
    //                                    ↑ async () = the actual function
    const result = await pool.query('SELECT id, title, content FROM entries ORDER BY id DESC')
    return result.rows   // TypeScript knows this must be Entry[]
  }),

  addEntry: i.addEntry.handler(async ({ input }) => {
    //                                   ↑ input = already validated by Zod
    //                                     input.title is guaranteed to be a string
    const result = await pool.query(
      'INSERT INTO entries (title, content) VALUES ($1, $2) RETURNING *',
      [input.title, input.content]
    )
    return result.rows[0]   // TypeScript knows this must match EntrySchema
  }),

  deleteEntry: i.deleteEntry.handler(async ({ input }) => {
    await pool.query('DELETE FROM entries WHERE id = $1', [input.id])
    return { success: true }   // Must match { success: boolean }
  }),

  updateEntry: i.updateEntry.handler(async ({ input }) => {
    const result = await pool.query(
      'UPDATE entries SET title = COALESCE($1, title), content = COALESCE($2, content) WHERE id = $3 RETURNING *',
      [input.title, input.content, input.id]
    )
    return result.rows[0]
  }),
})

export type AppRouter = typeof router   // exports the type for the client to use
```

### 4.3 File: `server/server.ts`

```ts
import express from 'express'
import { RPCHandler } from '@orpc/server/node'  // Node.js HTTP adapter
import { router } from './router.js'

const app = express()
app.use(express.json())
app.use(cors())

// RPCHandler wraps your router and knows how to handle HTTP requests
const rpcHandler = new RPCHandler(router)

// Mount it at /rpc — all oRPC calls go through this single endpoint
app.all(['/rpc', '/rpc/*'], async (req, res) => {
  //  ↑ app.all = handle GET, POST, DELETE... all HTTP methods
  
  const matched = await rpcHandler.handle(req, res, {
    prefix: '/rpc'  // tells oRPC to strip /rpc from the path before routing
  })
  
  if (!matched.matched) {
    res.status(404).json({ error: 'Not Found' })
  }
})

app.listen(3001)
```

**Key insight**: oRPC uses a SINGLE `/rpc` endpoint. The procedure name is encoded in the URL path:
- `getEntries` → `POST /rpc/getEntries`
- `addEntry` → `POST /rpc/addEntry`

---

## Phase 5 — Client Side

### 5.1 File: `my-react-app/src/rpc.ts`

```ts
import { createORPCClient } from '@orpc/client'    // creates the client
import { RPCLink } from '@orpc/client/fetch'        // fetches over HTTP
import type { RouterClient } from '@orpc/server'   // type helper
import type { AppRouter } from '@server/router'    // the server's router type

// Step 1: Create a "link" (this is the transport layer — how to send requests)
const link = new RPCLink({
  url: 'http://localhost:3001/rpc',    // where to send requests
})

// Step 2: Create the client
// RouterClient<AppRouter> = convert the server's router type into client-callable methods
export const client = createORPCClient<RouterClient<AppRouter>>(link)

// Now client has the exact same shape as your router:
// client.getEntries()         → calls GET /rpc/getEntries
// client.addEntry({ ... })    → calls POST /rpc/addEntry
// client.deleteEntry({ id })  → calls POST /rpc/deleteEntry
```

### 5.2 Using the client in React (`App.tsx`)

```tsx
import { client } from './rpc'
import type { Entry } from '@shared/contract'

function App() {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await client.getEntries()
      // data is typed as Entry[] — no casting needed!
      setEntries(data)
    }
    load()
  }, [])

  const addEntry = async () => {
    const newEntry = await client.addEntry({
      title: currentTitle,    // TypeScript checks these match the contract's input
      content: currentEntry,
    })
    // newEntry is typed as Entry — no casting needed!
    setEntries(prev => [newEntry, ...prev])
  }

  const deleteEntry = async (id: number) => {
    const result = await client.deleteEntry({ id })
    // result is typed as { success: boolean }
    if (result.success) {
      setEntries(prev => prev.filter(e => e.id !== id))
    }
  }
}
```

---

## Phase 6 — End-to-End Flow (A Single Request)

Let's trace what happens when you call `client.addEntry({ title: 'Hello', content: 'World' })`:

```
FRONTEND                            NETWORK                   BACKEND
─────────                           ───────                   ───────

client.addEntry({                   POST /rpc/addEntry        RPCHandler receives request
  title: 'Hello',          ──────►  Body: {                  │
  content: 'World'                    "title": "Hello",       │ Zod validates the body
})                                    "content": "World"      │ against input schema
                                    }                         │
                                                              │ Calls your handler:
                                                              │ async ({ input }) => {
                                                              │   INSERT INTO entries...
                                                              │   return result.rows[0]
                                                              │ }
                                                              │
                           ◄──────  Response: {              Zod validates the return value
                                    "json": {                 against output schema
                                      "id": 5,
                                      "title": "Hello",
                                      "content": "World"
                                    }
                                    }

Returns: { id: 5, title: 'Hello', content: 'World' }
Typed as: Entry ✅
```

---

## Phase 7 — Advanced Topics (Next Steps)

### 7.1 Error Handling with ORPCError

```ts
import { ORPCError } from '@orpc/server'

handler(async ({ input }) => {
  const entry = await pool.query('SELECT * FROM entries WHERE id = $1', [input.id])
  
  if (entry.rows.length === 0) {
    throw new ORPCError('NOT_FOUND', {    // structured error
      message: 'Entry not found',
    })
  }
  
  return entry.rows[0]
})

// On the frontend, you can catch it:
try {
  await client.deleteEntry({ id: 999 })
} catch (err) {
  if (err instanceof ORPCError) {
    console.log(err.code)     // 'NOT_FOUND'
    console.log(err.message)  // 'Entry not found'
  }
}
```

### 7.2 Context (like middleware / auth)

Context lets you pass data (like a user session) into all procedures:

```ts
// Define context type
type Context = { userId: string }

// Pass context when handling
const rpcHandler = new RPCHandler(router)
app.all('/rpc/*', async (req, res) => {
  const token = req.headers.authorization
  const userId = verifyToken(token)  // your auth logic
  
  await rpcHandler.handle(req, res, {
    prefix: '/rpc',
    context: { userId }       // available in every procedure
  })
})

// Use context in a procedure
i.addEntry.handler(async ({ input, context }) => {
  //                                ↑ context.userId is typed and available
  await pool.query(
    'INSERT INTO entries (title, content, user_id) VALUES ($1, $2, $3)',
    [input.title, input.content, context.userId]
  )
})
```

### 7.3 The `@orpc/client` RPCLink Options

```ts
const link = new RPCLink({
  url: 'http://localhost:3001/rpc',
  
  // Optional: add auth headers automatically
  headers: () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }),
  
  // Optional: custom fetch (for intercepting)
  fetch: (url, init) => {
    console.log('Calling:', url)
    return fetch(url, init)
  }
})
```

---

## 📋 Quick Reference Cheat Sheet

| What | Syntax | File |
|------|--------|------|
| Define a procedure | `oc.input(...).output(...)` | `shared/contract.ts` |
| Define a schema | `z.object({ field: z.string() })` | `shared/contract.ts` |
| Extract TS type | `z.infer<typeof Schema>` | `shared/contract.ts` |
| Implement a procedure | `i.procedureName.handler(async ({ input }) => {...})` | `server/router.ts` |
| Mount oRPC | `app.all('/rpc/*', ...)` | `server/server.ts` |
| Create client | `createORPCClient<RouterClient<AppRouter>>(link)` | `src/rpc.ts` |
| Call a procedure | `await client.procedureName(input)` | `src/App.tsx` |
| Handle errors | `throw new ORPCError('CODE', { message })` | `server/router.ts` |

---

## 🔗 Key Package Roles

| Package | Role |
|---------|------|
| `@orpc/contract` | Build the shared API contract (`.input()`, `.output()`) |
| `@orpc/server` | Implement the contract on the backend |
| `@orpc/server/node` | Adapt the server to work with Node.js HTTP |
| `@orpc/client` | Create a type-safe client |
| `@orpc/client/fetch` | Use browser fetch to transport requests |
| `zod` | Define and validate schemas |

---

## ✅ Learning Checkpoints

- [ ] I understand why oRPC is better than raw `fetch()`
- [ ] I understand what a contract is and why it lives in `shared/`
- [ ] I can write a new Zod schema for a new data type
- [ ] I can add a new procedure to the contract
- [ ] I can implement a new procedure on the server
- [ ] I can call the new procedure from the React frontend
- [ ] I understand how a request flows from browser to database and back
- [ ] I can throw and catch `ORPCError` for proper error handling
- [ ] I understand how `context` works for authentication
