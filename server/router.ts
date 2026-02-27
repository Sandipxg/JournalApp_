import { implement } from '@orpc/server'
import { contract } from '../shared/contract.js'
import { db } from './db/db.js'
import fs from 'fs'

import { auth } from './auth.js'

const i = implement(contract).$context<{
    db: typeof db
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
}>()

const router = {
    getEntries: i.getEntries.handler(async ({ context }) => {
        if (!context.user) throw new Error('Unauthorized')
        return await context.db.entry.where({ userId: context.user.id }).order({ id: 'DESC' })
    }),

    addEntry: i.addEntry.handler(async ({ input, context }) => {
        if (!context.user) throw new Error('Unauthorized')
        const { title, content } = input
        return await context.db.entry.create({
            title,
            content,
            userId: context.user.id
        })
    }),

    deleteEntry: i.deleteEntry.handler(async ({ input, context }) => {
        if (!context.user) throw new Error('Unauthorized')
        const { id } = input
        await context.db.entry.where({ id, userId: context.user.id }).delete()
        return { success: true }
    }),

    updateEntry: i.updateEntry.handler(async ({ input, context }) => {
        if (!context.user) throw new Error('Unauthorized')
        const { id, title, content } = input
        const query = context.db.entry.where({ id, userId: context.user.id })

        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (content !== undefined) updateData.content = content

        if (Object.keys(updateData).length > 0) {
            return await query.update(updateData).select('*').take()
        }

        return await query.select('*').take()
    }),
}

export type AppRouter = typeof router
export { router }
