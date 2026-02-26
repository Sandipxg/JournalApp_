import { db } from './db/db.js'

async function debug() {
    try {
        const entries = await db.entry.order({ id: 'DESC' })
        console.log('Entries:', JSON.stringify(entries, null, 2))
    } catch (err) {
        console.error('Error fetching entries:', err)
    } finally {
        await db.$close()
    }
}

debug()
