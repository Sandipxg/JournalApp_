# 📖 oRPC Complete Learning Plan
**Using your Journal App as the living example throughout.**

---

## 🗺️ Plan Overview

| Phase | Topic | What you'll understand |
|-------|-------|------------------------|
| 1 | Why oRPC exists | **Before (REST)** vs **After (oRPC)** comparison |
| 2 | The "Contract" | How we define the schema as a single source of truth |
| 3 | Server-Side Syntax | Deep dive into `router.ts` and `server.ts` |
| 4 | Client-Side Syntax | Deep dive into `rpc.ts` and `App.tsx` |
| 5 | Zod & Proper Validation | How to use Zod to prevent bugs |
| 6 | Flow & Error Handling | What happens when things go wrong |

---

## Phase 1 — Why oRPC? (The Code Comparison)

In a traditional project, you have to write code on the backend and frontend separately, and hope they match. With oRPC, they are linked by a **Contract**.

### 1.1 Frontend Request (The UI)

| Before (REST + fetch) | After (oRPC) |
| :--- | :--- |
| ```ts | ```ts |
| // ❌ Manually type the result | // ✅ Result is auto-typed |
| interface JournalEntry { | // No manual interface needed! |
|   id: number; title: string; | |
| } | |
| | |
| const res = await fetch('/api/entries'); | const data = await client.getEntries(); |
| const data: JournalEntry[] = | |
|    await res.json(); | // TypeScript knows 'data' is |
|                      | // Entry[] immediately |
| ``` | ``` |

**The oRPC win:** You don't have to define `interface JournalEntry` twice (once on server, once on client). If the server changes, the client's type updates automatically.

### 1.2 Backend Implementation (The API)

| Before (Express REST) | After (oRPC Router) |
| :--- | :--- |
| ```ts | ```ts |
| // ❌ URL is just a string | // ✅ Procedure is a typed handler |
| app.get('/api/entries', (req, res) => { | getEntries: i.getEntries.handler(async () => { |
|   const entries = await db.getAll(); |   const entries = await db.getAll(); |
|   res.json(entries); |   return entries; |
| }); | }); |
| ``` | ``` |

**The oRPC win:** You don't have to manage long lists of URLs. If you misspell `/api/entriees` in the frontend fetch, REST won't tell you until you refresh the browser. oRPC will give you a red squiggle in VS Code immediately.

---

## Phase 2 — The "Contract" (`shared/contract.ts`)

The **Contract** is the MOST important part. It is a shared file that both your server and your frontend read.

### Syntax Breakdown

```ts
// 1. We create a "builder" named 'oc'
import { oc } from '@orpc/contract'
import { z } from 'zod'

// 2. We define the shape of an entry using Zod
export const EntrySchema = z.object({
  id: z.coerce.number(), // 'coerce' means if db sends "1", convert to 1 (number)
  title: z.string(),     // Must be a string
  content: z.string(),   // Must be a string
})

// 3. We define the API 'Contract'
export const contract = oc.router({
  // Each entry here is a 'Procedure' (like a route)
  getEntries: oc.output(z.array(EntrySchema)),
  
  addEntry: oc
    .input(z.object({      // What the client MUST send
      title: z.string(),
      content: z.string(),
    }))
    .output(EntrySchema),   // What the server MUST return
})
```

---

## Phase 3 — Server-Side Syntax (`server/router.ts`)

The server uses the `implement` function to "fill in" the logic for the contract.

### Syntax Breakdown

```ts
import { implement } from '@orpc/server'
import { contract } from '../shared/contract.js'

// 1. Create the 'implementer' helper
const i = implement(contract)

// 2. Build the router
export const router = i.router({
  
  // Syntax: i.[procedureName].handler(fn)
  getEntries: i.getEntries.handler(async () => {
    // Whatever we return here MUST match the contract output schema!
    return await db.query('SELECT * FROM entries');
  }),

  // { input } is automatically provided and validated by oRPC/Zod
  addEntry: i.addEntry.handler(async ({ input }) => {
    // input.title and input.content are guaranteed to be strings here
    const saved = await db.save(input.title, input.content);
    return saved;
  }),
})
```

---

## Phase 4 — Client-Side Syntax (`src/rpc.ts`)

The client "imports" the types from the backend but doesn't import the code. This is the magic.

```ts
import type { AppRouter } from '@server/router' // IMPORT ONLY TYPES (no logic leaked)
import { createORPCClient } from '@orpc/client'

// createORPCClient takes the server's type as a Generics parameter <...>
export const client = createORPCClient<RouterClient<AppRouter>>(link)
```

**Why do we do this?**
Because now when you type `client.` in your frontend, your code editor (IntelliSense) sees exactly what the server can do.

---

## Phase 5 — Zod: The Gatekeeper (Validation & Types)

oRPC uses a library called **Zod** to handle two things at once:
1. **Validation**: Checking if the data coming from the user is valid (e.g., "Is the email actually an email?").
2. **Type Inference**: Automatically creating TypeScript types so you don't have to write `interface` or `type` manually.

### 5.1 Basic Zod Types
Think of these as the building blocks for your data.

```ts
import { z } from 'zod';

const BasicSchema = z.object({
  username: z.string(),          // Must be a string
  age: z.number(),               // Must be a number
  isActive: z.boolean(),         // Must be true or false
});
```

### 5.2 Modifiers (Constraints)
You can add extra rules to your types.

- `.min(length)` / `.max(length)`: For strings (length) or numbers (value).
- `.optional()`: The field can be missing or `undefined`.
- `.email()`: Validates that a string is a valid email format.

```ts
const UserForm = z.object({
  title: z.string().min(3).max(50), // At least 3 chars, max 50
  bio: z.string().optional(),       // User doesn't HAVE to provide this
  priority: z.number().min(1).max(5), // Must be between 1 and 5
});
```

### 5.3 The Magic of `coerce`
In your project, you'll see `z.coerce.number()`. 
**Why?** Browsers and databases sometimes send numbers as strings (e.g., `"123"` instead of `123`). 
`coerce` tells Zod: *"Try to convert this to a number before validating."*

```ts
// If input is "42", result becomes 42 (number)
// If input is "hello", validation fails!
const IdSchema = z.coerce.number(); 
```

### 5.4 `z.infer` — Writing Zero Types
This is the best part. Instead of writing a TypeScript `interface`, you tell TypeScript to "look at the Zod schema and guess the type."

```ts
const EntrySchema = z.object({ title: z.string() });

// This creates a TypeScript type 'Entry' based on the schema above
type Entry = z.infer<typeof EntrySchema>;

// Now you can use it like any other type:
const myEntry: Entry = { title: "Hello" };
```

---

---

## 📋 Summary Checklist

1. **Contract**: Define **what** the API does (schemas).
2. **Router**: Implement **how** the API does it (database).
3. **Server**: Host the API (express).
4. **Client**: Call the API like a regular JS function.

---

## ✅ Learning Checkpoints

- [ ] Can you explain why we don't need `fetch()` anymore?
- [ ] What happens if you change a field name in `contract.ts`?
- [ ] Why is `z.coerce.number()` used for IDs?
- [ ] Where do we define the "Input" for adding a new journal entry?
