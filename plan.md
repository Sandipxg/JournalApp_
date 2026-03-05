# JournalApp — Request Flow Learning Plan

> Full login-to-endpoint flow, broken into 9 phases.
> Each phase builds on the previous one.

---

## 📌 Agent Instructions (NEVER SKIP THESE)

> These rules apply every single session, every single phase.

### Rule 1 — Subpart by subpart (STRICT)
Before starting any phase, first LIST all subparts of that phase clearly numbered.
Then explain ONLY ONE subpart per message.
STOP completely after that subpart ends.
WAIT for the user's reply before moving forward.
Even if the user just says "ok" or "next" — that counts as a signal to continue.
⛔ Never explain two subparts in one message. No exceptions.

### Rule 2 — Line-level explanation
Every code block must be explained line by line.
Format: "Line X — [what this line does in plain english]"
Never show a code block without explaining every relevant line.

### Rule 3 — Code diff: Without vs With
When introducing any technology (Zod, oRPC, BetterAuth, etc.) always show TWO versions:

❌ WITHOUT the technology — raw, manual, plain JavaScript/TypeScript
✅ WITH the technology — the actual code used in this project

The user must see WHY the technology exists, not just what it does.

### Rule 4 — Assume zero knowledge
Treat the user as completely new to every technology in this stack.
Do not assume the user knows what HTTP, cookies, middleware, or TypeScript generics are.
If a concept is needed to explain something, explain the concept first, briefly.

### Rule 5 — Depth over speed
It is perfectly fine to spend multiple days on one phase, or even one subpart.
Never rush. The goal is for the user to be able to recall the concept from memory.

### Rule 6 — Knowledge check (optional)
At the end of each phase, optionally ask the user 1-2 questions to verify understanding before moving to the next phase.

