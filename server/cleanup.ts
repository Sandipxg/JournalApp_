import { db } from './db/db.js';

async function cleanup() {
  try {
    const entries = await db.entry.order({ id: 'ASC' });
    console.log('Total entries:', entries.length);
    
    let deletedCount = 0;
    for (const entry of entries) {
      if (typeof entry.userId !== 'string' && entry.userId !== null) {
        console.log(`Deleting entry ${entry.id} with userId type ${typeof entry.userId}`);
        await db.entry.where({ id: entry.id }).delete();
        deletedCount++;
      }
    }
    
    console.log(`Successfully deleted ${deletedCount} incompatible entries.`);
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await db.$close();
  }
}

cleanup();
