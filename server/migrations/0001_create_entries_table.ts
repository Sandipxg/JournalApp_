import { change } from '../db/config.js';

change(async (db) => {
  // Check if entries table already exists to prevent crashes in prod
  const tableExists = await db.adapter.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)', ['entries']);
  if (tableExists.rows[0].exists) return;

  await db.createTable('entries', (t) => ({
    id: t.identity().primaryKey(),
    title: t.text(),
    content: t.text(),
  }));
});
