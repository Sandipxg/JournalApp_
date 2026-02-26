import { implement } from '@orpc/server'
import { contract } from '../shared/contract.js'
import { db } from './db/db.js'
import fs from 'fs'

const i = implement(contract)

const router = {
    getEntries: i.getEntries.handler(async () => {
        console.log("getEntries handler called")
        try {
            const result = await db.entry.order({ id: 'DESC' })
            fs.writeFileSync('debug.log', `Result Type: ${typeof result}\nIs Array: ${Array.isArray(result)}\nData: ${JSON.stringify(result, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}\n`)
            return result
        } catch (error: any) {
            fs.writeFileSync('debug.log', `Error: ${error.message}\nStack: ${error.stack}\n`)
            console.error("DB Error in getEntries:", error)
            throw error
        }
    }),

    addEntry: i.addEntry.handler(async ({ input }) => {
        const { title, content } = input
        return await db.entry.create({ title, content })
    }),

    deleteEntry: i.deleteEntry.handler(async ({ input }) => {
        await db.entry.find(input.id).delete()
        return { success: true }
    }),

    updateEntry: i.updateEntry.handler(async ({ input }) => {
        const { id, title, content } = input
        const query = db.entry.find(id)

        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (content !== undefined) updateData.content = content

        if (Object.keys(updateData).length > 0) {
            return await query.update(updateData).select('*')
        }

        return await query.select('*')
    }),
}

export type AppRouter = typeof router
export { router }
