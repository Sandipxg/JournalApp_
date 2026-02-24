# 🛡️ Zod Master Revision Notes: The Gateway & Type Engine

Zod is a TypeScript-first schema declaration and validation library. In oRPC, Zod is the bridge between **"Data from the Internet"** (Wild) and **"Data in your Code"** (Safe).

---

## 1. The Core Paradox: Runtime vs Compile-time

| Feature | TypeScript (`interface`) | Zod (`z.object`) |
| :--- | :--- | :--- |
| **When?** | During Development (VS Code) | During Execution (In the Browser) |
| **Visibility** | Deleted in the final `.js` build | Stays in the code to check real data |
| **Analogy** | **The Map**: Tells you how the city is *meant* to look. | **The Security Guard**: Actually stops you at the gate. |

### Why use Zod if we have TypeScript?
TypeScript cannot stop a user from typing `"Hello"` into a field that expects a `number`. Zod **can**. Zod verifies the data *as it arrives* from the network.

---

## 2. Syntax Deep-Dive

### A. The Primitive Rules
These ensure the variable is the right **base type**.

```ts
z.string()     // Must be "Hello"
z.number()     // Must be 123
z.boolean()    // Must be true/false
z.date()       // Must be a Date object
```

### B. The Constraint Rules (Modifiers)
These add extra "laws" to the data.

```ts
z.string().min(1)             // Cannot be empty ("")
z.string().email()            // Must be a valid email format
z.number().min(18).max(99)    // Must be between 18 and 99
z.string().optional()         // Can be undefined (optional field)
```

### C. The `coerce` Miracle
**Problem**: Databases often send numbers as strings (e.g. `"1"`). TypeScript would usually error out.
**Solution**: `z.coerce.number()`. Zod will try to "force" (coerce) the input into a number before checking it.

```ts
// If input is "55", Zod turns it into 55 (number)
const IdCheck = z.coerce.number();
```

---

## 3. The "Lazy" Power: `z.infer`
In a traditional app, you have to write a Zod schema AND a TypeScript interface. This is boring and error-prone.

With `z.infer`, you write the schema **once**, and TypeScript copies it automatically.

```ts
// 1. Define the validation (The Guard)
const EntrySchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

// 2. Extract the Type (The Map)
// This line automatically creates: type Entry = { title: string; content: string }
export type Entry = z.infer<typeof EntrySchema>;
```

---

## 4. Complex Structures

### Arrays
```ts
// An array of entry objects
const ListSchema = z.array(EntrySchema);
```

### Objects inside Objects
```ts
const UserSchema = z.object({
  id: z.number(),
  profile: z.object({
    bio: z.string(),
    avatarUrl: z.string().url(), // Validates it's a real URL
  })
});
```

---

## 5. Usage in the Journal App Contract
This is how we tie it all together in `shared/contract.ts`:

```ts
export const contract = oc.router({
  // Rules for the 'Input' (What you send)
  deleteEntry: oc.input(z.object({ id: z.coerce.number() }))
  
  // Rules for the 'Output' (What you get back)
  getEntries: oc.output(z.array(EntrySchema))
})
```

---

## 6. Pro Revision Summary
1.  **Use `.optional()`** for fields that aren't strictly required.
2.  **Use `z.coerce.number()`** for IDs coming from URLs or Databases.
3.  **Always `z.infer`** your types so you never have to write an `interface` manually again.
4.  **Put schemas in `shared/`** so both Frontend and Backend share the exact same security guard.
