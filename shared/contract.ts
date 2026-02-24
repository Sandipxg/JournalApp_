import { oc } from '@orpc/contract'
import { z } from 'zod'

export const EntrySchema = z.object({
    id: z.coerce.number(),
    title: z.string(),
    content: z.string(),
})

export type Entry = z.infer<typeof EntrySchema>

export const contract = oc.router({
    getEntries: oc
        .output(z.array(EntrySchema)),

    addEntry: oc
        .input(z.object({
            title: z.string().min(1),
            content: z.string().min(1),
        }))
        .output(EntrySchema),

    deleteEntry: oc
        .input(z.object({
            id: z.coerce.number(),
        }))
        .output(z.object({ success: z.boolean() })),

    updateEntry: oc
        .input(z.object({
            id: z.coerce.number(),
            title: z.string().optional(),
            content: z.string().optional(),
        }))
        .output(EntrySchema),
})

export type AppContract = typeof contract
