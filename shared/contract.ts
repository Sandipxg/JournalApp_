import { oc } from '@orpc/contract'
import { z } from 'zod'

export const EntrySchema = z.object({
    id: z.coerce.number(),
    title: z.string(),
    content: z.string(),
    userId: z.string().nullable(),
})

export type Entry = z.infer<typeof EntrySchema>

export const contract = oc.router({
    getEntries: oc
        .route({ method: 'GET' })
        .input(z.object({ userId: z.string().optional() }))
        .output(z.array(EntrySchema)),

    addEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            title: z.string().min(1),
            content: z.string().min(1),
            userId: z.string().optional(),
        }))
        .output(EntrySchema),

    deleteEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            id: z.coerce.number(),
            userId: z.string().optional(),
        }))
        .output(z.object({ success: z.boolean() })),

    updateEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            id: z.coerce.number(),
            title: z.string().optional(),
            content: z.string().optional(),
            userId: z.string().optional(),
        }))
        .output(EntrySchema),
})

export type AppContract = typeof contract
