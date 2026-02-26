import { implement } from '@orpc/server'
import { contract } from '../shared/contract.js'
import { db } from './db/db.js'
import fs from 'fs'

const i = implement(contract)

const router = {
    register: i.register.handler(async ({ input }) => {
        const { username, password } = input
        const existing = await db.user.where({ username }).exists()
        if (existing) throw new Error('User already exists')

        return await db.user.create({ username, password })
    }),

    login: i.login.handler(async ({ input }) => {
        const { username, password } = input
        const user = await db.user.where({ username, password }).take()
        if (!user) throw new Error('Invalid credentials')
        return user
    }),

    getEntries: i.getEntries.handler(async ({ input }) => {
        return await db.entry.where({ userId: input.userId }).order({ id: 'DESC' })
    }),

    addEntry: i.addEntry.handler(async ({ input }) => {
        const { title, content, userId } = input
        return await db.entry.create({ title, content, userId })
    }),

    deleteEntry: i.deleteEntry.handler(async ({ input }) => {
        const { id, userId } = input
        await db.entry.where({ id, userId }).delete()
        return { success: true }
    }),

    updateEntry: i.updateEntry.handler(async ({ input }) => {
        const { id, title, content, userId } = input
        const query = db.entry.where({ id, userId })

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
