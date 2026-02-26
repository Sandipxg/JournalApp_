import { oc } from '@orpc/contract'
import { z } from 'zod'

export const EntrySchema = z.object({
    id: z.coerce.number(),
    title: z.string(),
    content: z.string(),
    userId: z.number(),
})

export type Entry = z.infer<typeof EntrySchema>

export const UserSchema = z.object({
    id: z.number(),
    username: z.string(),
})

export const contract = oc.router({
    register: oc
        .route({ method: 'POST' })
        .input(z.object({
            username: z.string().min(2),
            password: z.string().min(4),
        }))
        .output(UserSchema),

    login: oc
        .route({ method: 'POST' })
        .input(z.object({
            username: z.string(),
            password: z.string(),
        }))
        .output(UserSchema),

    getEntries: oc
        .route({ method: 'GET' })
        .input(z.object({ userId: z.number() }))
        .output(z.array(EntrySchema)),

    addEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            title: z.string().min(1),
            content: z.string().min(1),
            userId: z.number(),
        }))
        .output(EntrySchema),

    deleteEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            id: z.coerce.number(),
            userId: z.number(),
        }))
        .output(z.object({ success: z.boolean() })),

    updateEntry: oc
        .route({ method: 'POST' })
        .input(z.object({
            id: z.coerce.number(),
            title: z.string().optional(),
            content: z.string().optional(),
            userId: z.number(),
        }))
        .output(EntrySchema),
})

export type AppContract = typeof contract
