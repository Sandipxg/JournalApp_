# Orchid ORM Learning Guide

*This document captures the concepts discussed while migrating the Journal App's raw PostgreSQL queries to Orchid ORM.*

---

## 1. Defining the Database Structure

### The Old Way (Raw SQL)
Previously, the table was defined only when the app started using a giant string of raw SQL:

```typescript
await pool.query(`
  CREATE TABLE IF NOT EXISTS entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  )
`)
```
**The Flaw:** Because it's just a raw text string, TypeScript has no idea what an "entry" actually looks like. If you incorrectly typed `name` instead of `title` somewhere else in your code, TypeScript couldn't warn you, causing the app to crash during execution.

### The New Way (Orchid ORM Schema)
Now, the table definition lives directly in TypeScript using a class structure:

```typescript
// server/db/EntryTable.ts
import { BaseTable } from './baseTable.js';

export class EntryTable extends BaseTable {
  readonly table = 'entries'; // This tells the ORM the exact name of the table in Postgres

  columns = this.setColumns((t) => ({
    id: t.identity().primaryKey(), // Exactly like "GENERATED ALWAYS AS IDENTITY"
    title: t.text(),               // Exactly like "TEXT NOT NULL"
    content: t.text(),             // Exactly like "TEXT NOT NULL"
  }));
}
```
**The Benefit:** By using `this.setColumns`, TypeScript now intuitively knows the exact structure of your data. It understands that `title` is a string and `id` is an auto-generating number.

---

## 2. The Database Connection & The Smart Librarian

### The Old Way (A Blind Telephone Operator)
```typescript
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
```
Using raw `pg.Pool` is like asking a blindfolded telephone operator for books. You give the operator an address (`DATABASE_URL`) and ask for things from a room called "entries", but the operator has no actual map of that room. It's a pipeline that only accepts text strings.

### The New Way (A Smart Librarian)
```typescript
// server/db/db.ts
import { orchidORM } from 'orchid-orm/node-postgres';
import { EntryTable } from './EntryTable.js';

export const db = orchidORM(
  { databaseURL: process.env.DATABASE_URL }, // The address of the library
  { 
    entry: EntryTable // The map of the library!
  }
);
```
`orchidORM` acts as a highly trained librarian. 
1. The first argument tells the ORM **where** the database is to connect to it.
2. The second argument tells the ORM **what** the database looks like by giving it the map (`EntryTable`) you created earlier, and tying it to the label `entry`.

Because of this, when you type `db.entry` anywhere in your code, your editor instantly knows all the columns attached to it and provides perfect auto-completion.

**What happened to the Connection Pool?**
The pool still exists, but Orchid ORM manages it entirely in the background. When you call an Orchid ORM method (like `db.entry.create()`), the ORM automatically borrows a connection from its internal pool, runs the compiled SQL, and returns the connection. You no longer have to manage connections manually.

---

## 3. Fetching Data (GET)

### The Old Way
```typescript
const result = await pool.query('SELECT * FROM entries ORDER BY id DESC')
res.json(result.rows) // Result is ANY type. Unsafe!
```

### The New Way
```typescript
const entries = await db.entry.order({ id: 'DESC' })
res.json(entries)
```
**The Breakdown:**
* `db.entry`: Points to your mapped table.
* `.order({ id: 'DESC' })`: A built-in function mapping exactly to `ORDER BY id DESC`.
* **The Benefit:** Instead of receiving a massive object containing metadata and having to extract `result.rows` manually, Orchid ORM hands you a perfectly typed array of objects right away: `[{ id: 1, title: 'Hello', content: 'World' }]`.

---

## 4. Creating Data (POST)

### The Old Way
```typescript
const result = await pool.query(
  'INSERT INTO entries (title, content) VALUES ($1, $2) RETURNING *',
  [title, content]
)
res.json(result.rows[0])
```

### The New Way
```typescript
const newEntry = await db.entry.create({ title, content })
res.json(newEntry)
```
**The Breakdown:**
* `.create()` generates the `INSERT INTO` query behind the scenes.
* Because `id` was defined with `.identity().primaryKey()` in the `EntryTable` schema, `create()` knows it shouldn't ask you for an ID; it generates one automatically.
* It behaves identically to `RETURNING *`, meaning `newEntry` is instantly the fully-formed database row, including its newly generated ID. No more `result.rows[0]` needed!

---

## 5. Deleting Data (DELETE) & Chaining

### The Old Way
```typescript
await pool.query('DELETE FROM entries WHERE id = $1', [req.params.id])
```

