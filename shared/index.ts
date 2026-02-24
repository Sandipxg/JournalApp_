import { z } from 'zod'

export const EntrySchema = z.object({
    id: z.coerce.number(),
    title: z.string(),
    content: z.string(),
})

export type Entry = z.infer<typeof EntrySchema>