### Rule 7 — Always consult the `/docs` folder
The project has a `/docs` folder at `c:\Users\mrsan\Desktop\JournalApp_\docs\` with these files:

| File | Covers |
|------|--------|
| `zod_notes.md` | Zod — schemas, validation, `z.infer` |
| `orpc_notes.md` | oRPC — contract, handler, client |
| `ORCHID_LEARNING.md` | Orchid ORM — queries, migrations, models |

Before explaining any concept related to Zod, oRPC, or Orchid ORM:
1. Read the relevant doc file first using `view_file`.
2. Use the examples and notes from that file as the basis for the explanation.
3. Reference real code from the doc when possible — don't rely only on generic examples.

---

## 🧠 Knowledge Level Assessment

Based on the user's instructions and questions so far:

| Area | Level |
|------|-------|
| TypeScript basics | Beginner |
| React / JSX | Familiar (uses it but may not know internals) |
| HTTP / fetch / REST | Beginner-intermediate |
| Express.js | Beginner |
| Zod | New |
| oRPC | New |
| BetterAuth | New |
| Cookies / Sessions | Beginner |
| PostgreSQL / ORM | Beginner |

**Implication**: Explain every technology from scratch. Do not skip concepts like "what is a schema", "what is middleware", "what is a cookie", etc.

---

## 🗺️ Phase Overview

| # | Phase | Core Technology | File(s) |
|---|-------|-----------------|---------|
| 1 | Contract Layer | Zod + oRPC Contract | `shared/contract.ts` |
| 2 | Auth Setup | BetterAuth | `server/auth.ts`, `lib/auth-client.ts` |
| 3 | Login Flow | BetterAuth Client + react-hook-form | `App.tsx` |
| 4 | Session & Cookie | HTTP Cookies, BetterAuth sessions | Browser + `server/auth.ts` |
| 5 | Express Server & Routing | Express.js, CORS, Middleware | `server/server.ts` |
| 6 | Context Injection | oRPC Context | `server/server.ts`, `server/router.ts` |
| 7 | oRPC Handler | oRPC, Orchid ORM | `server/router.ts` |
| 8 | oRPC Client | oRPC Client, fetch | `my-react-app/src/rpc.ts` |
| 9 | UI Reaction | React state, useEffect | `App.tsx` |

---

## Phase 1: Contract Layer

**File:** `shared/contract.ts`
**Technologies:** Zod, oRPC Contract

**What you'll understand by the end of this phase:**
- What Zod is and why we use it instead of plain TypeScript types
- What a "contract" means in this architecture
- Why this file lives in `/shared/` (between frontend and backend)
- How the contract connects to the oRPC handler and oRPC client
- What happens at runtime if someone sends wrong data

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 1.1 | What is Zod and why does it exist? | Zod vs plain TypeScript, runtime validation |
| 1.2 | What is `EntrySchema` and how to read it | Line-by-line Zod schema breakdown |
| 1.3 | What is `z.infer<>` and why is it needed | TypeScript type inference from Zod |
| 1.4 | What is `@orpc/contract` and `oc.router()` | The contract concept, without vs with oRPC |
| 1.5 | Reading each endpoint in the contract | `getEntries`, `addEntry`, `deleteEntry`, `updateEntry` line by line |
| 1.6 | Why `/shared/`? The folder architecture | Why neither frontend nor backend owns this file |

---

## Phase 2: Auth Setup

**Files:** `server/auth.ts`, `my-react-app/src/lib/auth-client.ts`
**Technologies:** BetterAuth

**What you'll understand by the end of this phase:**
- What BetterAuth is and what problem it solves
- Why there are two separate files (server vs client)
- What database tables BetterAuth creates automatically
- What `trustedOrigins` is and why it matters
- What Google OAuth is at a high level

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 2.1 | What is authentication and what problem does BetterAuth solve? | Auth from scratch vs using a library |
| 2.2 | `server/auth.ts` — line by line | `betterAuth({})` config, database pool, email/password |
| 2.3 | What tables does BetterAuth create in PostgreSQL? | `user`, `session`, `account` table structure |
| 2.4 | `trustedOrigins` — what is CORS and why does this exist? | CORS explained for beginners |
| 2.5 | `lib/auth-client.ts` — line by line | Why a separate client instance exists |
| 2.6 | Server auth vs Client auth — why two instances? | The asymmetry explained clearly |

---

## Phase 3: Login Flow

**File:** `my-react-app/src/App.tsx` (specifically `onAuthSubmit`)
**Technologies:** react-hook-form, zodResolver, BetterAuth client

**What you'll understand by the end of this phase:**
- How form validation works with react-hook-form + Zod (before hitting the network)
- What `authClient.signIn.email()` sends over the network exactly
- What the server responds with
- How the error state is handled

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 3.1 | What is react-hook-form and why use it? | Without vs with react-hook-form for form state |
| 3.2 | `authSchema` — validating before the request | How zodResolver connects Zod to the form |
| 3.3 | `onAuthSubmit()` — the function step by step | Line-by-line: what runs when user clicks Login |
| 3.4 | What does `authClient.signIn.email()` actually send? | The real HTTP request — URL, method, body |
| 3.5 | Success path vs failure path | `{ error }` destructure, how errors surface to the UI |

---

## Phase 4: Session & Cookie Management

**Files:** Browser DevTools, `server/auth.ts`
**Technologies:** HTTP Cookies, BetterAuth session storage

**What you'll understand by the end of this phase:**
- What a cookie is and how the browser handles it automatically
- The difference between a session token and a JWT
- How BetterAuth stores the session in PostgreSQL
- What `HttpOnly`, `SameSite`, `Secure` cookie flags mean in practice
- Why every future request automatically includes the session cookie

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 4.1 | What is a cookie? How does the browser use it? | Cookie basics from scratch |
| 4.2 | What happens right after a successful login? | `Set-Cookie` header, where it goes |
| 4.3 | Cookie flags — `HttpOnly`, `SameSite`, `Secure` | What each flag does and why it matters |
| 4.4 | Session token vs JWT — what's the difference? | Two approaches to "remembering" who you are |
| 4.5 | How BetterAuth stores sessions in PostgreSQL | The `session` table, expiry, token |
| 4.6 | How `authClient.useSession()` works reactively | How React knows you're logged in |

---

## Phase 5: Database Layer (Orchid ORM)

**Files:** `server/db/EntryTable.ts`, `server/db/db.ts`
**Technologies:** Orchid ORM, PostgreSQL

**What you'll understand by the end of this phase:**
- What an ORM is and why you shouldn't write raw SQL strings
- How to define a database table using TypeScript classes
- How the database connection is managed
- How to write basic queries (CRUD) without SQL

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 5.1 | What is an ORM? | Raw SQL vs Object Relational Mapping |
| 5.2 | The Table Definition (`EntryTable.ts`) | Line-by-line: columns, primary keys, text types |
| 5.3 | The Database Connection (`db.ts`) | The `orchidORM` setup, connecting the table map |
| 5.4 | Fetching & Creating Data | `.order()`, `.create()` vs raw `SELECT` and `INSERT` |
| 5.5 | Deleting Data & Chaining | `.find().delete()` pattern |

---

## Phase 6: Express Server & Routing

**File:** `server/server.ts`
**Technologies:** Express.js, CORS middleware

**What you'll understand by the end of this phase:**
- What Express is and what it does
- What middleware is (the most important Express concept)
- How `app.all()` works and what route priority means
- What CORS is and why `credentials: true` is necessary
- How `toNodeHandler(auth)` adapts BetterAuth into Express

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 6.1 | What is Express.js? What problem does it solve? | Without vs with Express for an HTTP server |
| 6.2 | What is middleware? How does it work in Express? | The middleware chain concept with simple diagrams |
| 6.3 | `app.use(cors({...}))` — CORS explained | Why browsers block cross-origin requests |
| 6.4 | `app.all("/api/auth/*")` — BetterAuth route | Line by line: how auth requests are handled |
| 6.5 | `app.all(['/rpc', '/rpc/*'])` — oRPC route | The full try/catch block, line by line |
| 6.6 | Route registration order — why it matters | What happens if `/rpc` is registered before `/api/auth` |

---

## Phase 7: Context Injection ⭐ (Most Important)

**Files:** `server/server.ts` (lines 49–60), `server/router.ts`
**Technologies:** oRPC context system

**What you'll understand by the end of this phase:**
- Why session lookup happens in `server.ts` and not inside each handler
- What the `context` object is and how it travels to the handler
- How `implement(contract).$context<{...}>()` tells TypeScript what to expect
- Why `user` can be `null` even for requests that reach the router
- The "build once, use everywhere" pattern

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 7.1 | The problem: how do handlers know who the user is? | Without context — what would the code look like? |
| 7.2 | `auth.api.getSession({ headers })` — line by line | What this does, what it returns |
| 7.3 | Building the `context` object | `db`, `user`, `session` — where each comes from |
| 7.4 | `rpcHandler.handle(req, res, { context })` | How context gets passed into the oRPC system |
| 7.5 | `implement(contract).$context<{...}>()` in router.ts | What this TypeScript syntax means |
| 7.6 | Why `user` can be `null` | Unauthenticated requests still reach the handler |

---

## Phase 8: Core oRPC & The Handler

**Files:** `docs/orpc_notes.md`, `server/router.ts`
**Technologies:** oRPC, Orchid ORM

**What you'll understand by the end of this phase:**
- The core philosophy of oRPC (The "Lobby" Strategy)
- How the three layers (Contract, Router, Client) connect
- What `implement(contract)` does (binding rules to logic)
- How the auth guard pattern works
- How `userId` scoping keeps user data private

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 8.1 | The oRPC Philosophy | REST's "Guessing" vs oRPC's "Knowing" |
| 8.2 | The 3-Layer Architecture & The Lobby Strategy | Contract -> Router -> Client. One endpoint (`/rpc`). |
| 8.3 | What does `implement(contract)` do? | Binding the contract shape to actual handler logic |
| 8.4 | Auth guard — `if (!context.user) throw` | Why this is the first line in every handler |
| 8.5 | `getEntries` & `addEntry` handlers | Line-by-line: using Orchid ORM with context user ID |
| 8.6 | `deleteEntry` and `updateEntry` handlers | Line-by-line: scoped queries to prevent data theft |

---

## Phase 9: oRPC Client

**File:** `my-react-app/src/rpc.ts`
**Technologies:** oRPC client, fetch API

**What you'll understand by the end of this phase:**
- What `RPCLink` is and how it wraps `fetch()`
- Why `credentials: 'include'` is required here (sends cookies)
- What `createORPCClient<RouterClient<AppRouter>>` gives you
- How `client.getEntries({})` turns into a real HTTP request
- The full type-safety chain from contract → client

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 9.1 | What is the fetch API? A quick primer | `fetch()` basics — URL, method, body, response |
| 9.2 | What is `RPCLink`? Without vs with oRPC client | Raw fetch vs oRPC client style |
| 9.3 | `credentials: 'include'` — line by line | Why this is critical for cookies |
| 9.4 | `createORPCClient<RouterClient<AppRouter>>` | What this TypeScript generic does |
| 9.5 | How `client.getEntries({})` maps to HTTP | URL, method, body — what actually gets sent |
| 9.6 | The full type-safety chain | From `contract.ts` → `router.ts` → `rpc.ts` → `App.tsx` |

---

## Phase 10: UI Reaction

**File:** `my-react-app/src/App.tsx`
**Technologies:** React hooks, BetterAuth client

**What you'll understand by the end of this phase:**
- How `authClient.useSession()` is reactive (auto-updates the UI)
- Why `isPending` exists and what flickers without it
- How `useEffect` triggers data fetching after login
- How entries are added/deleted locally before server confirms
- How errors from the server surface to the user

### Subparts

| # | Subpart | What it covers |
|---|---------|----------------|
| 10.1 | What is `useSession()` and how is it reactive? | Without vs with — how would you normally check login state? |
| 10.2 | The `isPending` state — why it exists | What happens without it (flash of login screen) |
| 10.3 | `useEffect([session?.user])` — line by line | When it triggers, what it does |
| 10.4 | Adding an entry — local state update | Why `setEntries(prev => [savedEntry, ...prev])` is used |
| 10.5 | Deleting an entry — local state update | `.filter()` and why the UI feels instant |
| 10.6 | UI state machine — tying it all together | `isPending` → `!session` → `session` — the three states |

---

## Study Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (ORM) → Phase 6
                                                          ↓
                              Phase 10 ← Phase 9 ← Phase 8 ← Phase 7 ⭐
```

> Phase 7 (Context Injection) is the architectural centrepiece.
> All other phases either lead up to it or flow from it.