### The New Way
```typescript
await db.entry.find(Number(req.params.id)).delete()
```
**The Breakdown:**
This illustrates a core ORM pattern called **Chaining**. 
Instead of writing a single large string ("DELETE FROM entries WHERE id = 1"), you chain small methods together step-by-step.
1. `.find(id)`: A shortcut tied directly to the `primaryKey` you defined. It translates to `WHERE id = [value]`. (We wrap the URL parameter in `Number()` since URL params come in as strings).
2. `.delete()`: Executes the deletion on whatever `.find()` located.

---

## What's Next? (The Learning Roadmap)

**Phase 1: The Basics (Completed)**
✅ Define a Base Table and Schema
✅ Initialize the DB connection map
✅ Perform standard operations (`create`, `order`, `find`, `delete`)

**Phase 2: Updating & Selecting Data**
* Challenge 1: Implement a `PUT /api/entries/:id` endpoint using the `.update()` method.
* Challenge 2: Use the `.select()` method to fetch *only* titles from the database to save bandwidth.

**Phase 3: Validation integration**
* Challenge: Explore how adding `t.text().min(5)` to your schema automatically rejects short titles and integrates seamlessly with oRPC's Zod concepts.

**Phase 4: Table Relations**
* Challenge: Create a `UserTable`, add an `authorId` to the `EntryTable`, and use the ORM's relational mappings (`hasMany` and `belongsTo`) to easily fetch connected relational data in single, optimized queries.

---

## 6. Cheat Sheet: Raw PostgreSQL vs Orchid ORM

Here is a quick reference table showing common raw SQL queries and their direct Orchid ORM equivalents.

| Operation | Old (Raw PostgreSQL query) | New (Orchid ORM Method) | Notes |
| :--- | :--- | :--- | :--- |
| **SELECT All** | `SELECT * FROM entries` | `db.entry` | By default, referencing the table acts as a `SELECT *` |
| **SELECT Specific Columns** | `SELECT title, content FROM entries` | `db.entry.select('title', 'content')` | Saves bandwidth, returns strongly typed objects with only those keys. |
| **WHERE Clause** | `SELECT * FROM entries WHERE title = 'Hello'` | `db.entry.where({ title: 'Hello' })` | Find multiple rows matching exact conditions. |
| **Primary Key Find** | `SELECT * FROM entries WHERE id = 1 LIMIT 1` | `db.entry.find(1)` | Shortcut for primary key lookups. Will throw an error if not found. |
| **ORDER BY** | `SELECT * FROM entries ORDER BY id DESC` | `db.entry.order({ id: 'DESC' })` | Sorts the result. |
| **LIMIT** | `SELECT * FROM entries LIMIT 10` | `db.entry.limit(10)` | Restricts the number of returned rows. |
| **INSERT ONE** | `INSERT INTO entries (title, content) VALUES ('A', 'B') RETURNING *` | `db.entry.create({ title: 'A', content: 'B' })` | Automatically returns the complete row including the auto-generated ID. |
| **INSERT MANY** | `INSERT INTO entries (title) VALUES ('A'), ('B')` | `db.entry.createMany([{ title: 'A' }, { title: 'B' }])` | Passing an array of objects inserts multiple rows. |
| **UPDATE** | `UPDATE entries SET title = 'New' WHERE id = 1` | `db.entry.find(1).update({ title: 'New' })` | You first find the rows you want to update, then chain `.update()`. |
| **DELETE** | `DELETE FROM entries WHERE id = 1` | `db.entry.find(1).delete()` | Similar to update, you find the records first, then call `.delete()`. |
| **Count Rows** | `SELECT COUNT(*) FROM entries` | `db.entry.count()` | Returns the number of rows as a number. |
| **Raw Query** | `SELECT * FROM entries WHERE id = $1` | `db.$query\`SELECT * FROM entries WHERE id = ${id}\`` | Safely runs executing raw SQL with parameter binding. |

---

## 7. How Automatic Migrations Work (rake-db)

Think of `rake-db` as the bridge between your **TypeScript Code** and your **PostgreSQL Database**.

### How it works
Imagine this scenario:

1.  **You open `EntryTable.ts`** and add a new column: `createdAt: t.timestamps().createdAt`.
2.  **You go to your terminal** and type `npm run db pull`.
3.  **When you run that command**, rake-db wakes up and does the following:

- "Let me look at `EntryTable.ts`. Ah, I see a `createdAt` column here."
- "Let me look at the actual PostgreSQL database. Hmm, there is no `createdAt` column in the database yet."
- "I will automatically generate a new file called `0002_add_createdAt_to_entries.ts` and write the code to create the column."

This ensures your **Code (TypeScript Types)** and **Database (Schema)** are always in sync without you ever writing raw SQL migrations by hand.

